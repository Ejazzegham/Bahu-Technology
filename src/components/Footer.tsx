"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { subscribeNewsletter } from "@/lib/firestore/subscribers";
import { DEFAULT_SETTINGS, subscribeSettings } from "@/lib/firestore/settings";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const SERVICE_LINKS = [
  { label: "Graphic Design", href: "/graphic-design" },
  { label: "Web Design & Development", href: "/web-development" },
  { label: "Mobile App Design & Development", href: "/mobile-app-development" },
  { label: "Custom Desktop Software", href: "/desktop-software" },
  { label: "Custom Solutions", href: "/pricing" },
];

const SOCIAL_LABELS: { key: keyof typeof DEFAULT_SETTINGS.social; name: string; initial: string }[] = [
  { key: "linkedin", name: "LinkedIn", initial: "in" },
  { key: "facebook", name: "Facebook", initial: "f" },
  { key: "instagram", name: "Instagram", initial: "ig" },
  { key: "twitter", name: "X (Twitter)", initial: "x" },
  { key: "behance", name: "Behance", initial: "be" },
  { key: "dribbble", name: "Dribbble", initial: "dr" },
  { key: "github", name: "GitHub", initial: "gh" },
  { key: "youtube", name: "YouTube", initial: "yt" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const unsub = subscribeSettings(setSettings);
    return () => unsub?.();
  }, []);

  const activeSocials = SOCIAL_LABELS.filter((s) => settings.social[s.key]);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await subscribeNewsletter(email);
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="border-t border-line bg-bg-soft">
      <div className="section grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <Image
              src={settings.appearance.logoUrl}
              alt="Bahu Technology"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="font-display text-sm font-semibold text-ink">
              BAHU TECHNOLOGY
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {settings.appearance.tagline}
          </p>
          {activeSocials.length > 0 && (
            <div className="mt-5 flex gap-3">
              {activeSocials.map((s) => (
                <a
                  key={s.key}
                  href={settings.social[s.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-[10px] font-semibold uppercase text-muted hover:border-gold hover:text-gold"
                >
                  {s.initial}
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-[0.2em] text-gold">
            QUICK LINKS
          </h3>
          <ul className="mt-4 space-y-2.5">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-muted hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-[0.2em] text-gold">
            SERVICES
          </h3>
          <ul className="mt-4 space-y-2.5">
            {SERVICE_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-muted hover:text-gold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-[0.2em] text-gold">
            CONTACT INFO
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>{settings.contactEmail}</li>
            <li>{settings.contactPhone}</li>
            <li>{settings.address}</li>
          </ul>
          <h3 className="mt-6 text-xs font-semibold tracking-[0.2em] text-gold">
            NEWSLETTER
          </h3>
          <p className="mt-2 text-xs text-muted">
            Subscribe to get updates on new projects and offers.
          </p>
          {status === "done" ? (
            <p className="mt-3 text-xs font-medium text-gold">Thanks for subscribing!</p>
          ) : (
            <form className="mt-3 flex gap-2" onSubmit={handleSubscribe}>
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-line bg-bg px-3 py-2 text-xs text-ink placeholder:text-muted focus:border-gold focus:outline-none"
              />
              <button type="submit" disabled={status === "sending"} className="btn-primary !px-4 !py-2 !text-xs disabled:opacity-60">
                {status === "sending" ? "…" : "SUBSCRIBE"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="mt-2 text-[11px] text-rose-400">Couldn&apos;t subscribe right now — try again.</p>
          )}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 text-sm leading-relaxed text-muted lg:grid-cols-[1.4fr_1fr] lg:px-10">
          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] text-gold">ABOUT THE COMPANY</h3>
            <p className="mt-3">
              Bahu Technology is a creative digital agency and software
              development studio. Our team of graphic designers and full-stack
              developers turns ideas into brands, websites, mobile apps and
              desktop software that look premium and perform reliably.
            </p>
            <p className="mt-3">
              With 15+ years of experience, 2000+ projects delivered and 1330+
              happy clients, we focus on clean code, thoughtful design,
              transparent pricing and fast, dependable support, from the first
              conversation to long after launch.
            </p>
          </div>
          <ul className="space-y-2.5 self-center">
            {[
              "Graphic Design, Web, Mobile & Desktop under one roof",
              `Based in ${settings.address}, serving clients worldwide`,
              "Clear packages and honest timelines",
              "Dedicated support after your project goes live",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-gold">
                  <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
                  <path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted sm:flex-row lg:px-10">
          <p>© {new Date().getFullYear()} Bahu Technology. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gold">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gold">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
