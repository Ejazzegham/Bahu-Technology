"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DESIGN_TIERS,
  EST_SERVICES,
  URGENCY,
  computeEstimate,
  fmtUsd,
  type DesignTier,
  type EstService,
  type Urgency,
} from "@/lib/estimator";

const SERVICE_IDS = Object.keys(EST_SERVICES) as EstService[];

const chip = (on: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
    on ? "border-gold bg-gold/10 text-gold" : "border-line text-muted hover:border-gold/50 hover:text-gold"
  }`;

export default function ProjectEstimator() {
  const [service, setService] = useState<EstService>("web");
  const cfg = EST_SERVICES[service];
  const [units, setUnits] = useState(cfg.unitDefault);
  const [features, setFeatures] = useState<string[]>([]);
  const [design, setDesign] = useState<DesignTier>("custom");
  const [urgency, setUrgency] = useState<Urgency>("standard");

  const pickService = (s: EstService) => {
    setService(s);
    setUnits(EST_SERVICES[s].unitDefault);
    setFeatures([]);
  };

  const est = useMemo(() => computeEstimate({ service, units, features, design, urgency }), [service, units, features, design, urgency]);

  const href = useMemo(() => {
    const featureLabels = cfg.features.filter((f) => features.includes(f.id)).map((f) => f.label);
    const summary = `${cfg.label}: ${fmtUsd(est.low)} – ${fmtUsd(est.high)}, ${est.weeksLow}–${est.weeksHigh} weeks (${units} ${cfg.unitLabel.toLowerCase()}, ${
      DESIGN_TIERS.find((d) => d.id === design)?.label
    }${urgency === "rush" ? ", rush" : ""}${featureLabels.length ? "; " + featureLabels.join(", ") : ""})`;
    const q = new URLSearchParams({
      service: cfg.contactService,
      budget: est.budgetBucket,
      timeline: urgency === "rush" ? "ASAP" : est.weeksHigh <= 8 ? "1 – 2 months" : "3+ months",
      estimate: summary,
    });
    return `/contact?${q.toString()}#project-brief`;
  }, [cfg, features, est, units, design, urgency]);

  return (
    <section id="estimator" className="section pb-0" aria-labelledby="estimator-title">
      <div className="text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          PROJECT ESTIMATOR
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="estimator-title" className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          What will your project <span className="text-gold">cost &amp; take?</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Answer a few quick questions for a ballpark budget and timeline. No sign-up needed.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rgb-box space-y-7 rounded-xl p-6 sm:p-8" style={{ ["--box-fill" as string]: "#ffffff" }}>
          <fieldset>
            <legend className="mb-3 text-xs font-semibold text-ink">1. What do you need?</legend>
            <div className="flex flex-wrap gap-2">
              {SERVICE_IDS.map((s) => (
                <button key={s} type="button" aria-pressed={service === s} onClick={() => pickService(s)} className={chip(service === s)}>
                  {EST_SERVICES[s].label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="est-units" className="mb-3 flex items-center justify-between text-xs font-semibold text-ink">
              <span>2. How many {cfg.unitLabel.toLowerCase()}?</span>
              <span className="rounded-full bg-gold/10 px-3 py-0.5 text-gold">{units}</span>
            </label>
            <input
              id="est-units"
              type="range"
              min={cfg.unitMin}
              max={cfg.unitMax}
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="w-full accent-gold"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted">
              <span>{cfg.unitMin}</span>
              <span>{cfg.unitMax}</span>
            </div>
          </div>

          <fieldset>
            <legend className="mb-3 text-xs font-semibold text-ink">
              3. Extras <span className="font-normal text-muted">(pick any)</span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {cfg.features.map((f) => {
                const on = features.includes(f.id);
                return (
                  <label
                    key={f.id}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-xs transition-colors ${
                      on ? "border-gold bg-gold/5 text-ink" : "border-line text-muted hover:border-gold/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => setFeatures((cur) => (on ? cur.filter((x) => x !== f.id) : [...cur, f.id]))}
                      className="h-4 w-4 accent-gold"
                    />
                    {f.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-xs font-semibold text-ink">4. Design level</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {DESIGN_TIERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={design === t.id}
                  onClick={() => setDesign(t.id)}
                  className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    design === t.id ? "border-gold bg-gold/5" : "border-line hover:border-gold/40"
                  }`}
                >
                  <span className="block text-xs font-semibold text-ink">{t.label}</span>
                  <span className="block text-[11px] text-muted">{t.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-xs font-semibold text-ink">5. Schedule</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {URGENCY.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  aria-pressed={urgency === u.id}
                  onClick={() => setUrgency(u.id)}
                  className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    urgency === u.id ? "border-gold bg-gold/5" : "border-line hover:border-gold/40"
                  }`}
                >
                  <span className="block text-xs font-semibold text-ink">{u.label}</span>
                  <span className="block text-[11px] text-muted">{u.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start" aria-live="polite">
          <div className="overflow-hidden rounded-xl bg-gradient-to-br from-[#0a1230] to-[#04060f] p-6 text-white shadow-xl sm:p-8">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-white/60">YOUR ESTIMATE</p>
            <p className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
              {fmtUsd(est.low)} <span className="text-white/50">–</span> {fmtUsd(est.high)}
            </p>
            <p className="mt-2 text-sm text-white/80">
              About <strong className="text-white">{est.weeksLow === est.weeksHigh ? est.weeksLow : `${est.weeksLow}–${est.weeksHigh}`}</strong>{" "}
              {est.weeksHigh === 1 ? "week" : "weeks"} to deliver
            </p>

            <ul className="mt-5 space-y-1.5 border-t border-white/15 pt-4 text-xs text-white/75">
              {est.breakdown.map((b) => (
                <li key={b.label} className="flex justify-between gap-3">
                  <span>{b.label}</span>
                  <span className="tabular-nums text-white/90">{fmtUsd(b.amount)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] leading-relaxed text-white/45">
              Line items show base rates before design level and schedule adjustments. The range reflects typical variation
              in scope.
            </p>

            <Link href={href} className="btn-primary mt-6 w-full justify-center">
              Get an exact quote <span aria-hidden>→</span>
            </Link>
            <p className="mt-3 text-center text-[10px] text-white/45">Sends this estimate with your project brief.</p>
          </div>
          <p className="mt-3 text-center text-[11px] text-muted">
            This is a rough guide, not a fixed price. Final quotes depend on your exact requirements.
          </p>
        </aside>
      </div>
    </section>
  );
}
