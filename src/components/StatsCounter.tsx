"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 15, suffix: "+", label: "Years of Experience" },
  { value: 2000, suffix: "+", label: "Projects Completed" },
  { value: 1330, suffix: "+", label: "Happy Clients" },
  { value: 100, suffix: "%", label: "Client Satisfaction" },
];

function Counter({ to, suffix, run }: { to: number; suffix: string; run: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(to);
      return;
    }
    const start = performance.now();
    const dur = 1800;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);

  return (
    <>
      {n.toLocaleString("en-US")}
      {suffix}
    </>
  );
}

export default function StatsCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#040711]">
      <div aria-hidden className="hero-orb hero-orb-a" style={{ opacity: 0.5 }} />
      <div aria-hidden className="hero-orb hero-orb-c" style={{ opacity: 0.4 }} />
      <div aria-hidden className="hero-grid absolute inset-0" />
      <div ref={ref} className="section relative grid grid-cols-2 gap-y-10 py-16 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="reveal-item text-center">
            <p className="stat-number font-display text-4xl font-bold sm:text-5xl">
              <Counter to={s.value} suffix={s.suffix} run={run} />
            </p>
            <p className="mt-2 text-xs font-semibold tracking-[0.2em] text-white/60">
              {s.label.toUpperCase()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
