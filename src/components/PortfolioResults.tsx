import Link from "next/link";
import type { Project } from "@/lib/projects";
import { CATEGORY_LABELS } from "@/lib/projects";

/** "Results that matter" strip on /portfolio — pulls from projects that have a case study. Hidden if none do. */
export default function PortfolioResults({ projects }: { projects: Project[] }) {
  const list = projects.filter((p) => p.caseStudy && p.caseStudy.metrics.length > 0).slice(0, 3);
  if (list.length === 0) return null;

  return (
    <section className="section pb-0" aria-labelledby="portfolio-results-title">
      <div className="text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          CASE STUDIES
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="portfolio-results-title" className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Results that <span className="text-gold">move the needle</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Real numbers from real projects. Open a case study to see the before and after.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {list.map((p) => (
          <Link
            key={p.id}
            href={`/portfolio/${p.id}#case-study-title`}
            className="rgb-box group flex flex-col rounded-xl p-6"
            style={{ ["--box-fill" as string]: "#ffffff" }}
          >
            <p className="text-[10px] font-bold tracking-widest text-gold">{CATEGORY_LABELS[p.category].toUpperCase()}</p>
            <h3 className="mt-2 font-display text-lg font-semibold text-ink">{p.title}</h3>
            {p.client && <p className="text-xs text-muted">for {p.client}</p>}
            <dl className="mt-5 grid grid-cols-2 gap-4">
              {p.caseStudy!.metrics.slice(0, 4).map((m) => (
                <div key={m.label}>
                  <dt className="sr-only">{m.label}</dt>
                  <dd className="font-display text-2xl font-bold text-gold">{m.value}</dd>
                  <p className="text-[11px] leading-snug text-muted" aria-hidden>
                    {m.label}
                  </p>
                </div>
              ))}
            </dl>
            <span className="mt-6 text-xs font-semibold text-gold">
              Read case study <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
