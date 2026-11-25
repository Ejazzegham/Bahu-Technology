import type { CSSProperties } from "react";

type Step = {
  title: string;
  desc: string;
  /** Two-stop gradient + glow colour for this step. */
  from: string;
  to: string;
  icon: JSX.Element;
};

const STEPS: Step[] = [
  {
    title: "Discuss",
    desc: "Share your ideas and requirements",
    from: "#5b9dff",
    to: "#1f5fff",
    icon: <path d="M4 5h16v11H8l-4 4V5z" />,
  },
  {
    title: "Research",
    desc: "We research your industry & competitors",
    from: "#c084fc",
    to: "#7c3aed",
    icon: <path d="M6 4h9l3 3v13H6V4zM9 9h6M9 13h6M9 17h3" />,
  },
  {
    title: "Design",
    desc: "We create initial concepts for you",
    from: "#f472b6",
    to: "#db2777",
    icon: <path d="M4 20l1-4L15.5 5.5a1.5 1.5 0 012 2L7 17l-3 3zM13.5 7.5l3 3" />,
  },
  {
    title: "Review",
    desc: "You review and share feedback",
    from: "#fbbf24",
    to: "#f97316",
    icon: <path d="M9 12l2 2 4-4M21 12a9 9 0 11-9-9 9 9 0 019 9z" />,
  },
  {
    title: "Refine",
    desc: "We refine the design until perfection",
    from: "#34d399",
    to: "#059669",
    icon: <path d="M3 12a9 9 0 0115.4-6.4M21 12a9 9 0 01-15.4 6.4M17 3v5h-5M7 21v-5h5" />,
  },
  {
    title: "Deliver",
    desc: "Final files delivered on time",
    from: "#22d3ee",
    to: "#0891b2",
    icon: <path d="M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4M9 12.5l3 1.3 3-1.3" />,
  },
];

export default function HowWeWork() {
  return (
    <section className="section pt-0 pb-0" aria-labelledby="how-we-work-title">
      <div className="hww-panel relative overflow-hidden rounded-3xl bg-[#050816] px-6 py-14 shadow-gold sm:px-10 sm:py-20">
        {/* Ambient colour glows */}
        <div aria-hidden className="hww-glow" style={{ left: "-8%", top: "-18%", background: "rgba(31,95,255,0.35)" }} />
        <div aria-hidden className="hww-glow" style={{ right: "-6%", top: "10%", background: "rgba(219,39,119,0.25)" }} />
        <div aria-hidden className="hww-glow" style={{ left: "35%", bottom: "-30%", background: "rgba(5,150,105,0.25)" }} />
        <div aria-hidden className="hero-grid absolute inset-0 opacity-70" />

        <div className="relative mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2.5 rounded-full border-[1px] border-white/15 bg-white/[0.05] px-4 py-1.5 text-[11px] font-semibold tracking-[0.25em] text-white/80 backdrop-blur">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#5b9dff] to-[#f472b6]" />
            OUR PROCESS
          </p>
          <h2
            id="how-we-work-title"
            className="mt-5 font-display text-3xl font-semibold text-white sm:text-4xl"
          >
            How We <span className="hww-rainbow-text">Work</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
            Six clear steps from first conversation to final delivery, so you always know
            what happens next.
          </p>
        </div>

        <ol className="relative mt-16 grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
          {/* Flowing rainbow connector (desktop) */}
          <div
            aria-hidden
            className="hww-line pointer-events-none absolute left-[8%] right-[8%] top-[34px] hidden h-[3px] rounded-full lg:block"
          />
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="step-item hww-step group relative"
              style={{ ["--c1" as string]: step.from, ["--c2" as string]: step.to } as CSSProperties}
            >
              <div className="hww-card relative flex h-full flex-col items-center rounded-2xl px-4 pb-6 pt-0 text-center">
                <span className="hww-orb relative z-10 -mt-0 flex h-[68px] w-[68px] -translate-y-1/2 items-center justify-center rounded-full text-white">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {step.icon}
                  </svg>
                </span>
                <span aria-hidden className="hww-num -mt-5 font-display text-5xl font-bold leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/60">{step.desc}</p>
                <span aria-hidden className="hww-bar mt-5 h-[3px] w-10 rounded-full transition-all duration-300 group-hover:w-16" />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
