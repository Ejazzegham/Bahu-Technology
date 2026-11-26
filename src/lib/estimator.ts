// Project budget & timeline estimator — pricing model.
//
// ⚠️  THE NUMBERS BELOW ARE PLACEHOLDERS. Replace them with your real rates
// before going live; nothing else needs to change. All amounts are USD.
//
//   total = (base + per-unit × units + selected feature costs) × design tier × urgency
//   shown as a range: −15% … +25%, rounded to the nearest $50
//   weeks = (baseWeeks + per-unit weeks × units + feature weeks) × urgency, rounded up

export type EstService = "web" | "mobile" | "desktop" | "graphic";

export type EstFeature = { id: string; label: string; cost: number; weeks: number };

export type EstServiceConfig = {
  label: string;
  base: number;
  baseWeeks: number;
  unitLabel: string;
  unitMin: number;
  unitMax: number;
  unitDefault: number;
  perUnit: number;
  perUnitWeeks: number;
  /** What the "serviceValue" in the contact form is called for this service. */
  contactService: string;
  features: EstFeature[];
};

export const EST_SERVICES: Record<EstService, EstServiceConfig> = {
  web: {
    label: "Website",
    contactService: "Web Design & Development",
    base: 600,
    baseWeeks: 1.5,
    unitLabel: "Pages",
    unitMin: 1,
    unitMax: 30,
    unitDefault: 5,
    perUnit: 80,
    perUnitWeeks: 0.2,
    features: [
      { id: "cms", label: "CMS / blog you can edit", cost: 400, weeks: 0.5 },
      { id: "ecom", label: "Online store & payments", cost: 1400, weeks: 2 },
      { id: "auth", label: "User accounts / login", cost: 700, weeks: 1 },
      { id: "booking", label: "Booking / forms with email", cost: 300, weeks: 0.4 },
      { id: "seo", label: "SEO setup & analytics", cost: 250, weeks: 0.3 },
      { id: "multilang", label: "Multi-language", cost: 500, weeks: 0.7 },
    ],
  },
  mobile: {
    label: "Mobile app",
    contactService: "Mobile App Development",
    base: 2500,
    baseWeeks: 4,
    unitLabel: "Screens",
    unitMin: 3,
    unitMax: 40,
    unitDefault: 10,
    perUnit: 150,
    perUnitWeeks: 0.25,
    features: [
      { id: "both", label: "iOS + Android (cross-platform)", cost: 1500, weeks: 1.5 },
      { id: "auth", label: "User accounts / login", cost: 800, weeks: 1 },
      { id: "payments", label: "In-app payments", cost: 1200, weeks: 1.5 },
      { id: "push", label: "Push notifications", cost: 400, weeks: 0.5 },
      { id: "admin", label: "Admin dashboard", cost: 1800, weeks: 2.5 },
      { id: "offline", label: "Offline mode", cost: 900, weeks: 1.2 },
    ],
  },
  desktop: {
    label: "Desktop software",
    contactService: "Desktop Software",
    base: 2000,
    baseWeeks: 3,
    unitLabel: "Modules",
    unitMin: 1,
    unitMax: 20,
    unitDefault: 4,
    perUnit: 450,
    perUnitWeeks: 0.8,
    features: [
      { id: "db", label: "Database & reporting", cost: 900, weeks: 1.2 },
      { id: "auth", label: "Multi-user roles & permissions", cost: 800, weeks: 1 },
      { id: "print", label: "Invoices / printing / PDF export", cost: 400, weeks: 0.5 },
      { id: "sync", label: "Cloud sync / backup", cost: 1100, weeks: 1.5 },
      { id: "installer", label: "Installer & auto-update", cost: 350, weeks: 0.5 },
    ],
  },
  graphic: {
    label: "Graphic design",
    contactService: "Graphic Design",
    base: 120,
    baseWeeks: 0.5,
    unitLabel: "Deliverables",
    unitMin: 1,
    unitMax: 30,
    unitDefault: 3,
    perUnit: 60,
    perUnitWeeks: 0.15,
    features: [
      { id: "logo", label: "Logo with variations", cost: 150, weeks: 0.4 },
      { id: "guide", label: "Brand guidelines document", cost: 250, weeks: 0.6 },
      { id: "social", label: "Social media kit", cost: 180, weeks: 0.4 },
      { id: "print", label: "Print-ready files", cost: 90, weeks: 0.2 },
      { id: "motion", label: "Simple motion / animation", cost: 300, weeks: 0.7 },
    ],
  },
};

export type DesignTier = "template" | "custom" | "premium";
export const DESIGN_TIERS: { id: DesignTier; label: string; hint: string; mult: number }[] = [
  { id: "template", label: "Template-based", hint: "Fast & budget-friendly", mult: 0.75 },
  { id: "custom", label: "Custom design", hint: "Tailored to your brand", mult: 1 },
  { id: "premium", label: "Premium", hint: "Unique visuals & motion", mult: 1.4 },
];

export type Urgency = "standard" | "rush";
export const URGENCY: { id: Urgency; label: string; hint: string; cost: number; time: number }[] = [
  { id: "standard", label: "Standard", hint: "Normal schedule", cost: 1, time: 1 },
  { id: "rush", label: "Rush", hint: "~30% faster, +30% cost", cost: 1.3, time: 0.7 },
];

export type EstimateInput = {
  service: EstService;
  units: number;
  features: string[];
  design: DesignTier;
  urgency: Urgency;
};

export type Estimate = {
  low: number;
  high: number;
  weeksLow: number;
  weeksHigh: number;
  /** Matches the budget chips in the contact form. */
  budgetBucket: string;
  breakdown: { label: string; amount: number }[];
};

const round50 = (n: number) => Math.max(50, Math.round(n / 50) * 50);

export function budgetBucketFor(high: number): string {
  if (high < 500) return "Under $500";
  if (high <= 2000) return "$500 – $2,000";
  if (high <= 5000) return "$2,000 – $5,000";
  return "$5,000+";
}

export function computeEstimate(input: EstimateInput): Estimate {
  const cfg = EST_SERVICES[input.service];
  const tier = DESIGN_TIERS.find((t) => t.id === input.design) ?? DESIGN_TIERS[1];
  const urg = URGENCY.find((u) => u.id === input.urgency) ?? URGENCY[0];
  const units = Math.min(cfg.unitMax, Math.max(cfg.unitMin, input.units));
  const chosen = cfg.features.filter((f) => input.features.includes(f.id));

  const subtotal = cfg.base + cfg.perUnit * units + chosen.reduce((s, f) => s + f.cost, 0);
  const total = subtotal * tier.mult * urg.cost;
  const weeks = (cfg.baseWeeks + cfg.perUnitWeeks * units + chosen.reduce((s, f) => s + f.weeks, 0)) * urg.time;

  const breakdown = [
    { label: `${cfg.label} foundation`, amount: cfg.base },
    { label: `${units} ${cfg.unitLabel.toLowerCase()}`, amount: cfg.perUnit * units },
    ...chosen.map((f) => ({ label: f.label, amount: f.cost })),
  ];

  const low = round50(total * 0.85);
  const high = round50(total * 1.25);
  return {
    low,
    high,
    weeksLow: Math.max(1, Math.ceil(weeks * 0.9)),
    weeksHigh: Math.max(1, Math.ceil(weeks * 1.2)),
    budgetBucket: budgetBucketFor(high),
    breakdown,
  };
}

export const fmtUsd = (n: number) => `$${n.toLocaleString("en-US")}`;
