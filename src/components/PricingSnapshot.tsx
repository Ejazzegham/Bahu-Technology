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
 */
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
  const delivery = (t: FirestorePricingTier) => t.features.find((f) => /^delivery in/i.test(f));

  return (
    <section className="section pt-0" aria-labelledby="pricing-snapshot-title">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          PRICING AT A GLANCE
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="pricing-snapshot-title" className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Know the cost <span className="text-gold">before you ask</span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
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
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
                on ? "border-gold bg-gold text-white" : "border-line bg-white text-ink hover:border-gold hover:text-gold"
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center">
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="font-semibold text-ink">Category</span>
          <div className="w-64 max-w-[16rem] sm:w-72 sm:max-w-xs">
            <Dropdown
              ariaLabel="Category"
              value={subSlug}
              onChange={setSubSlug}
              options={group.subcategories.map((s) => ({ value: s.slug, label: s.label }))}
              className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink transition-colors hover:border-gold/60 focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {tiers.map((t) => (
          <div
            key={t.id}
            className={`card relative flex flex-col !p-5 text-center ${t.highlighted ? "!border-gold shadow-gold" : ""}`}
          >
            {t.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-3 py-0.5 text-[10px] font-bold tracking-wider text-white">
                {t.badge}
              </span>
            )}
            <p className="text-xs font-semibold tracking-[0.15em] text-muted">{t.name.toUpperCase()}</p>
            <p className="mt-2 font-display text-3xl font-bold text-ink">{t.price}</p>
            <p className="mt-1 text-xs text-muted">{t.priceNote}</p>
            {delivery(t) && <p className="mt-3 text-xs font-medium text-gold">{delivery(t)}</p>}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href={`/pricing`} className="btn-primary">
          See full package details{sub ? ` for ${sub.label}` : ""}
        </Link>
      </div>
    </section>
  );
}
