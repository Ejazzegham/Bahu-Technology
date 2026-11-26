import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "@/lib/firebase";

// Special offers shown on the home page. Admins create them in
// Admin → Special Offers. The home page shows the first offer that is
// switched on AND currently inside its start/end window; when nothing
// qualifies, the section simply isn't rendered.

export type DiscountType = "percent" | "flat";

export type Offer = {
  id: string;
  active: boolean;
  badge: string; // small pill, e.g. "LIMITED TIME OFFER"
  title: string; // e.g. "Complete Branding Package"
  description: string;
  features: string[]; // premium feature bullet points
  discountType: DiscountType;
  discountValue: number; // 30 => 30% off, or a flat amount off
  currency: string; // "$", "Rs", "PKR" ...
  originalPrice: number | null; // optional, enables the price display
  couponCode: string;
  ctaLabel: string;
  ctaHref: string;
  startsAt: number | null; // epoch ms, null = starts immediately
  endsAt: number | null; // epoch ms, null = never ends (no countdown)
  createdAt: number;
};

export type OfferInput = Omit<Offer, "id" | "createdAt">;

export const EMPTY_OFFER: OfferInput = {
  active: true,
  badge: "LIMITED TIME OFFER",
  title: "",
  description: "",
  features: [],
  discountType: "percent",
  discountValue: 20,
  currency: "$",
  originalPrice: null,
  couponCode: "",
  ctaLabel: "Claim This Offer",
  ctaHref: "/contact",
  startsAt: null,
  endsAt: null,
};

/** One-click starting point for the admin form. */
export const BRANDING_TEMPLATE: OfferInput = {
  ...EMPTY_OFFER,
  badge: "SPECIAL OFFER",
  title: "Complete Branding Package",
  description:
    "Everything your business needs to look unforgettable — a full brand identity designed by experts, delivered ready to launch.",
  features: [
    "Custom logo design with unlimited revisions",
    "Full brand guidelines (colors, type, usage)",
    "Business card, letterhead & stationery",
    "Social media kit & profile branding",
    "Premium website landing page design",
    "Source files & priority 24/7 support",
  ],
  discountType: "percent",
  discountValue: 30,
  originalPrice: 499,
  couponCode: "BRAND30",
};

function toMillis(v: unknown): number | null {
  if (typeof v === "number") return v;
  const t = (v as { toMillis?: () => number } | null | undefined)?.toMillis?.();
  return typeof t === "number" ? t : null;
}

function docToOffer(id: string, d: Record<string, unknown>): Offer {
  return {
    id,
    active: d.active === true,
    badge: (d.badge as string) ?? "",
    title: (d.title as string) ?? "",
    description: (d.description as string) ?? "",
    features: Array.isArray(d.features) ? (d.features as string[]) : [],
    discountType: d.discountType === "flat" ? "flat" : "percent",
    discountValue: Number(d.discountValue ?? 0),
    currency: (d.currency as string) ?? "$",
    originalPrice: d.originalPrice == null ? null : Number(d.originalPrice),
    couponCode: (d.couponCode as string) ?? "",
    ctaLabel: (d.ctaLabel as string) || "Claim This Offer",
    ctaHref: (d.ctaHref as string) || "/contact",
    startsAt: toMillis(d.startsAt),
    endsAt: toMillis(d.endsAt),
    createdAt: toMillis(d.createdAt) ?? 0,
  };
}

/** Public home-page feed: only offers switched on (matches the Firestore
 * rule, which only lets visitors read `active == true` documents). */
export function subscribeActiveOffers(cb: (offers: Offer[]) => void): Unsubscribe | null {
  if (!isFirebaseConfigured) {
    cb([]);
    return null;
  }
  const q = query(collection(getDb(), "offers"), where("active", "==", true));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => docToOffer(d.id, d.data()))),
    () => cb([])
  );
}

/** Admin feed: every offer, newest first. */
export function subscribeAllOffers(cb: (offers: Offer[]) => void): Unsubscribe | null {
  if (!isFirebaseConfigured) {
    cb([]);
    return null;
  }
  const q = query(collection(getDb(), "offers"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => docToOffer(d.id, d.data()))),
    () => cb([])
  );
}

export async function addOffer(input: OfferInput): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  await addDoc(collection(getDb(), "offers"), { ...input, createdAt: serverTimestamp() });
}

export async function updateOffer(id: string, input: Partial<OfferInput>): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  await updateDoc(doc(getDb(), "offers", id), input);
}

export async function deleteOffer(id: string): Promise<void> {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  await deleteDoc(doc(getDb(), "offers", id));
}

export type OfferStatus = "live" | "scheduled" | "expired" | "paused";

export function offerStatus(o: Pick<Offer, "active" | "startsAt" | "endsAt">, now = Date.now()): OfferStatus {
  if (!o.active) return "paused";
  if (o.startsAt && now < o.startsAt) return "scheduled";
  if (o.endsAt && now >= o.endsAt) return "expired";
  return "live";
}

/** Price after the discount, or null when no original price was entered. */
export function discountedPrice(o: Pick<Offer, "originalPrice" | "discountType" | "discountValue">): number | null {
  if (o.originalPrice == null || !Number.isFinite(o.originalPrice)) return null;
  const off = o.discountType === "percent" ? (o.originalPrice * o.discountValue) / 100 : o.discountValue;
  return Math.max(0, Math.round(o.originalPrice - off));
}

/** Text for the big badge: "30%" or "$100". */
export function discountLabel(o: Pick<Offer, "discountType" | "discountValue" | "currency">): string {
  return o.discountType === "percent" ? `${o.discountValue}%` : `${o.currency}${o.discountValue}`;
}
