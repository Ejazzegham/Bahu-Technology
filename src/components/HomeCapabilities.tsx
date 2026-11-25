import { Zap, ShieldCheck, Search, Smartphone, BarChart3, Headphones, type LucideIcon } from "lucide-react";

const ITEMS: { icon: LucideIcon; title: string; text: string; grad: string; tint: string }[] = [
  { icon: Zap, title: "Fast by Design", text: "Lean code and optimised assets so your site loads quickly everywhere.", grad: "from-amber-400 to-orange-500", tint: "bg-amber-50" },
  { icon: Smartphone, title: "Fully Responsive", text: "Layouts that feel native on phones, tablets and desktops.", grad: "from-sky-400 to-blue-600", tint: "bg-sky-50" },
  { icon: Search, title: "SEO Ready", text: "Clean structure and metadata that help search engines find you.", grad: "from-emerald-400 to-teal-600", tint: "bg-emerald-50" },
  { icon: ShieldCheck, title: "Secure & Reliable", text: "Sensible security practices and dependable hosting from day one.", grad: "from-violet-400 to-purple-600", tint: "bg-violet-50" },
  { icon: BarChart3, title: "Built to Grow", text: "Scalable foundations and analytics so you can measure what works.", grad: "from-pink-400 to-rose-600", tint: "bg-rose-50" },
  { icon: Headphones, title: "Human Support", text: "Talk to the people who built it, before and after launch.", grad: "from-cyan-400 to-indigo-600", tint: "bg-cyan-50" },
];

export default function HomeCapabilities() {
  return (
    <section className="section pt-0" aria-labelledby="home-capabilities-title">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          WHAT YOU GET
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="home-capabilities-title" className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Quality built into <span className="text-gold">every project</span>
        </h2>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((it) => (
          <div key={it.title} className={`group rounded-xl border border-line ${it.tint} p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}>
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${it.grad} text-white shadow-md transition-transform duration-200 group-hover:rotate-6`}>
              <it.icon size={22} strokeWidth={1.8} />
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-ink">{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{it.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
