import Link from "next/link";
import { CalendarCheck, Calculator, LayoutGrid } from "lucide-react";

/**
 * Home-page "three ways to start" strip: a low-friction entry point for
 * visitors who are ready to act but not sure how.
 */
const OPTIONS = [
  {
    icon: CalendarCheck,
    title: "Book a free consultation",
    text: "Tell us about your idea and we'll suggest the best way forward.",
    href: "/contact",
    cta: "Contact us",
    tone: "from-sky-500 to-blue-600",
    soft: "bg-sky-50",
  },
  {
    icon: Calculator,
    title: "Check our packages",
    text: "Compare five packages for any service and pick what fits your budget.",
    href: "/pricing",
    cta: "See pricing",
    tone: "from-violet-500 to-purple-600",
    soft: "bg-violet-50",
  },
  {
    icon: LayoutGrid,
    title: "Browse our work first",
    text: "See real websites, apps and brands we've launched for clients.",
    href: "/portfolio",
    cta: "View portfolio",
    tone: "from-pink-500 to-rose-600",
    soft: "bg-rose-50",
  },
];

export default function HomeGetStarted() {
  return (
    <section className="section pt-0" aria-labelledby="home-start-title">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          GET STARTED
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="home-start-title" className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Start your way, <span className="text-gold">at your pace</span>
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {OPTIONS.map(({ icon: Icon, title, text, href, cta, tone, soft }) => (
          <Link key={title} href={href} className="card group flex flex-col">
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-white bg-gradient-to-br ${tone}`}>
              <Icon size={22} aria-hidden />
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{text}</p>
            <span className={`mt-5 inline-flex w-fit items-center gap-1 rounded-md px-3 py-1 text-xs font-bold text-ink ${soft}`}>
              {cta} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
