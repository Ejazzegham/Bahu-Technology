"use client";

import { useEffect, useRef, useState } from "react";
import VisitorGlobe from "./VisitorGlobe";

type Stats = {
  online: number;
  today: number;
  total: number;
  pageViews: number;
  livePoints?: { cc: string; lat: number; lng: number; city?: string }[];
  countries?: { cc: string; name: string; lat: number; lng: number; count: number }[];
  you?: { cc: string; lat: number; lng: number; city?: string } | null;
};

/** 🇵🇰 from "PK" — regional-indicator letters. */
function flag(cc: string): string {
  return cc
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

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

  // The section always renders (so it can never silently vanish); numbers
  // fill in once the API answers, and a short note appears if it can't.
  const CARDS = [
    {
      key: "online" as const,
      label: "ONLINE NOW",
      value: stats?.online ?? 0,
      note: "People browsing right now",
      live: true,
    },
    {
      key: "today" as const,
      label: "VISITORS TODAY",
      value: stats?.today ?? 0,
      note: "Unique visitors since midnight (Pakistan time)",
      live: false,
    },
    {
      key: "total" as const,
      label: "TOTAL VISITORS",
      value: stats?.total ?? 0,
      note: "Unique visitors since we started counting",
      live: false,
    },
  ];

  return (
    <section className="section py-16">
      <div className="relative overflow-hidden rounded-3xl bg-[#040711] px-6 py-12 shadow-gold sm:px-12 sm:py-16">
        <div aria-hidden className="hero-orb hero-orb-a" style={{ opacity: 0.45 }} />
        <div aria-hidden className="hero-orb hero-orb-b" style={{ opacity: 0.35 }} />
        <div aria-hidden className="hero-grid absolute inset-0" />

        <div className="relative mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2.5 rounded-full border-[1px] border-white/15 bg-white/[0.04] px-4 py-1.5 text-[11px] font-semibold tracking-[0.25em] text-white/80 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            LIVE VISITOR INSIGHTS
          </p>
          <h2 className="mt-5 font-display text-2xl font-semibold text-white sm:text-4xl">
            Join Our Growing <span className="text-gold-light">Online Community</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
            Real-time numbers from people exploring Bahu Technology — updated live, no estimates.
          </p>
        </div>

        <div className="relative mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          {/* Globe */}
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 blur-3xl"
            />
            <VisitorGlobe
              live={(stats?.livePoints ?? []).map((p) => ({ lat: p.lat, lng: p.lng, label: p.city }))}
              countries={(stats?.countries ?? []).map((c) => ({ lat: c.lat, lng: c.lng, count: c.count }))}
              you={stats?.you ? { lat: stats.you.lat, lng: stats.you.lng } : null}
            />
            <div className="relative mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Online now
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-300" /> Visitor countries
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Bahu HQ
              </span>
              <span className="text-white/35">Drag to rotate</span>
            </div>
          </div>

          {/* Numbers + top countries */}
          <div className="relative">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {CARDS.map((c) => (
                <div
                  key={c.key}
                  className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border-[1px] border-white/10 bg-white/[0.04] p-5 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-light/50 hover:bg-white/[0.07] sm:flex-col sm:text-center lg:flex-row lg:text-left"
                >
                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-[1px] border-gold-light/30 bg-gold/10 text-gold-light">
                    <svg
                      width="22"
                      height="22"
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
                  <div className="relative min-w-0">
                    <p className="stat-number font-display text-3xl font-bold sm:text-4xl">
                      {stats ? <AnimatedNumber value={c.value} /> : "—"}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-white/70 sm:justify-center lg:justify-start">
                      {c.live && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </span>
                      )}
                      {c.label}
                    </p>
                    <p className="mt-1 text-xs leading-snug text-white/40">{c.note}</p>
                  </div>
                </div>
              ))}
            </div>

            {stats?.countries && stats.countries.length > 0 && (
              <div className="mt-5 rounded-2xl border-[1px] border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                <p className="text-[11px] font-semibold tracking-[0.2em] text-white/70">TOP VISITOR COUNTRIES</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {stats.countries.slice(0, 8).map((c) => (
                    <li
                      key={c.cc}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/80"
                    >
                      <span aria-hidden>{flag(c.cc)}</span>
                      {c.name}
                      <span className="font-semibold text-gold-light">{c.count.toLocaleString("en-US")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {failed && !stats && (
              <p role="status" className="mt-4 text-xs text-white/45">
                Live numbers are temporarily unavailable. The globe will fill in as soon as they are.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
