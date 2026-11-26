"use client";

import { useCallback, useRef, useState } from "react";

/** Drag (mouse / touch / pen) or use ← → keys to compare a "before" and "after" image. */
export default function BeforeAfterSlider({
  before,
  after,
  alt,
}: {
  before: string;
  after: string;
  alt: string;
}) {
  const [pos, setPos] = useState(50); // % of the width showing the BEFORE image
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }, []);

  return (
    <div
      ref={box}
      className="rgb-box relative aspect-[16/10] w-full select-none overflow-hidden rounded-xl bg-bg-soft touch-pan-y"
      onPointerDown={(e) => {
        dragging.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && move(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt={`${alt} — after`} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt={`${alt} — before`} draggable={false} className="h-full w-full object-cover" />
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/70 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">
        BEFORE
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-md bg-emerald-500 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">
        AFTER
      </span>

      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" style={{ left: `${pos}%` }}>
        <button
          type="button"
          role="slider"
          aria-label="Compare before and after"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
            if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
          }}
          className="pointer-events-auto absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-md border-2 border-white bg-gold text-xs font-bold text-white shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/40"
        >
          ⇄
        </button>
      </div>
    </div>
  );
}
