"use client";

import { useEffect, useRef, useState } from "react";
import {
  BRIEF_ACCEPT,
  BRIEF_ALLOWED,
  BRIEF_BUDGETS,
  BRIEF_GOALS,
  BRIEF_MAX_FILES,
  BRIEF_MAX_FILE_BYTES,
  BRIEF_SERVICES,
  BRIEF_TIMELINES,
  extOf,
  type BriefFile,
} from "@/lib/brief";

const inputCls =
  "w-full rounded-md border border-line bg-bg px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40";

const STEPS = ["About you", "Your project", "Budget & timing", "Files & review"];

const fmtSize = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

function toggle(list: string[], v: string) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

/** PUT a file straight to R2 with upload progress (fetch can't report upload progress). */
function putWithProgress(url: string, file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed for ${file.name}.`)));
    xhr.onerror = () => reject(new Error(`Upload failed for ${file.name}.`));
    xhr.send(file);
  });
}

async function uploadOne(file: File, onProgress: (pct: number) => void): Promise<BriefFile> {
  const res = await fetch("/api/brief/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Couldn't upload ${file.name}.`);
  await putWithProgress(data.uploadUrl, file, onProgress);
  return { name: file.name, url: data.publicUrl, size: file.size };
}

export default function ProjectBriefForm() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [references, setReferences] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [estimate, setEstimate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Prefill from the Project Estimator link (?service=…&budget=…&timeline=…&estimate=…) …
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const s = q.get("service");
    if (s && (BRIEF_SERVICES as readonly string[]).includes(s)) setServices([s]);
    const b = q.get("budget");
    if (b && BRIEF_BUDGETS.includes(b)) setBudget(b);
    const t = q.get("timeline");
    if (t && BRIEF_TIMELINES.includes(t)) setTimeline(t);
    const est = q.get("estimate");
    if (est) setEstimate(est.slice(0, 300));
  }, []);

  // … and from the topic cards higher up the contact page.
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const d = (e as CustomEvent<{ service?: string }>).detail;
      if (d?.service && (BRIEF_SERVICES as readonly string[]).includes(d.service)) setServices([d.service]);
    };
    window.addEventListener("contact:prefill", onPrefill);
    return () => window.removeEventListener("contact:prefill", onPrefill);
  }, []);

  const go = (n: number) => {
    setError(null);
    setStep(n);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  function validate(s: number): string | null {
    if (s === 0) {
      if (!name.trim()) return "Please tell us your name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email address.";
    }
    if (s === 1) {
      if (services.length === 0) return "Pick at least one service.";
      if (details.trim().length < 20) return "Tell us a little more about the project (at least a sentence or two).";
    }
    return null;
  }

  const next = () => {
    const err = validate(step);
    if (err) return setError(err);
    go(step + 1);
  };

  function addFiles(list: FileList | File[]) {
    setFileError(null);
    const incoming = Array.from(list);
    const accepted: File[] = [];
    for (const f of incoming) {
      const ext = extOf(f.name);
      if (!BRIEF_ALLOWED[ext]) {
        setFileError(`“${f.name}” isn't a supported file type.`);
        continue;
      }
      if (f.size > BRIEF_MAX_FILE_BYTES) {
        setFileError(`“${f.name}” is larger than ${BRIEF_MAX_FILE_BYTES / 1024 / 1024} MB.`);
        continue;
      }
      accepted.push(f);
    }
    setFiles((cur) => {
      const merged = [...cur, ...accepted.filter((a) => !cur.some((c) => c.name === a.name && c.size === a.size))];
      if (merged.length > BRIEF_MAX_FILES) setFileError(`You can attach up to ${BRIEF_MAX_FILES} files.`);
      return merged.slice(0, BRIEF_MAX_FILES);
    });
  }

  async function submit() {
    for (const s of [0, 1]) {
      const err = validate(s);
      if (err) {
        go(s);
        return setError(err);
      }
    }
    setError(null);
    setSending(true);
    try {
      setProgress(files.map(() => 0));
      const uploaded: BriefFile[] = [];
      for (let i = 0; i < files.length; i++) {
        uploaded.push(
          await uploadOne(files[i], (p) =>
            setProgress((cur) => cur.map((v, idx) => (idx === i ? p : v)))
          )
        );
        setProgress((cur) => cur.map((v, idx) => (idx === i ? 1 : v)));
      }

      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone, company, services, goals, budget, timeline, references, details, estimate,
          files: uploaded, website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't send your brief right now.");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send your brief right now.");
    } finally {
      setSending(false);
    }
  }

  const Chip = ({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) => (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-md border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        on ? "border-gold bg-gold/10 text-gold" : "border-line text-muted hover:border-gold/50 hover:text-gold"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section id="project-brief" className="section pt-0" aria-labelledby="brief-title">
      <div ref={top} className="scroll-mt-24 text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          PROJECT BRIEF
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="brief-title" className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Tell us about <span className="text-gold">your project</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          A few quick steps help us send back an accurate proposal. Takes about 3 minutes.
        </p>
      </div>

      <div className="rgb-box mx-auto mt-10 max-w-3xl rounded-xl p-6 sm:p-8" style={{ ["--box-fill" as string]: "#ffffff" }}>
        {done ? (
          <div className="py-8 text-center" role="status">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-emerald-500/15 text-2xl text-emerald-500">✓</div>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">Brief received — thank you!</h3>
            <p className="mt-2 text-sm text-muted">We&apos;ll review it and reply to {email} with next steps, usually within one business day.</p>
          </div>
        ) : (
          <>
            <ol className="mb-8 flex items-center" aria-label="Progress">
              {STEPS.map((label, i) => (
                <li key={label} className="flex flex-1 items-center last:flex-none" aria-current={i === step ? "step" : undefined}>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 text-xs font-bold transition-colors ${
                      i < step ? "border-gold bg-gold text-white" : i === step ? "border-gold text-gold" : "border-line text-muted"
                    }`}
                  >
                    {i < step ? "✓" : i + 1}
                  </span>
                  <span className={`ml-2 hidden text-[11px] font-semibold sm:inline ${i === step ? "text-ink" : "text-muted"}`}>{label}</span>
                  {i < STEPS.length - 1 && <span className={`mx-3 h-0.5 flex-1 rounded ${i < step ? "bg-gold" : "bg-line"}`} />}
                </li>
              ))}
            </ol>

            {step === 0 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={inputCls} placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                  <input className={inputCls} type="email" placeholder="Your email *" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                  <input className={inputCls} type="tel" placeholder="Phone / WhatsApp (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
                  <input className={inputCls} placeholder="Company / brand (optional)" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
                </div>
                <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <p className="mb-2 text-xs font-semibold text-ink">What do you need? *</p>
                  <div className="flex flex-wrap gap-2">
                    {BRIEF_SERVICES.map((s) => (
                      <Chip key={s} label={s} on={services.includes(s)} onClick={() => setServices((c) => toggle(c, s))} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-ink">
                    Main goals <span className="font-normal text-muted">(optional)</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {BRIEF_GOALS.map((g) => (
                      <Chip key={g} label={g} on={goals.includes(g)} onClick={() => setGoals((c) => toggle(c, g))} />
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="brief-details" className="mb-2 block text-xs font-semibold text-ink">
                    Describe your project *
                  </label>
                  <textarea
                    id="brief-details"
                    className={inputCls}
                    rows={6}
                    maxLength={4000}
                    placeholder="What are you building, who is it for, and what does success look like?"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                  <p className="mt-1 text-right text-[11px] text-muted">{details.length}/4000</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {estimate && (
                  <p className="rounded-md border border-gold/30 bg-gold/5 px-4 py-3 text-xs text-ink">
                    <strong className="text-gold">From the estimator:</strong> {estimate}
                  </p>
                )}
                <div>
                  <p className="mb-2 text-xs font-semibold text-ink">Budget</p>
                  <div className="flex flex-wrap gap-2">
                    {BRIEF_BUDGETS.map((b) => (
                      <Chip key={b} label={b} on={budget === b} onClick={() => setBudget(budget === b ? "" : b)} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-ink">Timeline</p>
                  <div className="flex flex-wrap gap-2">
                    {BRIEF_TIMELINES.map((t) => (
                      <Chip key={t} label={t} on={timeline === t} onClick={() => setTimeline(timeline === t ? "" : t)} />
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="brief-refs" className="mb-2 block text-xs font-semibold text-ink">
                    Websites or apps you like <span className="font-normal text-muted">(optional)</span>
                  </label>
                  <textarea
                    id="brief-refs"
                    className={inputCls}
                    rows={3}
                    maxLength={1000}
                    placeholder="Paste links, one per line"
                    value={references}
                    onChange={(e) => setReferences(e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <p className="mb-2 text-xs font-semibold text-ink">
                    Attach files <span className="font-normal text-muted">(optional — logos, wireframes, briefs)</span>
                  </p>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      addFiles(e.dataTransfer.files);
                    }}
                    className={`rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
                      dragOver ? "border-gold bg-gold/5" : "border-line"
                    }`}
                  >
                    <p className="text-sm text-muted">Drag files here, or</p>
                    <button type="button" onClick={() => fileInput.current?.click()} className="btn-outline mt-3 !px-4 !py-2 !text-xs">
                      Choose files
                    </button>
                    <input
                      ref={fileInput}
                      type="file"
                      multiple
                      accept={BRIEF_ACCEPT}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) addFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                    <p className="mt-3 text-[11px] text-muted">
                      Up to {BRIEF_MAX_FILES} files, {BRIEF_MAX_FILE_BYTES / 1024 / 1024} MB each · PDF, images, Office docs, ZIP
                    </p>
                  </div>
                  {fileError && (
                    <p className="mt-2 text-xs text-rose-500" role="alert">
                      {fileError}
                    </p>
                  )}
                  {files.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {files.map((f, i) => (
                        <li key={`${f.name}-${i}`} className="rounded-md border border-line px-3 py-2 text-xs">
                          <div className="flex items-center justify-between gap-3">
                            <span className="min-w-0 truncate text-ink">{f.name}</span>
                            <span className="flex shrink-0 items-center gap-3 text-muted">
                              {fmtSize(f.size)}
                              {!sending && (
                                <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((c) => c.filter((_, idx) => idx !== i))} className="hover:text-rose-500">
                                  ✕
                                </button>
                              )}
                            </span>
                          </div>
                          {sending && (
                            <div className="mt-2 h-1.5 overflow-hidden rounded-md bg-line">
                              <div className="h-full rounded-md bg-gold transition-[width]" style={{ width: `${Math.round((progress[i] ?? 0) * 100)}%` }} />
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-lg bg-bg-soft p-4 text-xs leading-relaxed text-muted">
                  <p className="mb-2 font-semibold text-ink">Review</p>
                  <p><span className="font-semibold text-ink">{name}</span> · {email}{company ? ` · ${company}` : ""}</p>
                  <p className="mt-1"><span className="font-semibold text-ink">Needs:</span> {services.join(", ") || "—"}</p>
                  <p className="mt-1">
                    <span className="font-semibold text-ink">Budget / timeline:</span> {budget || "not set"} · {timeline || "not set"}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-5 text-xs text-rose-500" role="alert">
                {error}
              </p>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button type="button" onClick={() => go(step - 1)} disabled={step === 0 || sending} className="text-xs font-semibold text-muted transition-colors hover:text-gold disabled:invisible">
                ← Back
              </button>
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={next} className="btn-primary">
                  Continue <span aria-hidden>→</span>
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={sending} className="btn-primary disabled:opacity-60">
                  {sending ? "Sending…" : "SEND BRIEF"} <span aria-hidden>→</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
