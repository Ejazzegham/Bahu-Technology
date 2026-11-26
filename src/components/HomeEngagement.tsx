import Link from "next/link";

const MODELS = [
  {
    title: "Fixed-Price Project",
    tag: "Best for a defined scope",
    text: "A clear scope, timeline and price agreed upfront. Ideal for websites, apps, logos and brand kits.",
    points: ["Clear deliverables", "Milestone-based delivery", "No surprise costs"],
    cta: { href: "/pricing", label: "SEE PRICING" },
  },
  {
    title: "Dedicated Team",
    tag: "Best for growing products",
    text: "Designers and developers who work as an extension of your team, month after month.",
    points: ["Flexible capacity", "Direct communication", "Scale up or down"],
    cta: { href: "/contact", label: "TALK TO US" },
    featured: true,
  },
  {
    title: "Support & Maintenance",
    tag: "Best after launch",
    text: "Keep your site or app fast, secure and up to date while you focus on running the business.",
    points: ["Updates & bug fixes", "Performance checks", "Priority response"],
    cta: { href: "/contact", label: "GET A PLAN" },
  },
];

export default function HomeEngagement() {
  return (
    <section className="section pt-0" aria-labelledby="home-engagement-title">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          WAYS TO WORK WITH US
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="home-engagement-title" className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Pick the model that <span className="text-gold">fits you.</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          One-off project or long-term partner, we adapt to how you like to work.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
        {MODELS.map((m) => (
          <div
            key={m.title}
            className={`card flex flex-col ${m.featured ? "lg:-translate-y-2 shadow-gold" : ""}`}
          >
            <span
              className={`inline-flex w-fit rounded-md px-3 py-1 text-[10px] font-semibold tracking-[0.18em] ${
                m.featured ? "bg-gold text-white" : "bg-gold/10 text-gold"
              }`}
            >
              {m.tag.toUpperCase()}
            </span>
            <h3 className="mt-5 font-display text-xl font-semibold text-ink">{m.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{m.text}</p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {m.points.map((pt) => (
                <li key={pt} className="flex items-center gap-2.5 text-sm text-ink/90">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-gold" aria-hidden>
                    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
                    <path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {pt}
                </li>
              ))}
            </ul>
            <Link
              href={m.cta.href}
              className="mt-7 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gold"
            >
              {m.cta.label} <span aria-hidden>→</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
