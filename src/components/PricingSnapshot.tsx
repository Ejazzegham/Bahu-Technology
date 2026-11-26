"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PRICING_GROUPS } from "@/lib/pricing";
import { subscribePricingTiers, type FirestorePricingTier } from "@/lib/firestore/pricing";
import Dropdown from "@/components/ui/Dropdown";

/**
 * Home-page "pricing at a glance": pick a service, pick a category, and see
 * the five package prices side by side. Uses the same live tier data as the
 * Pricing page (including anything edited in the admin), so the numbers
 * never disagree.
 *
 * Each package gets its own colour so the ladder reads at a glance, on a
 * vivid full-width gradient band.
 */

// Full class strings (not interpolated) so Tailwind's JIT picks them all up.
const PALETTE = [
  { bar: "from-emerald-400 to-teal-500", price: "from-emerald-500 to-teal-600", dot: "bg-emerald-400", check: "text-emerald-500", btn: "bg-emerald-500 hover:bg-emerald-600", soft: "bg-emerald-50 text-emerald-700" },
  { bar: "from-sky-400 to-blue-500", price: "from-sky-500 to-blue-600", dot: "bg-sky-400", check: "text-sky-500", btn: "bg-sky-500 hover:bg-sky-600", soft: "bg-sky-50 text-sky-700" },
  { bar: "from-violet-500 to-purple-600", price: "from-violet-500 to-purple-600", dot: "bg-violet-400", check: "text-violet-500", btn: "bg-violet-500 hover:bg-violet-600", soft: "bg-violet-50 text-violet-700" },
  { bar: "from-amber-400 to-orange-500", price: "from-amber-500 to-orange-600", dot: "bg-amber-400", check: "text-amber-500", btn: "bg-orange-500 hover:bg-orange-600", soft: "bg-amber-50 text-amber-700" },
  { bar: "from-pink-500 to-rose-500", price: "from-pink-500 to-rose-600", dot: "bg-pink-400", check: "text-rose-500", btn: "bg-rose-500 hover:bg-rose-600", soft: "bg-rose-50 text-rose-700" },
] as const;

const PERKS = ["No hidden fees", "Free consultation", "Revisions included", "Post-launch support"];

const isDelivery = (f: string) => /^delivery in/i.test(f);

function Check({ className }: { className: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={`mt-0.5 shrink-0 ${className}`} aria-hidden>
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
      <path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PricingSnapshot() {
  const [groupSlug, setGroupSlug] = useState(PRICING_GROUPS[0].slug);
  const group = useMemo(() => PRICING_GROUPS.find((g) => g.slug === groupSlug) ?? PRICING_GROUPS[0], [groupSlug]);
  const [subSlug, setSubSlug] = useState(group.subcategories[0]?.slug ?? "");
  const [tiers, setTiers] = useState<FirestorePricingTier[]>([]);

  // Reset the category whenever the service changes.
  useEffect(() => {
    setSubSlug(group.subcategories[0]?.slug ?? "");
  }, [group]);

  useEffect(() => {
    if (!subSlug) return;
    const unsub = subscribePricingTiers(subSlug, setTiers);
    return () => unsub?.();
  }, [subSlug]);

  const sub = group.subcategories.find((s) => s.slug === subSlug);
  const delivery = (t: FirestorePricingTier) => t.features.find(isDelivery);

  return (
    <section
      className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 py-20"
      aria-labelledby="pricing-snapshot-title"
    >
      {/* colour blobs + dot texture */}
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-cyan-400/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-24 top-1/3 -z-10 h-96 w-96 rounded-full bg-pink-500/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/4 -z-10 h-80 w-80 rounded-full bg-amber-400/30 blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-amber-300">
            <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-amber-300" />
            PRICING AT A GLANCE
            <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-amber-300" />
          </p>
          <h2 id="pricing-snapshot-title" className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
            Know the cost{" "}
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
              before you ask
            </span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            Pick a service to see our five packages side by side. No hidden fees.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Service">
          {PRICING_GROUPS.map((g) => {
            const on = g.slug === groupSlug;
            return (
              <button
                key={g.slug}
                role="tab"
                aria-selected={on}
                onClick={() => setGroupSlug(g.slug)}
                className={`rounded-md border px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                  on
                    ? "border-white bg-white text-indigo-700 shadow-lg shadow-black/20"
                    : "border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-3 text-sm text-white/80">
            <span className="font-semibold text-white">Category</span>
            <div className="w-64 max-w-[16rem] sm:w-72 sm:max-w-xs">
              <Dropdown
                ariaLabel="Category"
                value={subSlug}
                onChange={setSubSlug}
                options={group.subcategories.map((s) => ({ value: s.slug, label: s.label }))}
                className="w-full rounded-md border border-white/40 bg-white px-3 py-2 text-sm text-ink transition-colors hover:border-amber-300 focus:border-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:items-start">
          {tiers.length === 0
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/15" aria-hidden />
              ))
            : tiers.map((t, i) => {
                const c = PALETTE[i % PALETTE.length];
                const extras = t.features.filter((f) => !isDelivery(f)).slice(0, 3);
                return (
                  <div
                    key={t.id}
                    className={`group relative flex flex-col rounded-2xl shadow-xl shadow-black/20 transition-transform duration-300 hover:-translate-y-2 ${
                      t.highlighted ? "ring-4 ring-amber-300 lg:-translate-y-3" : ""
                    } ${t.badge ? "mt-3 lg:mt-0" : ""}`}
                  >
                    {/* Badge sits OUTSIDE the clipped card so it can straddle the top edge, centred */}
                    {t.badge && (
                      <span
                        className={`absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gradient-to-r ${c.bar} px-4 py-1 text-[10px] font-bold tracking-[0.18em] text-white shadow-lg shadow-black/30 ring-2 ring-white`}
                      >
                        {t.badge}
                      </span>
                    )}
                    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-white text-center">
                    <div className={`h-2 w-full bg-gradient-to-r ${c.bar}`} />
                    <div className="flex flex-1 flex-col p-5 pt-6">
                      <p className="flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.15em] text-muted">
                        <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden />
                        {t.name.toUpperCase()}
                      </p>
                      <p className={`mt-3 bg-gradient-to-r ${c.price} bg-clip-text font-display text-3xl font-bold text-transparent`}>
                        {t.price}
                      </p>
                      <p className="mt-1 text-xs text-muted">{t.priceNote}</p>

                      {delivery(t) && (
                        <p className={`mx-auto mt-3 rounded-md px-3 py-1 text-xs font-semibold ${c.soft}`}>{delivery(t)}</p>
                      )}

                      {extras.length > 0 && (
                        <ul className="mt-4 space-y-2 text-left text-xs leading-snug text-ink/80">
                          {extras.map((f) => (
                            <li key={f} className="flex gap-2">
                              <Check className={c.check} />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <Link
                        href="/pricing"
                        className={`mt-5 inline-flex items-center justify-center gap-1 rounded-lg px-4 py-2 text-xs font-bold tracking-wide text-white transition-colors ${c.btn}`}
                      >
                        VIEW PACKAGE <span aria-hidden>→</span>
                      </Link>
                    </div>
                    </div>
                  </div>
                );
              })}
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {PERKS.map((p) => (
            <li
              key={p}
              className="flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" aria-hidden />
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5"
          >
            See full package details{sub ? ` for ${sub.label}` : ""} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
