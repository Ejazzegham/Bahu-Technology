"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BOOKING_CONFIG, BOOKING_TOPICS, generateSlots } from "@/lib/booking";

type Day = { key: string; date: Date; slots: string[] };

/* ---------- tiny inline icons (no extra dependency) ---------- */
const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};
const UserIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const MailIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
const PhoneIcon = () => (
  <svg {...iconProps}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);
const CalendarIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
const ClockIcon = () => (
  <svg {...iconProps} width={15} height={15}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
const ChevronIcon = ({ dir }: { dir: "left" | "right" }) => (
  <svg {...iconProps} width={16} height={16} strokeWidth={2.2}>
    <path d={dir === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
  </svg>
);

/* ---------- shared field styles ---------- */
const fieldCls =
  "w-full rounded-xl border border-line bg-white py-3 pl-11 pr-4 text-sm text-ink shadow-[0_1px_2px_rgba(13,13,16,0.04)] transition placeholder:text-muted/70 hover:border-gold/40 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15";

function Field({ icon, children, className = "" }: { icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3.5 top-3.5 text-muted/70">{icon}</span>
      {children}
    </div>
  );
}

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
  const stripRef = useRef<HTMLDivElement>(null);

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
  const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long" });

  const scrollDays = (dir: -1 | 1) => stripRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });

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

      {/* Centered card — min-w-0 children stop the day strip from pushing the layout wider than the card */}
      <div
        className="rgb-box mx-auto mt-10 w-full max-w-5xl overflow-hidden rounded-2xl shadow-[0_30px_80px_-40px_rgba(20,119,245,0.35)]"
        style={{ ["--box-fill" as string]: "#ffffff" }}
      >
        {done ? (
          <div className="px-6 py-14 text-center sm:py-16" role="status">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-emerald-500/15 text-3xl text-emerald-500">✓</div>
            <h3 className="mt-5 font-display text-2xl font-semibold text-ink">You&apos;re booked!</h3>
            <p className="mt-2 text-sm font-medium text-ink">{longFmt.format(new Date(done))}</p>
            <p className="mx-auto mt-2 max-w-sm text-xs text-muted">
              We&apos;ll follow up on {email} to confirm and share the meeting details.
            </p>
            <button type="button" onClick={downloadIcs} className="btn-outline mt-7">
              Add to calendar
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            {/* ───────── LEFT: day + time ───────── */}
            <div className="flex min-w-0 flex-col p-6 sm:p-9">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gold/10 text-[11px] font-bold text-gold">1</span>
                  Choose a day
                </p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollDays(-1)}
                    aria-label="Earlier days"
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted transition hover:border-gold hover:text-gold"
                  >
                    <ChevronIcon dir="left" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollDays(1)}
                    aria-label="Later days"
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted transition hover:border-gold hover:text-gold"
                  >
                    <ChevronIcon dir="right" />
                  </button>
                </div>
              </div>

              {slots.length === 0 && !loading ? (
                <p className="mt-4 text-sm text-muted">No times are available right now — please send us a message instead.</p>
              ) : (
                <div
                  ref={stripRef}
                  className="no-scrollbar -mx-1 mt-4 flex snap-x gap-2.5 overflow-x-auto px-1 py-1.5"
                  role="tablist"
                  aria-label="Available days"
                >
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
                        className={`flex w-[4.4rem] shrink-0 snap-start flex-col items-center rounded-xl border px-2 py-3 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                          on
                            ? "border-transparent bg-gold-gradient text-white shadow-gold"
                            : "border-line bg-white text-muted hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-md"
                        }`}
                      >
                        <span className={`text-[10px] font-semibold uppercase tracking-wide ${on ? "text-white/80" : ""}`}>
                          {d.date.toLocaleDateString(undefined, { weekday: "short" })}
                        </span>
                        <span className={`font-display text-xl font-semibold leading-tight ${on ? "text-white" : "text-ink"}`}>{d.date.getDate()}</span>
                        <span className={`text-[10px] ${on ? "text-white/80" : ""}`}>{d.date.toLocaleDateString(undefined, { month: "short" })}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <p className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gold/10 text-[11px] font-bold text-gold">2</span>
                  Choose a time
                </p>
                {activeDay && <span className="text-xs text-muted">{dayFmt.format(activeDay.date)}</span>}
              </div>

              {loading && slots.length > 0 ? (
                <p className="mt-4 text-xs text-muted">Checking availability…</p>
              ) : (
                <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4" role="group" aria-label="Available times">
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
                        className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${
                          isTaken
                            ? "cursor-not-allowed border-line bg-bg-soft text-muted/40 line-through"
                            : on
                              ? "border-transparent bg-gold-gradient text-white shadow-gold"
                              : "border-line bg-white text-ink hover:-translate-y-0.5 hover:border-gold/60 hover:text-gold hover:shadow-md"
                        }`}
                      >
                        {timeFmt.format(new Date(s))}
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="mt-auto flex items-center gap-2 pt-7 text-[11px] text-muted">
                <ClockIcon />
                Our team works {BOOKING_CONFIG.startHour}:00–{BOOKING_CONFIG.endHour}:00 {BOOKING_CONFIG.tzLabel}, Monday to Saturday.
              </p>
            </div>

            {/* ───────── RIGHT: details ───────── */}
            <form
              onSubmit={submit}
              className="min-w-0 border-t border-line bg-bg-soft/70 p-6 sm:p-9 lg:border-l lg:border-t-0"
            >
              <p className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gold/10 text-[11px] font-bold text-gold">3</span>
                Your details
              </p>

              {/* Selected-time summary */}
              <div
                className={`mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  slot ? "border-gold/30 bg-gold/10 text-gold" : "border-dashed border-line bg-white text-muted"
                }`}
                aria-live="polite"
              >
                <CalendarIcon />
                <div className="min-w-0 text-xs">
                  {slot ? (
                    <>
                      <p className="font-semibold text-ink">{longFmt.format(new Date(slot))}</p>
                      <p className="mt-0.5 text-muted">{BOOKING_CONFIG.slotMinutes}-minute call · free, no obligation</p>
                    </>
                  ) : (
                    <p>Pick a day and time to continue</p>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Field icon={<UserIcon />}>
                  <input
                    className={fieldCls}
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    aria-label="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
                <Field icon={<MailIcon />}>
                  <input
                    className={fieldCls}
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="Your email"
                    aria-label="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field icon={<PhoneIcon />}>
                  <input
                    className={fieldCls}
                    type="tel"
                    autoComplete="tel"
                    placeholder="Phone / WhatsApp (optional)"
                    aria-label="Phone or WhatsApp"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Field>
              </div>

              <p className="mb-2 mt-5 text-xs font-semibold text-ink">What&apos;s the call about?</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="What is the call about?">
                {BOOKING_TOPICS.map((t) => {
                  const on = topic === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setTopic(t)}
                      className={`rounded-md border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                        on ? "border-gold bg-gold/10 text-gold" : "border-line bg-white text-muted hover:border-gold/50 hover:text-ink"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              <textarea
                className={`${fieldCls} no-scrollbar mt-4 resize-none !pl-4`}
                rows={3}
                maxLength={1000}
                placeholder="Anything we should know beforehand? (optional)"
                aria-label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />

              {error && (
                <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-600" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending || !slot}
                className="btn-primary mt-5 w-full justify-center whitespace-nowrap py-3.5 tracking-wide disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "BOOKING…" : slot ? "CONFIRM BOOKING" : "PICK A TIME"} <span aria-hidden>→</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
