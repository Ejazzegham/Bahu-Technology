"use client";

import Link from "next/link";
import { useState } from "react";
import { Palette, Code2, Smartphone, MonitorCog, Check, type LucideIcon } from "lucide-react";

const TABS: {
  id: string;
  label: string;
  icon: LucideIcon;
  headline: string;
  blurb: string;
  items: string[];
  href: string;
}[] = [
  {
    id: "design",
    label: "Graphic Design",
    icon: Palette,
    headline: "A brand people remember",
    blurb: "From first sketch to final files, everything you need to look professional everywhere.",
    items: ["Logo design & variations", "Brand colours & typography", "Social media creatives", "Print-ready files", "Brand guidelines"],
    href: "/graphic-design",
  },
  {
    id: "web",
    label: "Web Development",
    icon: Code2,
    headline: "Websites that load fast and convert",
    blurb: "Modern, responsive websites built to be found on search and easy to grow.",
    items: ["Custom responsive design", "SEO-friendly structure", "Admin panel / CMS", "Contact & lead forms", "Hosting & launch support"],
    href: "/web-development",
  },
  {
    id: "mobile",
    label: "Mobile Apps",
    icon: Smartphone,
    headline: "Apps your users enjoy opening",
    blurb: "Android and iOS apps with smooth interfaces and dependable back ends.",
    items: ["Android & iOS builds", "Clean UI/UX design", "API & database integration", "Push notifications", "Store publishing help"],
    href: "/mobile-app-development",
  },
  {
    id: "desktop",
    label: "Desktop Software",
    icon: MonitorCog,
    headline: "Software shaped around your workflow",
    blurb: "Custom business tools that save time and keep your data organised.",
    items: ["Custom business software", "Billing & inventory tools", "Reports & data export", "Secure user roles", "Training & ongoing support"],
    href: "/desktop-software",
  },
];

export default function HomeDeliverables() {
  const [active, setActive] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <section className="section pt-0" aria-labelledby="home-deliver-title">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          WHAT&apos;S INCLUDED
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="home-deliver-title" className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          See what you <span className="text-gold">get with each service</span>
        </h2>
      </div>

      <div role="tablist" aria-label="Services" className="no-scrollbar mx-auto mt-10 flex max-w-3xl gap-2 overflow-x-auto rounded-full border border-line bg-bg-soft p-1.5">
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(t.id)}
              className={`flex shrink-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                on ? "bg-gold-gradient text-white shadow-gold" : "text-muted hover:text-ink"
              }`}
            >
              <t.icon size={16} strokeWidth={1.8} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" key={tab.id} className="auth-fade-in mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-8 overflow-hidden rounded-3xl border border-line bg-white p-8 shadow-sm lg:grid-cols-2 lg:p-12">
        <div className="flex flex-col justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-gradient text-white shadow-gold">
            <tab.icon size={26} strokeWidth={1.7} />
          </span>
          <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{tab.headline}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">{tab.blurb}</p>
          <div className="mt-6">
            <Link href={tab.href} className="btn-primary">
              EXPLORE SERVICE <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
        <ul className="space-y-3">
          {tab.items.map((item) => (
            <li key={item} className="flex items-center gap-3 rounded-xl border border-line bg-bg-soft px-4 py-3 text-sm font-medium text-ink">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                <Check size={14} strokeWidth={2.6} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
