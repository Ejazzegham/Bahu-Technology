import Link from "next/link";

/**
 * "On Demand Fast Delivery Available" — premium animated banner used on the
 * Home, Portfolio and Pricing pages. Pure CSS animation (no client JS), so it
 * works as a server component. Styles live in globals.css under `.odfd-*`.
 */

type Variant = "home" | "portfolio" | "pricing";

const COPY: Record<Variant, { text: string; cta: string; href: string }> = {
  home: {
    text: "Tight deadline or a launch date you can't move? Our team can prioritise your project and deliver it faster, without cutting corners.",
    cta: "Request fast delivery",
    href: "/contact",
  },
  portfolio: {
    text: "Every project you see here can be delivered on an accelerated schedule when you need it live sooner.",
    cta: "Start a fast project",
    href: "/contact",
  },
  pricing: {
    text: "Need it sooner than the standard timeline? Ask for priority delivery on any package and get a custom schedule.",
    cta: "Get a fast-delivery quote",
    href: "/contact",
  },
};

const PERKS = ["Priority scheduling", "Dedicated team", "Same premium quality"];

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
  const ribbon = [...RIBBON, ...RIBBON, ...RIBBON, ...RIBBON];

  return (
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
            <Link href={c.href} className="odfd-cta">
              <span className="odfd-cta-shine" aria-hidden />
              <Bolt className="odfd-cta-bolt" />
              {c.cta}
              <span aria-hidden className="odfd-cta-arrow">→</span>
            </Link>
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
  );
}
