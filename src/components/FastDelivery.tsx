"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, subscribeSettings } from "@/lib/firestore/settings";

/**
 * "On Demand Fast Delivery Available" — premium animated banner used on the
 * Home, Portfolio and Pricing pages. Pure CSS animation (no client JS), so it
 * is light on the client (only reads the WhatsApp number from settings). Styles live in globals.css under `.odfd-*`.
 */

type Variant = "home" | "portfolio" | "pricing";

const COPY: Record<Variant, { text: string; cta: string; message: string }> = {
  home: {
    text: "Tight deadline or a launch date you can't move? Our team can prioritise your project and deliver it faster, without cutting corners.",
    cta: "Request fast delivery",
    message: "Hi Bahu Technology, I need a project delivered fast. Can we talk about on-demand fast delivery?",
  },
  portfolio: {
    text: "Every project you see here can be delivered on an accelerated schedule when you need it live sooner.",
    cta: "Start a fast project",
    message: "Hi Bahu Technology, I saw your portfolio and need a project delivered fast. Can you help?",
  },
  pricing: {
    text: "Need it sooner than the standard timeline? Ask for priority delivery on any package and get a custom schedule.",
    cta: "Get a fast-delivery quote",
    message: "Hi Bahu Technology, I'd like a fast-delivery quote for my project.",
  },
};

const PERKS = ["Priority scheduling", "Dedicated team", "Same premium quality"];

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 004.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.12h-.01a8.2 8.2 0 01-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 01-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 012.41 5.83c0 4.55-3.7 8.2-8.25 8.2zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.36-.77-1.85-.2-.5-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.86-.87 2.09 0 1.23.9 2.42 1.02 2.59.12.17 1.76 2.7 4.28 3.78.6.26 1.06.41 1.43.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.19.21-.58.21-1.08.14-1.19-.06-.1-.23-.16-.48-.28z" />
    </svg>
  );
}

function Bolt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M13.2 2 4.5 13.4c-.4.5 0 1.2.6 1.2h5l-1.3 7c-.1.7.8 1.1 1.2.5l8.7-11.4c.4-.5 0-1.2-.6-1.2h-5l1.3-6.9c.1-.7-.8-1.1-1.2-.6Z" />
    </svg>
  );
}

const RIBBON = ["On demand", "Fast delivery", "Available now", "Priority builds"];

export default function FastDelivery({ variant = "home" }: { variant?: Variant }) {
  const c = COPY[variant];
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Same WhatsApp number/settings the rest of the site uses (Admin → Settings).
  useEffect(() => {
    const unsub = subscribeSettings(setSettings);
    return () => unsub?.();
  }, []);

  const href = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(c.message)}`;
  const ribbon = [...RIBBON, ...RIBBON, ...RIBBON, ...RIBBON];

  return (
    <div className="odfd-wrap">
    <section
      className="odfd-section"
      aria-labelledby={`odfd-title-${variant}`}
      data-variant={variant}
    >
      <div aria-hidden className="odfd-bg">
        <span className="odfd-aurora odfd-aurora-a" />
        <span className="odfd-aurora odfd-aurora-b" />
        <span className="odfd-aurora odfd-aurora-c" />
        <span className="odfd-grid" />
        <span className="odfd-streak odfd-streak-1" />
        <span className="odfd-streak odfd-streak-2" />
        <span className="odfd-streak odfd-streak-3" />
      </div>

      <div className="odfd-inner">
        <div className="odfd-card">
          <span aria-hidden className="odfd-card-border" />

          <div className="odfd-emblem" aria-hidden>
            <span className="odfd-ring odfd-ring-a" />
            <span className="odfd-ring odfd-ring-b" />
            <span className="odfd-pulse" />
            <span className="odfd-core">
              <Bolt className="odfd-bolt" />
            </span>
          </div>

          <div className="odfd-body">
            <span className="odfd-live">
              <span className="odfd-live-dot" aria-hidden />
              Available now
            </span>

            <h2 id={`odfd-title-${variant}`} className="odfd-title">
              On Demand <span className="odfd-title-flow">Fast Delivery</span> Available
            </h2>

            <p className="odfd-text">{c.text}</p>

            <ul className="odfd-perks">
              {PERKS.map((p) => (
                <li key={p}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.18" />
                    <path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="odfd-action">
            <a href={href} target="_blank" rel="noopener noreferrer" className="odfd-cta">
              <span className="odfd-cta-shine" aria-hidden />
              <WhatsAppIcon className="odfd-cta-bolt" />
              {c.cta}
              <span aria-hidden className="odfd-cta-arrow">→</span>
            </a>
          </div>
        </div>
      </div>

      <div className="odfd-ribbon" aria-hidden>
        <div className="odfd-ribbon-track">
          {ribbon.map((t, i) => (
            <span key={i} className="odfd-ribbon-item">
              <Bolt className="odfd-ribbon-bolt" />
              {t}
            </span>
          ))}
          {ribbon.map((t, i) => (
            <span key={`b${i}`} className="odfd-ribbon-item">
              <Bolt className="odfd-ribbon-bolt" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
    </div>
  );
}
