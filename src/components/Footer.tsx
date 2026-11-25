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

const CONTACT_ICONS = {
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  phone: (
    <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .3 2 .7 2.9a2 2 0 01-.4 2.1L8 10.1a16 16 0 006 6l1.4-1.4a2 2 0 012.1-.4c.9.4 1.9.6 2.9.7a2 2 0 011.7 2z" />
  ),
  address: (
    <>
      <path d="M12 22s7-6.3 7-12a7 7 0 10-14 0c0 5.7 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  hours: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
};

const LINK_CLASS =
  "text-sm text-white/65 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:underline";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const unsub = subscribeSettings(setSettings);
    return () => unsub?.();
  }, []);

  const activeSocials = SOCIAL_LABELS.filter((s) => settings.social[s.key]);
  const whatsappHref = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage)}`;

  const contactItems = [
    { key: "email", label: "Email", value: settings.contactEmail, href: `mailto:${settings.contactEmail}`, icon: CONTACT_ICONS.email },
    { key: "phone", label: "Phone", value: settings.contactPhone, href: `tel:${settings.contactPhone.replace(/\s+/g, "")}`, icon: CONTACT_ICONS.phone },
    { key: "address", label: "Address", value: settings.address, href: undefined, icon: CONTACT_ICONS.address },
    { key: "hours", label: "Working hours", value: settings.workingHours, href: undefined, icon: CONTACT_ICONS.hours },
  ];

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
    <footer className="relative overflow-hidden bg-[#040711] text-white">
      <div aria-hidden className="hero-orb hero-orb-a" style={{ opacity: 0.35 }} />
      <div aria-hidden className="hero-orb hero-orb-b" style={{ opacity: 0.25 }} />
      <div aria-hidden className="hero-grid absolute inset-0 opacity-70" />

      <div className="section relative pb-10 pt-16">
        {/* Call to action */}
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur sm:p-9 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-semibold leading-snug text-white sm:text-3xl">
              Have a project in mind? Let&apos;s talk about it.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Tell us the goal and we&apos;ll suggest the right way to get there.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">
              Start a project
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Main columns */}
        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Bahu Technology home">
              <Image
                src={settings.appearance.logoUrl}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
              <span className="font-display text-base font-semibold text-white">Bahu Technology</span>
            </Link>

            {/* About Bahu Technology */}
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              Bahu Technology is a Pakistan-based digital studio. We design and build websites,
              mobile apps, brand identities and custom desktop software for businesses that want
              to grow.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
              Creative design, clean code and honest pricing: that&apos;s how we turn your idea into
              a product people enjoy using.
            </p>

            {activeSocials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {activeSocials.map((s) => (
                  <a
                    key={s.key}
                    href={settings.social[s.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-[10px] font-semibold uppercase text-white/70 transition-colors hover:border-gold-light hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                  >
                    {s.initial}
                  </a>
                ))}
              </div>
            )}
          </div>

          <nav aria-label="Quick links" className="lg:col-span-2">
            <h3 className="font-display text-sm font-semibold text-white">Quick links</h3>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={LINK_CLASS}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Services" className="lg:col-span-3">
            <h3 className="font-display text-sm font-semibold text-white">Services</h3>
            <ul className="mt-4 space-y-2.5">
              {SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={LINK_CLASS}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-4">
              {contactItems.map((item) => (
                <li key={item.key} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-gold-light">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      {item.icon}
                    </svg>
                    <span className="sr-only">{item.label}</span>
                  </span>
                  {item.href ? (
                    <a href={item.href} className={`${LINK_CLASS} break-all`}>
                      {item.value}
                    </a>
                  ) : (
                    <span className="whitespace-pre-line text-sm text-white/65">{item.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-white">Get project news and offers</h3>
            <p className="mt-1 text-sm text-white/60">New work, tips and the occasional offer. No spam.</p>
          </div>
          {status === "done" ? (
            <p role="status" className="text-sm font-medium text-gold-light">
              Thanks for subscribing!
            </p>
          ) : (
            <form className="flex w-full max-w-md gap-2" onSubmit={handleSubscribe}>
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-white/20 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light/40"
              />
              <button type="submit" disabled={status === "sending"} className="btn-primary shrink-0 !px-5 !py-2.5 disabled:opacity-60">
                {status === "sending" ? "…" : "Subscribe"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p role="alert" className="text-xs text-rose-300 md:basis-full">
              Couldn&apos;t subscribe right now. Please try again.
            </p>
          )}
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-white/50 sm:flex-row lg:px-10">
          <p>© {new Date().getFullYear()} Bahu Technology. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
