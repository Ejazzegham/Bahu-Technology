"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  discountedPrice,
  discountLabel,
  offerStatus,
  subscribeActiveOffers,
  type Offer,
} from "@/lib/firestore/offers";

/**
 * Dark, fully animated "Special Offer" section for the home page.
 * It is driven entirely by Admin → Special Offers: the newest offer that is
 * switched on and inside its start/end window is shown; if there isn't one,
 * nothing is rendered at all.
 */

const SPARKS = [
  { l: "5%", t: "18%", s: 10, d: 6, o: 0 },
  { l: "12%", t: "72%", s: 7, d: 8, o: 1.2 },
  { l: "27%", t: "10%", s: 6, d: 7, o: 2.4 },
  { l: "46%", t: "86%", s: 9, d: 9, o: 0.6 },
  { l: "63%", t: "8%", s: 7, d: 6.5, o: 3 },
  { l: "78%", t: "80%", s: 10, d: 8.5, o: 1.8 },
  { l: "90%", t: "22%", s: 8, d: 7.5, o: 2.8 },
  { l: "96%", t: "62%", s: 6, d: 9.5, o: 4 },
];

function useInView<T extends HTMLElement>() {
  // Callback ref: the section only mounts once the offer has loaded, so we
  // start observing at the moment the element actually appears.
  const [el, setEl] = useState<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (seen || !el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [el, seen]);
  return [setEl, seen] as const;
}

/** Eased count-up from 0 to `to`, starting once `start` is true. */
function useCountUp(to: number, start: boolean, ms = 1500) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, start, ms]);
  return v;
}

function Digit({ value, label }: { value: number; label: string }) {
  const text = String(value).padStart(2, "0");
  return (
    <div className="offer-time">
      <span key={text} className="offer-time-num">
        {text}
      </span>
      <span className="offer-time-label">{label}</span>
    </div>
  );
}

function Countdown({ endsAt, now }: { endsAt: number; now: number }) {
  const left = Math.max(0, endsAt - now);
  const s = Math.floor(left / 1000);
  return (
    <div className="offer-countdown" role="timer" aria-label="Time left on this offer">
      <Digit value={Math.floor(s / 86400)} label="Days" />
      <span className="offer-colon" aria-hidden>:</span>
      <Digit value={Math.floor((s % 86400) / 3600)} label="Hours" />
      <span className="offer-colon" aria-hidden>:</span>
      <Digit value={Math.floor((s % 3600) / 60)} label="Mins" />
      <span className="offer-colon" aria-hidden>:</span>
      <Digit value={s % 60} label="Secs" />
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function OfferCta({ offer }: { offer: Offer }) {
  const cls = "offer-cta";
  const inner = (
    <>
      <span>{offer.ctaLabel}</span>
      <span aria-hidden className="offer-cta-arrow">→</span>
    </>
  );
  if (/^https?:\/\//i.test(offer.ctaHref)) {
    return (
      <a href={offer.ctaHref} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={offer.ctaHref} className={cls}>
      {inner}
    </Link>
  );
}

export default function SpecialOffer() {
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [now, setNow] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sectionRef, seen] = useInView<HTMLElement>();

  useEffect(() => {
    const unsub = subscribeActiveOffers(setOffers);
    return () => unsub?.();
  }, []);

  // One-second clock (also keeps "expired" offers from lingering).
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const offer = useMemo(() => {
    if (!offers || !now) return null;
    return (
      offers
        .filter((o) => offerStatus(o, now) === "live")
        .sort((a, b) => b.createdAt - a.createdAt)[0] ?? null
    );
  }, [offers, now]);

  const price = offer ? discountedPrice(offer) : null;
  const pctValue = useCountUp(offer?.discountValue ?? 0, seen);
  const priceValue = useCountUp(price ?? 0, seen, 1800);

  if (!offer) return null;

  const badgeNumber =
    offer.discountType === "percent" ? `${pctValue}%` : `${offer.currency}${pctValue}`;
  const ribbon = [offer.badge || "SPECIAL OFFER", `SAVE ${discountLabel(offer)}`, offer.title.toUpperCase()].filter(Boolean);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(offer!.couponCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the code is still visible to copy by hand */
    }
  }

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--ox", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--oy", `${e.clientY - r.top}px`);
  }

  return (
    <section
      ref={sectionRef}
      id="special-offer"
      data-no-reveal
      className={`offer-section ${seen ? "is-in" : ""}`}
      aria-label="Special offer"
    >
      {/* ---- living background ---- */}
      <div aria-hidden className="offer-bg">
        <div className="offer-aurora offer-aurora-1" />
        <div className="offer-aurora offer-aurora-2" />
        <div className="offer-aurora offer-aurora-3" />
        <div className="offer-aurora offer-aurora-4" />
        <div className="offer-grid" />
        <div className="offer-rays" />
        {SPARKS.map((p, i) => (
          <span
            key={i}
            className="offer-spark"
            style={{
              left: p.l,
              top: p.t,
              width: p.s,
              height: p.s,
              animationDuration: `${p.d}s`,
              animationDelay: `-${p.o}s`,
            }}
          />
        ))}
      </div>

      {/* ---- scrolling ribbon ---- */}
      <div aria-hidden className="offer-ribbon">
        <div className="offer-ribbon-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="offer-ribbon-set">
              {Array.from({ length: 4 }).flatMap((_, r) =>
                ribbon.map((t, i) => (
                  <span key={`${r}-${i}`} className="offer-ribbon-item">
                    <i>✦</i> {t}
                  </span>
                ))
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10 lg:py-24">
        {/* ---- left: pitch ---- */}
        <div>
          <span className="offer-rise offer-pill" style={{ ["--i" as string]: 0 }}>
            <span className="offer-pill-dot" />
            {offer.badge || "Special Offer"}
          </span>

          <h2 className="offer-rise offer-title" style={{ ["--i" as string]: 1 }}>
            {offer.title}
          </h2>

          {offer.description && (
            <p className="offer-rise offer-desc" style={{ ["--i" as string]: 2 }}>
              {offer.description}
            </p>
          )}

          {offer.features.length > 0 && (
            <ul className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {offer.features.map((f, i) => (
                <li
                  key={`${f}-${i}`}
                  className="offer-rise offer-feature"
                  style={{ ["--i" as string]: 3 + i * 0.5 }}
                >
                  <span className="offer-check">
                    <CheckIcon />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="offer-rise mt-9 flex flex-wrap items-center gap-4" style={{ ["--i" as string]: 3 + offer.features.length * 0.5 }}>
            <OfferCta offer={offer} />
            {offer.couponCode && (
              <button type="button" onClick={copyCode} className="offer-coupon" aria-label={`Copy coupon code ${offer.couponCode}`}>
                <span className="offer-coupon-label">Use code</span>
                <strong>{offer.couponCode}</strong>
                <span className="offer-coupon-copy">{copied ? "Copied ✓" : "Copy"}</span>
              </button>
            )}
          </div>
        </div>

        {/* ---- right: the offer card ---- */}
        <div className="offer-rise" style={{ ["--i" as string]: 2 }}>
          <div className="offer-card" onMouseMove={onMove}>
            <div className="offer-card-glow" aria-hidden />
            <div className="offer-card-inner">
              <div className="offer-seal" aria-hidden>
                <span className="offer-seal-ring" />
                <span className="offer-seal-ring offer-seal-ring-2" />
                <div className="offer-seal-core">
                  <span className="offer-seal-small">SAVE</span>
                  <span className="offer-seal-num">{badgeNumber}</span>
                  <span className="offer-seal-small">TODAY</span>
                </div>
              </div>

              {price != null && offer.originalPrice != null && (
                <div className="mt-6 text-center">
                  <p className="offer-was">
                    {offer.currency}
                    {offer.originalPrice.toLocaleString()}
                  </p>
                  <p className="offer-now">
                    <span className="offer-now-cur">{offer.currency}</span>
                    {(seen ? priceValue : 0).toLocaleString()}
                  </p>
                  <p className="offer-now-note">special price after discount</p>
                </div>
              )}

              {offer.endsAt && (
                <div className="mt-7">
                  <p className="offer-ends">Offer ends in</p>
                  <Countdown endsAt={offer.endsAt} now={now} />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
