"use client";

import { useEffect, useRef, useState } from "react";

type Stats = {
  online: number;
  today: number;
  total: number;
  pageViews: number;
};

const VISITOR_KEY = "bahu_vid";
const SESSION_KEY = "bahu_vcounted";
const PING_EVERY_MS = 45 * 1000;

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    // Storage blocked (private mode etc.) — fall back to a per-page-load id.
    return `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  }
}

function AnimatedNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    const startVal = from.current;
    const dur = 1400;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      const v = Math.round(startVal + (value - startVal) * eased);
      from.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{shown.toLocaleString("en-US")}</>;
}

const ICONS = {
  online: (
    <>
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <path d="M7.8 7.8a6 6 0 000 8.4M16.2 7.8a6 6 0 010 8.4M4.9 4.9a10 10 0 000 14.2M19.1 4.9a10 10 0 010 14.2" />
    </>
  ),
  today: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4M8 14h3" />
    </>
  ),
  total: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6M16 5.2a3.2 3.2 0 010 5.6M18 14.4c2.2.7 3.5 2.6 3.5 5.6" />
    </>
  ),
};

export default function VisitorInsights() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const visitorId = getVisitorId();

    async function send(type: "visit" | "ping") {
      try {
        const res = await fetch("/api/visitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId, type }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Stats;
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    // Count one visit per browser session; later loads in the same session
    // only refresh the numbers.
    let first: "visit" | "ping" = "visit";
    try {
      if (sessionStorage.getItem(SESSION_KEY)) first = "ping";
      else sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    send(first);

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") send("ping");
    }, PING_EVERY_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  // The bar always renders (so it can never silently vanish); numbers fill in
  // once the API answers, and a short note appears if it can't.
  const ITEMS = [
    {
      key: "online" as const,
      label: "ONLINE NOW",
      value: stats?.online ?? 0,
      note: "Browsing right now",
      live: true,
    },
    {
      key: "today" as const,
      label: "VISITORS TODAY",
      value: stats?.today ?? 0,
      note: "Since midnight (PKT)",
      live: false,
    },
    {
      key: "total" as const,
      label: "TOTAL VISITORS",
      value: stats?.total ?? 0,
      note: "Since we started counting",
      live: false,
    },
  ];

  return (
    <section className="section py-12" aria-label="Live visitor counter">
      <div className="relative overflow-hidden rounded-2xl bg-[#040711] px-5 py-6 shadow-gold sm:px-8 sm:py-7">
        <div aria-hidden className="hero-orb hero-orb-a" style={{ opacity: 0.35 }} />
        <div aria-hidden className="hero-orb hero-orb-b" style={{ opacity: 0.25 }} />
        <div aria-hidden className="hero-grid absolute inset-0" />

        <div className="relative flex flex-col items-stretch gap-6 lg:flex-row lg:items-center lg:gap-8">
          <p className="inline-flex shrink-0 items-center gap-2.5 self-center text-[11px] font-semibold tracking-[0.25em] text-white/80 lg:self-auto">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            LIVE VISITORS
          </p>

          <div className="grid flex-1 grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {ITEMS.map((c) => (
              <div
                key={c.key}
                className="flex items-center justify-center gap-4 py-4 first:pt-0 last:pb-0 sm:px-6 sm:py-0"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-[1px] border-gold-light/30 bg-gold/10 text-gold-light">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {ICONS[c.key]}
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="stat-number font-display text-2xl font-bold leading-none sm:text-3xl">
                    {stats ? <AnimatedNumber value={c.value} /> : "—"}
                  </p>
                  <p className="mt-1.5 flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-white/70">
                    {c.live && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </span>
                    )}
                    {c.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-white/40">{c.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {failed && !stats && (
          <p role="status" className="relative mt-4 text-center text-xs text-white/45">
            Live numbers are temporarily unavailable. They will appear as soon as they are.
          </p>
        )}
      </div>
    </section>
  );
}
