"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addOffer,
  BRANDING_TEMPLATE,
  deleteOffer,
  discountedPrice,
  discountLabel,
  EMPTY_OFFER,
  offerStatus,
  subscribeAllOffers,
  updateOffer,
  type DiscountType,
  type Offer,
  type OfferInput,
  type OfferStatus,
} from "@/lib/firestore/offers";

const inputClass =
  "w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none";
const labelClass = "mb-1.5 block text-xs font-medium text-muted";

type FormState = {
  active: boolean;
  badge: string;
  title: string;
  description: string;
  featuresText: string;
  discountType: DiscountType;
  discountValue: string;
  currency: string;
  originalPrice: string;
  couponCode: string;
  ctaLabel: string;
  ctaHref: string;
  startsAt: string; // datetime-local value
  endsAt: string;
};

/** epoch ms -> value for <input type="datetime-local"> (local time). */
function toLocalInput(ms: number | null): string {
  if (!ms) return "";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(v: string): number | null {
  if (!v) return null;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

function toForm(o: OfferInput): FormState {
  return {
    active: o.active,
    badge: o.badge,
    title: o.title,
    description: o.description,
    featuresText: o.features.join("\n"),
    discountType: o.discountType,
    discountValue: String(o.discountValue),
    currency: o.currency,
    originalPrice: o.originalPrice == null ? "" : String(o.originalPrice),
    couponCode: o.couponCode,
    ctaLabel: o.ctaLabel,
    ctaHref: o.ctaHref,
    startsAt: toLocalInput(o.startsAt),
    endsAt: toLocalInput(o.endsAt),
  };
}

function fromForm(f: FormState): OfferInput {
  const orig = f.originalPrice.trim() === "" ? null : Number(f.originalPrice);
  return {
    active: f.active,
    badge: f.badge.trim(),
    title: f.title.trim(),
    description: f.description.trim(),
    features: f.featuresText.split("\n").map((l) => l.trim()).filter(Boolean),
    discountType: f.discountType,
    discountValue: Number(f.discountValue),
    currency: f.currency.trim() || "$",
    originalPrice: orig != null && Number.isFinite(orig) ? orig : null,
    couponCode: f.couponCode.trim().toUpperCase(),
    ctaLabel: f.ctaLabel.trim() || "Claim This Offer",
    ctaHref: f.ctaHref.trim() || "/contact",
    startsAt: fromLocalInput(f.startsAt),
    endsAt: fromLocalInput(f.endsAt),
  };
}

const STATUS_STYLE: Record<OfferStatus, string> = {
  live: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  scheduled: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  expired: "bg-red-500/10 text-red-600 border-red-500/30",
  paused: "bg-black/5 text-muted border-line",
};
const STATUS_LABEL: Record<OfferStatus, string> = {
  live: "Live on home page",
  scheduled: "Scheduled",
  expired: "Expired",
  paused: "Paused",
};

function fmt(ms: number | null) {
  return ms ? new Date(ms).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
}

export default function AdminOffersCard() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [form, setForm] = useState<FormState>(toForm(EMPTY_OFFER));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const unsub = subscribeAllOffers(setOffers);
    return () => unsub?.();
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const preview = useMemo(() => fromForm(form), [form]);
  const previewPrice = discountedPrice(preview);

  function flash(msg: string) {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 2800);
  }

  function reset() {
    setEditingId(null);
    setForm(toForm(EMPTY_OFFER));
    setError("");
  }

  function endsInDays(days: number) {
    set("endsAt", toLocalInput(Date.now() + days * 86400000));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const data = fromForm(form);
    if (!data.title) return setError("Please enter an offer title.");
    if (!Number.isFinite(data.discountValue) || data.discountValue <= 0)
      return setError("Discount value must be greater than 0.");
    if (data.discountType === "percent" && data.discountValue > 100)
      return setError("A percentage discount can't be more than 100.");
    if (data.originalPrice != null && data.discountType === "flat" && data.discountValue > data.originalPrice)
      return setError("A flat discount can't be larger than the original price.");
    if (data.startsAt && data.endsAt && data.endsAt <= data.startsAt)
      return setError("The end date must be after the start date.");

    setSaving(true);
    try {
      if (editingId) {
        await updateOffer(editingId, data);
        flash("Offer updated — the home page is already showing the change.");
      } else {
        await addOffer(data);
        flash(data.active ? "Offer published — it's now on the home page." : "Offer saved (paused).");
      }
      reset();
    } catch {
      setError("Couldn't save the offer. Check you're signed in as an admin and Firestore rules are deployed.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(o: Offer) {
    setEditingId(o.id);
    setForm(toForm(o));
    setError("");
    document.getElementById("offer-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function toggle(o: Offer) {
    try {
      await updateOffer(o.id, { active: !o.active });
    } catch {
      alert("Couldn't update the offer. Please try again.");
    }
  }

  async function remove(o: Offer) {
    if (!confirm(`Delete the offer "${o.title}"? This removes it from the home page.`)) return;
    try {
      await deleteOffer(o.id);
      if (editingId === o.id) reset();
    } catch {
      alert("Couldn't delete the offer. Please try again.");
    }
  }

  const liveCount = offers.filter((o) => offerStatus(o) === "live").length;

  return (
    <div className="space-y-6">
      {/* ---------------- form ---------------- */}
      <div className="card !p-6 sm:!p-8" id="offer-form">
        <h2 className="text-center font-display text-xl font-semibold text-ink sm:text-2xl">
          {editingId ? "Edit" : "Create"} <span className="text-gold">Special Offer</span>
        </h2>
        <p className="mt-1 text-center text-xs text-muted">
          Active offers appear in the dark &quot;Special Offer&quot; section on the home page. If several are live,
          the newest one is shown.
        </p>

        {!editingId && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setForm(toForm(BRANDING_TEMPLATE))}
              className="rounded-full border border-gold/40 px-4 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold hover:text-white"
            >
              ✦ Use &quot;Complete Branding&quot; template
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-3xl space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Offer title *</label>
              <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Complete Branding Package" />
            </div>
            <div>
              <label className={labelClass}>Badge text</label>
              <input className={inputClass} value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="LIMITED TIME OFFER" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="One or two sentences selling the offer." />
          </div>

          <div>
            <label className={labelClass}>Premium features (one per line)</label>
            <textarea rows={6} className={inputClass} value={form.featuresText} onChange={(e) => set("featuresText", e.target.value)} placeholder={"Custom logo design\nBrand guidelines\nSocial media kit"} />
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className={labelClass}>Discount type</label>
              <select className={inputClass} value={form.discountType} onChange={(e) => set("discountType", e.target.value as DiscountType)}>
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat amount</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Discount value *</label>
              <input type="number" min="0" step="any" className={inputClass} value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <input className={inputClass} value={form.currency} onChange={(e) => set("currency", e.target.value)} placeholder="$" />
            </div>
            <div>
              <label className={labelClass}>Original price</label>
              <input type="number" min="0" step="any" className={inputClass} value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} placeholder="optional" />
            </div>
          </div>

          <p className="-mt-2 rounded-md bg-bg-soft px-3 py-2 text-xs text-muted">
            Preview: badge shows <strong className="text-ink">SAVE {Number.isFinite(preview.discountValue) ? discountLabel(preview) : "—"}</strong>
            {previewPrice != null && preview.originalPrice != null && (
              <>
                {" "}· price <s>{preview.currency}{preview.originalPrice}</s> → <strong className="text-ink">{preview.currency}{previewPrice}</strong>
              </>
            )}
            {preview.originalPrice == null && " · add an original price to also show the before/after price."}
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Coupon code (optional)</label>
              <input className={inputClass} value={form.couponCode} onChange={(e) => set("couponCode", e.target.value)} placeholder="BRAND30" />
            </div>
            <div>
              <label className={labelClass}>Button text</label>
              <input className={inputClass} value={form.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Button link</label>
              <input className={inputClass} value={form.ctaHref} onChange={(e) => set("ctaHref", e.target.value)} placeholder="/contact" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Starts (optional — blank = right away)</label>
              <input type="datetime-local" className={inputClass} value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Ends (optional — enables the countdown)</label>
              <input type="datetime-local" className={inputClass} value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
              <div className="mt-2 flex flex-wrap gap-2">
                {[3, 7, 14, 30].map((d) => (
                  <button key={d} type="button" onClick={() => endsInDays(d)} className="rounded-full border border-line px-3 py-1 text-[11px] font-medium text-muted transition-colors hover:border-gold hover:text-gold">
                    {d} days from now
                  </button>
                ))}
                {form.endsAt && (
                  <button type="button" onClick={() => set("endsAt", "")} className="rounded-full px-3 py-1 text-[11px] font-medium text-muted underline">
                    no end date
                  </button>
                )}
              </div>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
            <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-[#1477f5]" />
            Show this offer on the home page
          </label>

          {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-600">{error}</p>}
          {notice && <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600">{notice}</p>}

          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? "Saving…" : editingId ? "Update Offer" : "Publish Offer"}
            </button>
            {(editingId || form.title) && (
              <button type="button" onClick={reset} className="btn-outline">
                {editingId ? "Cancel edit" : "Clear"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ---------------- list ---------------- */}
      <div className="card !p-6 sm:!p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-ink">All offers</h2>
          <span className="text-xs text-muted">
            {liveCount > 0 ? `${liveCount} live on the home page` : "Nothing is live — the home section is hidden"}
          </span>
        </div>

        {offers.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted">No offers yet. Create your first one above.</p>
        ) : (
          <ul className="mt-5 divide-y divide-line">
            {offers.map((o) => {
              const status = offerStatus(o);
              return (
                <li key={o.id} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-ink">{o.title}</p>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[status]}`}>
                        {STATUS_LABEL[status]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      SAVE {discountLabel(o)}
                      {o.couponCode && <> · code {o.couponCode}</>} · starts {fmt(o.startsAt)} · ends {fmt(o.endsAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggle(o)} className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-gold hover:text-gold">
                      {o.active ? "Pause" : "Activate"}
                    </button>
                    <button onClick={() => startEdit(o)} className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-gold hover:text-gold">
                      Edit
                    </button>
                    <button onClick={() => remove(o)} className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:border-red-400 hover:bg-red-500/5">
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
