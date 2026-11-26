"use client";

import { useState } from "react";
import { submitContactMessage } from "@/lib/firestore/messages";
import Dropdown from "@/components/ui/Dropdown";

const SERVICES = [
  "Website design & development",
  "Mobile app",
  "Graphic design & branding",
  "Custom desktop software",
  "Something else",
];

const PROMISES = [
  {
    title: "Free first conversation",
    text: "Tell us what you want to achieve. No cost and no obligation.",
    icon: <path d="M21 12a8 8 0 01-11.6 7.1L3 21l1.9-6.2A8 8 0 1121 12z" />,
  },
  {
    title: "A clear recommendation",
    text: "We suggest the right scope and package for your goal, not the biggest one.",
    icon: <path d="M9 12l2 2 4-4M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />,
  },
  {
    title: "Pricing explained upfront",
    text: "You see what is included before you commit to anything.",
    icon: <path d="M20.6 12.3L12.7 20.2a2 2 0 01-2.8 0L3 13.3V4h9.3l8.3 8.3a2 2 0 010 2.8zM7 8h.01" />,
  },
];

const FIELD =
  "w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/70 focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/30";

export default function QuickQuote() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState(SERVICES[0]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);

    const subject = `Quick quote: ${service}`;

    try {
      // Saved to Firestore first so it shows up in Admin → Messages.
      await submitContactMessage({ name, email, subject, message });
      setSent(true);
    } catch {
      setError("We couldn't send that just now. Please try again in a moment.");
      setSending(false);
      return;
    }

    // Best-effort email notification, same as the Contact page form.
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
    } catch {
      /* message is already saved */
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="quick-quote" className="section">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <h2 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Tell us what you need.
            <br />
            We&apos;ll tell you how we&apos;d build it.
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
            Share a few details and the team at Bahu Technology will get back to you with a
            straight answer on scope, timeline and cost.
          </p>

          <ul className="mt-8 space-y-5">
            {PROMISES.map((p) => (
              <li key={p.title} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    {p.icon}
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{p.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rgb-box relative overflow-hidden rounded-2xl p-6 shadow-[0_20px_60px_-25px_rgba(10,63,196,0.35)] sm:p-8"
          style={{ ["--box-fill" as string]: "#ffffff" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold/10 blur-3xl"
          />

          {sent ? (
            <div className="relative py-10 text-center" role="status">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-ink">Request received</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
                Thanks, {name.split(" ")[0] || "there"}. We&apos;ll reply to {email} during working hours.
              </p>
            </div>
          ) : (
            <form className="relative space-y-4" onSubmit={handleSubmit}>
              <h3 className="font-display text-lg font-semibold text-ink">Get a free quote</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="qq-name" className="mb-1.5 block text-xs font-medium text-ink">
                    Your name
                  </label>
                  <input
                    id="qq-name"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={FIELD}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label htmlFor="qq-email" className="mb-1.5 block text-xs font-medium text-ink">
                    Email
                  </label>
                  <input
                    id="qq-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={FIELD}
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="qq-service" className="mb-1.5 block text-xs font-medium text-ink">
                  What do you need?
                </label>
                <Dropdown
                  id="qq-service"
                  value={service}
                  onChange={setService}
                  options={SERVICES.map((s) => ({ value: s, label: s }))}
                  className={FIELD}
                />
              </div>

              <div>
                <label htmlFor="qq-message" className="mb-1.5 block text-xs font-medium text-ink">
                  About your project
                </label>
                <textarea
                  id="qq-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${FIELD} resize-none`}
                  placeholder="What are you building, and by when?"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-rose-600">
                  {error}
                </p>
              )}

              <button type="submit" disabled={sending} className="btn-primary w-full justify-center disabled:opacity-60">
                {sending ? "Sending…" : "Send my request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
