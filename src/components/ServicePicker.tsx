"use client";

import Link from "next/link";
import { useState } from "react";

const SERVICES = [
  {
    key: "web",
    label: "Websites",
    href: "/web-development",
    title: "Websites that win customers",
    desc: "Fast, responsive, search-friendly websites and web apps, from business sites and landing pages to eCommerce and custom platforms.",
    points: ["Business & portfolio sites", "eCommerce stores", "Custom web applications", "Landing pages"],
  },
  {
    key: "mobile",
    label: "Mobile Apps",
    href: "/mobile-app-development",
    title: "Apps people love to use",
    desc: "Smooth, modern mobile apps for Android and iOS, designed around your users and built to grow with your business.",
    points: ["Android & iOS apps", "Clean, intuitive UI/UX", "API & backend integration", "Launch and support"],
  },
  {
    key: "design",
    label: "Graphic Design",
    href: "/graphic-design",
    title: "Brands that stand out",
    desc: "Logos, branding and marketing visuals that make your business look professional and memorable everywhere it appears.",
    points: ["Logo design", "Brand identity", "Social & marketing graphics", "Print-ready files"],
  },
  {
    key: "desktop",
    label: "Desktop Software",
    href: "/desktop-software",
    title: "Software built around your workflow",
    desc: "Custom desktop applications that automate your process, save time and keep your data under your control.",
    points: ["Custom business software", "Automation tools", "Reliable, secure builds", "Ongoing maintenance"],
  },
];

export default function ServicePicker() {
  const [active, setActive] = useState(0);
  const s = SERVICES[active];

  return (
    <section id="what-do-you-need" className="section">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          START HERE
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          What do you need <span className="text-gold">built?</span>
        </h2>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-2" role="tablist">
        {SERVICES.map((item, i) => (
          <button
            key={item.key}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`rounded-md border px-5 py-2 text-sm font-semibold transition-all duration-300 ${
              i === active
                ? "border-gold bg-gold text-white shadow-gold"
                : "border-line bg-white text-ink/70 hover:border-gold/60 hover:text-gold"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        key={s.key}
        role="tabpanel"
        className="auth-fade-in rgb-box mx-auto mt-8 grid max-w-4xl gap-8 rounded-2xl p-8 md:grid-cols-[1.2fr_1fr] md:p-10"
      >
        <div>
          <h3 className="font-display text-2xl font-semibold text-ink">{s.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">{s.desc}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={s.href} className="btn-outline">
              EXPLORE {s.label.toUpperCase()} <span aria-hidden>→</span>
            </Link>
            <Link href="/contact" className="btn-primary">
              GET A FREE QUOTE
            </Link>
          </div>
        </div>
        <ul className="space-y-3 self-center">
          {s.points.map((p) => (
            <li key={p} className="flex items-center gap-3 text-sm text-ink/90">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-gold">
                <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
                <path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
