"use client";

import { useEffect, useRef } from "react";
import { LAND_LEFT, LAND_ROWS, LAND_STEP, LAND_TOP } from "@/lib/geo-data";

export type GlobePoint = { lat: number; lng: number; label?: string };
export type GlobeCountry = { lat: number; lng: number; count: number };

type Props = {
  /** People online right now — pulsing green markers with arcs from the studio. */
  live: GlobePoint[];
  /** Countries visitors have come from — blue markers sized by visitor count. */
  countries: GlobeCountry[];
  /** The current visitor; the globe turns to face them first. */
  you?: GlobePoint | null;
  /** The studio (Faisalabad, Pakistan). */
  home?: GlobePoint;
};

const RAD = Math.PI / 180;
const TILT = 18 * RAD;
const HOME_DEFAULT: GlobePoint = { lat: 31.4, lng: 73.1 };

// Land dots are the same every frame, so they're built once at module load.
const LAND: { lat: number; lng: number }[] = (() => {
  const out: { lat: number; lng: number }[] = [];
  LAND_ROWS.forEach((row, r) => {
    const lat = LAND_TOP - r * LAND_STEP - LAND_STEP / 2;
    for (let c = 0; c < row.length; c++) {
      if (row[c] === "1") out.push({ lat, lng: LAND_LEFT + c * LAND_STEP + LAND_STEP / 2 });
    }
  });
  return out;
})();

type Vec = [number, number, number];
const toVec = (lat: number, lng: number): Vec => {
  const la = lat * RAD;
  const lo = lng * RAD;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
};

/** Great-circle point between two unit vectors, lifted off the surface by `lift`. */
function arcPoint(a: Vec, b: Vec, t: number, lift: number): Vec {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const om = Math.acos(dot);
  const so = Math.sin(om) || 1e-6;
  const k1 = Math.sin((1 - t) * om) / so;
  const k2 = Math.sin(t * om) / so;
  const h = 1 + lift * Math.sin(Math.PI * t);
  return [(a[0] * k1 + b[0] * k2) * h, (a[1] * k1 + b[1] * k2) * h, (a[2] * k1 + b[2] * k2) * h];
}

export default function VisitorGlobe({ live, countries, you, home = HOME_DEFAULT }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Latest props, read by the animation loop without restarting it.
  const dataRef = useRef({ live, countries, you, home });
  const focusRef = useRef<number | null>(null);

  useEffect(() => {
    dataRef.current = { live, countries, you, home };
    if (you && focusRef.current === null) focusRef.current = you.lng;
  }, [live, countries, you, home]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let size = 0;
    let dpr = 1;
    let rot = (dataRef.current.you?.lng ?? dataRef.current.home.lng) ; // centre longitude, degrees
    let dragging = false;
    let lastX = 0;
    let velocity = 0;
    let visible = true;
    let raf = 0;
    let last = performance.now();

    const resize = () => {
      const w = Math.max(240, Math.min(wrap.clientWidth, 560));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = w;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(w * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${w}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(wrap);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      velocity = 0;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      rot -= dx * 0.4;
      velocity = -dx * 0.4;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      canvas.style.cursor = "grab";
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) {
        last = now;
        return;
      }
      const dt = Math.min(64, now - last);
      last = now;

      // Turn to face the visitor once their location arrives.
      if (focusRef.current !== null && !dragging) {
        const diff = ((focusRef.current - rot + 540) % 360) - 180;
        rot += diff * Math.min(1, dt * 0.004);
        if (Math.abs(diff) < 0.5) focusRef.current = null;
      } else if (!dragging) {
        velocity *= 0.95;
        rot += velocity + (reduced ? 0 : dt * 0.008);
      }

      const R = size * 0.4;
      const cx = size / 2;
      const cy = size / 2;
      const lam0 = rot * RAD;
      const sinT = Math.sin(TILT);
      const cosT = Math.cos(TILT);

      // Orthographic projection; z > 0 means the point faces the viewer.
      const project = (v: Vec, scale = 1) => {
        const lat = Math.asin(Math.max(-1, Math.min(1, v[1] / Math.hypot(v[0], v[1], v[2]))));
        const lng = Math.atan2(v[0], v[2]);
        const dl = lng - lam0;
        const cl = Math.cos(dl);
        const r = Math.hypot(v[0], v[1], v[2]) * scale;
        const x = r * Math.cos(lat) * Math.sin(dl);
        const y = r * (cosT * Math.sin(lat) - sinT * Math.cos(lat) * cl);
        const z = r * (sinT * Math.sin(lat) + cosT * Math.cos(lat) * cl);
        return { x: cx + x * R, y: cy - y * R, z };
      };
      const proj = (lat: number, lng: number) => project(toVec(lat, lng));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // Atmosphere glow
      const glow = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.32);
      glow.addColorStop(0, "rgba(91,157,255,0.30)");
      glow.addColorStop(0.45, "rgba(20,119,245,0.10)");
      glow.addColorStop(1, "rgba(20,119,245,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.32, 0, Math.PI * 2);
      ctx.fill();

      // Ocean sphere with a soft light from the upper left
      const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      body.addColorStop(0, "#14306b");
      body.addColorStop(0.6, "#091a40");
      body.addColorStop(1, "#040b1f");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Graticule
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = "rgba(120,170,255,0.10)";
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let pen = false;
        for (let lng = -180; lng <= 180; lng += 6) {
          const p = proj(lat, lng);
          if (p.z > 0) {
            if (!pen) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
            pen = true;
          } else pen = false;
        }
        ctx.stroke();
      }
      for (let lng = -180; lng < 180; lng += 30) {
        ctx.beginPath();
        let pen = false;
        for (let lat = -90; lat <= 90; lat += 6) {
          const p = proj(lat, lng);
          if (p.z > 0) {
            if (!pen) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
            pen = true;
          } else pen = false;
        }
        ctx.stroke();
      }

      // Land dots — brighter toward the centre of the disc
      const dot = Math.max(1, R * 0.0105);
      for (let i = 0; i < LAND.length; i++) {
        const p = proj(LAND[i].lat, LAND[i].lng);
        if (p.z <= 0.02) continue;
        const a = 0.18 + 0.7 * Math.pow(p.z, 0.8);
        ctx.fillStyle = `rgba(110,170,255,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, dot * (0.6 + 0.5 * p.z), 0, Math.PI * 2);
        ctx.fill();
      }

      const { live: livePts, countries: cts, home: hq } = dataRef.current;
      const t = now / 1000;

      // Arcs from the studio to everyone online
      const hv = toVec(hq.lat, hq.lng);
      ctx.lineWidth = 1.2;
      livePts.slice(0, 14).forEach((pt, idx) => {
        const bv = toVec(pt.lat, pt.lng);
        const steps = 36;
        ctx.beginPath();
        let pen = false;
        for (let s = 0; s <= steps; s++) {
          const p = project(arcPoint(hv, bv, s / steps, 0.28));
          if (p.z > 0) {
            if (!pen) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
            pen = true;
          } else pen = false;
        }
        ctx.strokeStyle = "rgba(52,211,153,0.28)";
        ctx.stroke();

        // a travelling spark
        const k = (t * 0.35 + idx * 0.17) % 1;
        const sp = project(arcPoint(hv, bv, k, 0.28));
        if (sp.z > 0) {
          ctx.fillStyle = "rgba(167,243,208,0.95)";
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Countries visitors came from
      const maxCount = Math.max(1, ...cts.map((c) => c.count));
      cts.forEach((c) => {
        const p = proj(c.lat, c.lng);
        if (p.z <= 0.05) return;
        const rr = (2 + 4 * Math.sqrt(c.count / maxCount)) * (R / 220);
        ctx.fillStyle = "rgba(91,157,255,0.22)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, rr * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(147,197,253,0.95)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
        ctx.fill();
      });

      // People online now — pulsing green
      livePts.forEach((pt, idx) => {
        const p = proj(pt.lat, pt.lng);
        if (p.z <= 0.05) return;
        const ph = (t * 0.9 + idx * 0.31) % 1;
        ctx.strokeStyle = `rgba(52,211,153,${(0.7 * (1 - ph)).toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + ph * 13, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#34d399";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // The studio
      const hp = proj(hq.lat, hq.lng);
      if (hp.z > 0.05) {
        const ph = (t * 0.6) % 1;
        ctx.strokeStyle = `rgba(251,191,36,${(0.8 * (1 - ph)).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(hp.x, hp.y, 4 + ph * 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(hp.x, hp.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = `600 ${Math.max(10, R * 0.045)}px var(--font-body), sans-serif`;
        ctx.fillText("Bahu HQ", hp.x + 9, hp.y - 8);
      }

      // Rim light + edge shading to sell the sphere
      const rim = ctx.createRadialGradient(cx, cy, R * 0.78, cx, cy, R);
      rim.addColorStop(0, "rgba(91,157,255,0)");
      rim.addColorStop(1, "rgba(120,180,255,0.30)");
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div ref={wrapRef} className="flex w-full justify-center">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Interactive globe showing where Bahu Technology's website visitors are located. Drag to rotate."
        className="max-w-full cursor-grab touch-pan-y select-none"
      />
    </div>
  );
}
