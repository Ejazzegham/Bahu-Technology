"use client";

import { useEffect, useMemo, useState } from "react";
import { subscribeClients, type Client } from "@/lib/firestore/clients";
import { subscribeReviews, type Review } from "@/lib/firestore/reviews";
import Stars from "@/components/Stars";

/**
 * Client logo wall + review rating summary for the portfolio page.
 * Logos come from Admin → Clients (upload a logo per client); a client with no
 * logo shows its name as text. Ratings are computed live from Admin → Reviews.
 * The whole section hides itself until there's something to show.
 */
export default function ClientLogoWall() {
  const [clients, setClients] = useState<Client[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const a = subscribeClients(setClients);
    const b = subscribeReviews(setReviews);
    return () => {
      a?.();
      b?.();
    };
  }, []);

  const stats = useMemo(() => {
    if (reviews.length === 0) return null;
    const dist = [0, 0, 0, 0, 0];
    let sum = 0;
    for (const r of reviews) {
      const v = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      dist[v - 1]++;
      sum += v;
    }
    return { avg: sum / reviews.length, count: reviews.length, dist };
  }, [reviews]);

  if (clients.length === 0 && !stats) return null;

  return (
    <section className="section pb-0" aria-labelledby="logo-wall-title">
      <div className="text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          TRUSTED BY
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="logo-wall-title" className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Brands that <span className="text-gold">build with us</span>
        </h2>
      </div>

      <div className={`mt-10 grid gap-6 ${stats && clients.length > 0 ? "lg:grid-cols-[320px_1fr]" : ""}`}>
        {stats && (
          <div className="rgb-box flex flex-col justify-center rounded-xl p-6" style={{ ["--box-fill" as string]: "#ffffff" }}>
            <div className="flex items-end gap-3">
              <span className="font-display text-5xl font-bold leading-none text-ink">{stats.avg.toFixed(1)}</span>
              <span className="pb-1 text-sm text-muted">/ 5</span>
            </div>
            <Stars value={stats.avg} size={18} className="mt-3" />
            <p className="mt-2 text-xs text-muted">
              Based on {stats.count} client {stats.count === 1 ? "review" : "reviews"}
            </p>
            <ul className="mt-5 space-y-1.5" aria-label="Rating breakdown">
              {[5, 4, 3, 2, 1].map((n) => {
                const c = stats.dist[n - 1];
                const pct = stats.count ? (c / stats.count) * 100 : 0;
                return (
                  <li key={n} className="flex items-center gap-2 text-[11px] text-muted">
                    <span className="w-6 shrink-0 tabular-nums">{n}★</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <span className="block h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-6 shrink-0 text-right tabular-nums">{c}</span>
                  </li>
                );
              })}
            </ul>
            <a href="#testimonials" className="mt-5 text-xs font-semibold text-gold underline-offset-2 hover:underline">
              Read the reviews ↓
            </a>
          </div>
        )}

        {clients.length > 0 && (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-label="Our clients">
            {clients.map((c) => {
              const inner = c.logoUrl ? (
                // Plain <img>: logos can come from any host an admin pastes/uploads to.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.logoUrl}
                  alt={`${c.name} logo`}
                  loading="lazy"
                  className="max-h-12 w-auto max-w-[80%] object-contain opacity-60 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                />
              ) : (
                <span className="px-3 text-center font-display text-base font-semibold tracking-tight text-ink/40 transition-colors group-hover:text-gold">
                  {c.name}
                </span>
              );
              const cls =
                "group flex h-24 items-center justify-center rounded-xl border border-line bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-gold";
              return (
                <li key={c.id}>
                  {c.website ? (
                    <a href={c.website} target="_blank" rel="noopener noreferrer" className={cls} aria-label={c.name}>
                      {inner}
                    </a>
                  ) : (
                    <div className={cls}>{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
