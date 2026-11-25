import { Check, X } from "lucide-react";

const ROWS = [
  { topic: "Communication", us: "Regular progress updates and quick replies", them: "Silence until the deadline" },
  { topic: "Pricing", us: "Clear packages, no surprises", them: "Hidden costs and add-ons" },
  { topic: "Ownership", us: "Source code and files are yours", them: "Locked in to the agency" },
  { topic: "Revisions", us: "Included until it matches your vision", them: "Charged per change" },
  { topic: "After launch", us: "Post-launch support and fixes", them: "Gone once the invoice is paid" },
  { topic: "Privacy", us: "Confidential by default, NDA on request", them: "Your ideas are an afterthought" },
];

export default function HomeComparison() {
  return (
    <section className="section pt-0" aria-labelledby="home-compare-title">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          THE BAHU DIFFERENCE
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="home-compare-title" className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Why clients choose us over <span className="text-gold">a typical agency</span>
        </h2>
      </div>

      <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_1fr] bg-[#040711] text-xs font-semibold tracking-[0.18em] text-white sm:grid-cols-[1fr_1.4fr_1.4fr]">
          <div className="hidden px-6 py-4 sm:block" />
          <div className="bg-gold-gradient px-4 py-4 text-center sm:px-6">BAHU TECHNOLOGY</div>
          <div className="px-4 py-4 text-center text-white/60 sm:px-6">TYPICAL AGENCY</div>
        </div>

        {ROWS.map((r) => (
          <div key={r.topic} className="border-t border-line">
            <p className="bg-bg-soft px-6 py-2 text-[11px] font-semibold tracking-[0.2em] text-muted sm:hidden">
              {r.topic.toUpperCase()}
            </p>
            <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[1fr_1.4fr_1.4fr]">
              <p className="hidden items-center px-6 py-4 font-display text-sm font-semibold text-ink sm:flex">{r.topic}</p>
              <p className="flex items-start gap-2 bg-gold/5 px-4 py-4 text-[13px] text-ink sm:px-6 sm:text-sm">
                <Check size={16} className="mt-0.5 shrink-0 text-gold" strokeWidth={2.4} />
                {r.us}
              </p>
              <p className="flex items-start gap-2 px-4 py-4 text-[13px] text-muted sm:px-6 sm:text-sm">
                <X size={16} className="mt-0.5 shrink-0 text-red-400" strokeWidth={2.4} />
                {r.them}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
