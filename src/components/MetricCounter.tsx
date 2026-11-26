"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates the number inside a metric value like "+212%", "3.4x", "$1.2M", "40 hrs".
 * Anything it can't parse is shown as written. Respects reduced-motion.
 */
export default function MetricCounter({ value }: { value: string }) {
  const m = /^(\D*?)(\d[\d,]*\.?\d*)(.*)$/.exec(value.trim());
  const target = m ? parseFloat(m[2].replace(/,/g, "")) : NaN;
  const decimals = m && m[2].includes(".") ? m[2].split(".")[1].length : 0;
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (Number.isNaN(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  useEffect(() => {
    if (!run || Number.isNaN(target)) return;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 1400);
      setN(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [run, target]);

  if (!m || Number.isNaN(target)) return <span>{value}</span>;
  const shown = n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref}>
      {m[1]}
      {shown}
      {m[3]}
    </span>
  );
}
