"use client";

import Link from "next/link";
import { useState } from "react";

type Svc = {
  key: string;
  title: string;
  tagline: string;
  href: string;
  badge?: string;
  /** Tailwind classes — written out in full so Tailwind can see them. */
  gradient: string;
  soft: string;
  text: string;
  ring: string;
  glow: string;
  icon: JSX.Element;
  features: string[];
  popular: string[];
};

const SERVICES: Svc[] = [
  {
    key: "web",
    title: "Web Design & Development",
    tagline: "Fast, responsive websites and web apps that turn visitors into customers.",
    href: "/web-development",
    badge: "Most Popular",
    gradient: "from-sky-500 to-blue-700",
    soft: "bg-sky-50",
    text: "text-sky-600",
    ring: "hover:border-sky-300",
    glow: "hover:shadow-[0_20px_50px_-15px_rgba(14,165,233,0.45)]",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M3 9h18M8 20h8" />
      </>
    ),
    features: ["Custom responsive design", "SEO-friendly structure", "Secure, scalable code", "CMS & admin dashboards"],
    popular: ["Business Website", "Online Store", "Landing Page", "Web App", "Portfolio", "LMS"],
  },
  {
    key: "mobile",
    title: "Mobile App Development",
    tagline: "Smooth Android & iOS apps designed around your users and built to grow.",
    href: "/mobile-app-development",
    gradient: "from-violet-500 to-purple-700",
    soft: "bg-violet-50",
    text: "text-violet-600",
    ring: "hover:border-violet-300",
    glow: "hover:shadow-[0_20px_50px_-15px_rgba(139,92,246,0.45)]",
    icon: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2" />
        <path d="M11 18.5h2" strokeLinecap="round" />
      </>
    ),
    features: ["Android & iOS from one team", "Clean, intuitive UI/UX", "API & backend integration", "Store launch & support"],
    popular: ["Android App", "iOS App", "Cross-Platform", "Booking App", "Delivery App", "Social App"],
  },
  {
    key: "design",
    title: "Graphic Design & Branding",
    tagline: "Logos and visuals that make your business look professional everywhere.",
    href: "/graphic-design",
    gradient: "from-pink-500 to-orange-500",
    soft: "bg-pink-50",
    text: "text-pink-600",
    ring: "hover:border-pink-300",
    glow: "hover:shadow-[0_20px_50px_-15px_rgba(236,72,153,0.45)]",
    icon: (
      <>
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <path d="M4 20c0-3.3 2.7-6 6-6M20 20c0-3.3-2.7-6-6-6" />
      </>
    ),
    features: ["Logo & brand identity", "Social & marketing graphics", "Print-ready files", "Unlimited-feel revisions"],
    popular: ["Logo Design", "Brand Kit", "Social Posts", "Brochures", "Packaging", "UI Graphics"],
  },
  {
    key: "desktop",
    title: "Desktop Software",
    tagline: "Custom Windows & Mac software that automates work and protects your data.",
    href: "/desktop-software",
    gradient: "from-emerald-500 to-teal-700",
    soft: "bg-emerald-50",
    text: "text-emerald-600",
    ring: "hover:border-emerald-300",
    glow: "hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.45)]",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="1.5" />
        <path d="M8 20h8M12 16v4" />
      </>
    ),
    features: ["Custom business software", "Automation tools", "Reliable, secure builds", "Ongoing maintenance"],
    popular: ["POS System", "Inventory", "School/HR Software", "Billing", "Automation", "Reporting"],
  },
];

const FILTER_LABELS: Record<string, string> = {
  web: "Web Design",
  mobile: "Mobile Apps",
  design: "Graphic Design",
  desktop: "Desktop Software",
};
const FILTERS = [{ key: "all", label: "All" }, ...SERVICES.map((s) => ({ key: s.key, label: FILTER_LABELS[s.key] }))];

export default function AllServicesGrid() {
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? SERVICES : SERVICES.filter((s) => s.key === filter);

  return (
    <section id="services" className="section">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          WHAT WE BUILD
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Pick a service, <span className="text-gold">see what&apos;s inside</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Every service is custom-built for your goals. Choose one to explore its full menu.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter services">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-5 py-2 text-xs font-semibold transition-all duration-300 ${
              filter === f.key
                ? "border-transparent bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500 text-white shadow-lg"
                : "border-line bg-white text-ink/70 hover:border-gold/60 hover:text-gold"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div key={filter} className="auth-fade-in mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {shown.map((s) => (
          <article
            key={s.key}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 border-line bg-white transition-all duration-300 hover:-translate-y-1.5 ${s.ring} ${s.glow}`}
          >
            <div className={`h-1.5 w-full bg-gradient-to-r ${s.gradient}`} />
            {s.badge && (
              <span className={`absolute right-4 top-5 rounded-full bg-gradient-to-r ${s.gradient} px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow`}>
                ★ {s.badge}
              </span>
            )}
            <div className="flex flex-1 flex-col p-7">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  {s.icon}
                </svg>
              </div>

              <h3 className="mt-5 font-display text-xl font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.tagline}</p>

              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {s.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-ink/80">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={`mt-0.5 shrink-0 ${s.text}`}>
                      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
                      <path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {s.popular.map((p) => (
                  <span key={p} className={`rounded-full ${s.soft} ${s.text} px-3 py-1 text-[11px] font-semibold`}>
                    {p}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 pt-1">
                <Link href={s.href} className="btn-primary">
                  Explore service <span aria-hidden>→</span>
                </Link>
                <Link href="/pricing" className={`text-xs font-semibold ${s.text} hover:underline`}>
                  View pricing
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
