import type { CaseStudy } from "@/lib/projects";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import MetricCounter from "@/components/MetricCounter";

/** Case-study section for the project detail page: results, before/after slider, challenge → solution → result. */
export default function CaseStudyBlock({ cs, title }: { cs: CaseStudy; title: string }) {
  const steps = [
    { n: "01", label: "The challenge", text: cs.challenge },
    { n: "02", label: "Our solution", text: cs.solution },
    { n: "03", label: "The result", text: cs.result },
  ].filter((s) => s.text);

  return (
    <section className="mt-16" aria-labelledby="case-study-title">
      <div className="text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          CASE STUDY
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="case-study-title" className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
          The <span className="text-gold">results</span>
        </h2>
      </div>

      {cs.metrics.length > 0 && (
        <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
          {cs.metrics.map((m) => (
            <li key={m.label} className="rgb-box rounded-xl p-5 text-center" style={{ ["--box-fill" as string]: "#ffffff" }}>
              <p className="font-display text-3xl font-bold text-gold sm:text-4xl">
                <MetricCounter value={m.value} />
              </p>
              <p className="mt-1 text-xs text-muted">{m.label}</p>
            </li>
          ))}
        </ul>
      )}

      {cs.beforeImage && cs.afterImage && (
        <div className="mx-auto mt-10 max-w-4xl">
          <BeforeAfterSlider before={cs.beforeImage} after={cs.afterImage} alt={title} />
          <p className="mt-2 text-center text-[11px] text-muted">Drag the handle to compare before and after.</p>
        </div>
      )}

      {steps.length > 0 && (
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-xl border border-line bg-white p-6">
              <p className="font-display text-xs font-bold tracking-widest text-gold">{s.n}</p>
              <h3 className="mt-2 font-display text-base font-semibold text-ink">{s.label}</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
