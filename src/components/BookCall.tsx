"use client";

import { useEffect, useMemo, useState } from "react";
import { BOOKING_CONFIG, BOOKING_TOPICS, generateSlots } from "@/lib/booking";

const inputCls =
  "w-full rounded-md border border-line bg-bg px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40";

type Day = { key: string; date: Date; slots: string[] };

export default function BookCall() {
  const [tz, setTz] = useState("");
  const [taken, setTaken] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState<string>(BOOKING_TOPICS[0]);
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  // Slots are computed in the browser (depends on "now" + visitor's time zone), so render after mount.
  const [slots, setSlots] = useState<string[]>([]);

  useEffect(() => {
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "");
    setSlots(generateSlots());
  }, []);

  const loadTaken = async () => {
    try {
      const res = await fetch("/api/bookings", { cache: "no-store" });
      const data = await res.json();
      setTaken(new Set<string>(data.taken ?? []));
    } catch {
      /* the server re-checks on submit, so a failed refresh is harmless */
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadTaken();
  }, []);

  // Group by the VISITOR's local calendar day.
  const days: Day[] = useMemo(() => {
    const map = new Map<string, Day>();
    for (const iso of slots) {
      const d = new Date(iso);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, { key, date: d, slots: [] });
      map.get(key)!.slots.push(iso);
    }
    return [...map.values()];
  }, [slots]);

  const freeCount = (d: Day) => d.slots.filter((s) => !taken.has(s)).length;

  useEffect(() => {
    if (!dayKey && days.length) setDayKey((days.find((d) => freeCount(d) > 0) ?? days[0]).key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, taken]);

  const activeDay = days.find((d) => d.key === dayKey);
  const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
  const longFmt = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slot) return setError("Please pick a time first.");
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, topic, notes, slot, timezone: tz, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409 || res.status === 400) {
          setSlot(null);
          loadTaken();
        }
        setError(data.error || "Couldn't book that slot. Please try again.");
        return;
      }
      setDone(slot);
    } catch {
      setError("Network problem — please try again.");
    } finally {
      setSending(false);
    }
  }

  function downloadIcs() {
    if (!done) return;
    const start = new Date(done);
    const end = new Date(start.getTime() + BOOKING_CONFIG.slotMinutes * 60_000);
    const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Bahu Technology//Booking//EN",
      "BEGIN:VEVENT",
      `UID:${f(start)}@bahutechnology`,
      `DTSTAMP:${f(new Date())}`,
      `DTSTART:${f(start)}`,
      `DTEND:${f(end)}`,
      "SUMMARY:Call with Bahu Technology",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "bahu-technology-call.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section id="book-a-call" className="section" aria-labelledby="book-call-title">
      <div className="text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          BOOK A CALL
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="book-call-title" className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Prefer to talk? <span className="text-gold">Pick a time.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          A free {BOOKING_CONFIG.slotMinutes}-minute call to talk through your idea. Times are shown in your local time
          {tz ? ` (${tz.replace(/_/g, " ")})` : ""}.
        </p>
      </div>

      <div className="rgb-box mx-auto mt-10 max-w-4xl rounded-xl p-6 sm:p-8" style={{ ["--box-fill" as string]: "#ffffff" }}>
        {done ? (
          <div className="py-6 text-center" role="status">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl text-emerald-500">✓</div>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">You&apos;re booked!</h3>
            <p className="mt-2 text-sm text-muted">{longFmt.format(new Date(done))}</p>
            <p className="mt-1 text-xs text-muted">We&apos;ll follow up on {email} to confirm and share the meeting details.</p>
            <button type="button" onClick={downloadIcs} className="btn-outline mt-6">
              Add to calendar
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="mb-3 text-xs font-semibold text-ink">1. Choose a day</p>
              {slots.length === 0 && !loading ? (
                <p className="text-sm text-muted">No times are available right now — please send us a message instead.</p>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Available days">
                  {days.map((d) => {
                    const free = freeCount(d);
                    const on = d.key === dayKey;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        disabled={free === 0}
                        onClick={() => {
                          setDayKey(d.key);
                          setSlot(null);
                        }}
                        className={`flex w-16 shrink-0 flex-col items-center rounded-lg border px-2 py-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          on ? "border-gold bg-gold/10 text-gold" : "border-line text-muted hover:border-gold/50"
                        }`}
                      >
                        <span className="text-[10px] font-semibold uppercase">{d.date.toLocaleDateString(undefined, { weekday: "short" })}</span>
                        <span className="font-display text-lg font-semibold text-ink">{d.date.getDate()}</span>
                        <span className="text-[10px]">{d.date.toLocaleDateString(undefined, { month: "short" })}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="mb-3 mt-6 text-xs font-semibold text-ink">2. Choose a time</p>
              {loading && slots.length > 0 ? (
                <p className="text-xs text-muted">Checking availability…</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="group" aria-label="Available times">
                  {activeDay?.slots.map((s) => {
                    const isTaken = taken.has(s);
                    const on = slot === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={isTaken}
                        aria-pressed={on}
                        onClick={() => setSlot(s)}
                        className={`rounded-md border px-2 py-2 text-xs font-semibold transition-colors ${
                          isTaken
                            ? "cursor-not-allowed border-line text-muted/40 line-through"
                            : on
                              ? "border-gold bg-gold text-white"
                              : "border-line text-ink hover:border-gold/60 hover:text-gold"
                        }`}
                      >
                        {timeFmt.format(new Date(s))}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="mt-4 text-[11px] text-muted">
                Our team works {BOOKING_CONFIG.startHour}:00–{BOOKING_CONFIG.endHour}:00 {BOOKING_CONFIG.tzLabel}, Monday to Saturday.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <p className="text-xs font-semibold text-ink">3. Your details</p>
              {slot && (
                <p className="rounded-md bg-gold/10 px-3 py-2 text-xs font-medium text-gold">{longFmt.format(new Date(slot))}</p>
              )}
              <input className={inputCls} required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className={inputCls} required type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className={inputCls} type="tel" placeholder="Phone / WhatsApp (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <select className={inputCls} aria-label="What is the call about?" value={topic} onChange={(e) => setTopic(e.target.value)}>
                {BOOKING_TOPICS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <textarea
                className={inputCls}
                rows={3}
                maxLength={1000}
                placeholder="Anything we should know beforehand? (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
              {error && (
                <p className="text-xs text-rose-500" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" disabled={sending || !slot} className="btn-primary w-full justify-center disabled:opacity-60">
                {sending ? "Booking…" : slot ? "CONFIRM BOOKING" : "PICK A TIME"} <span aria-hidden>→</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
