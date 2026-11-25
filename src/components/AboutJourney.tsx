import type { CSSProperties } from "react";

type Milestone = {
  year: string;
  title: string;
  text: string;
  from: string;
  to: string;
  icon: JSX.Element;
  today?: boolean;
};

const JOURNEY: Milestone[] = [
  {
    year: "2010",
    title: "The Beginning",
    text: "Bahu Technology was founded with a vision to blend design and technology.",
    from: "#fbbf24",
    to: "#f97316",
    icon: <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.5 9.4l6.6-.9L12 2.5z" />,
  },
  {
    year: "2014",
    title: "Building Momentum",
    text: "Grew a dedicated team and delivered our first flagship digital products.",
    from: "#5b9dff",
    to: "#1f5fff",
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6M16 8a3 3 0 110-6M22 20c0-2.7-2-5-5-5.8" />
      </>
    ),
  },
  {
    year: "2018",
    title: "Going Global",
    text: "Expanded beyond borders, serving clients across multiple countries.",
    from: "#c084fc",
    to: "#7c3aed",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
      </>
    ),
  },
  {
    year: "2022",
    title: "Full-Scale Studio",
    text: "Matured into a full-service agency spanning design, web and software.",
    from: "#f472b6",
    to: "#db2777",
    icon: <path d="M4 20l4-9 4 5 4-8 4 12H4z" />,
  },
  {
    year: "2026",
    title: "Onward & Upward",
    text: "Continuing to innovate, craft and grow alongside every client we serve.",
    from: "#34d399",
    to: "#0891b2",
    today: true,
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </>
    ),
  },
];

export default function AboutJourney() {
  return (
    <section className="section pt-0" aria-labelledby="our-journey-title">
      <div className="hww-panel relative overflow-hidden rounded-3xl bg-[#050816] px-6 py-14 shadow-gold sm:px-10 sm:py-20">
        <div aria-hidden className="hww-glow" style={{ left: "-8%", top: "-15%", background: "rgba(251,191,36,0.22)" }} />
        <div aria-hidden className="hww-glow" style={{ left: "38%", top: "30%", background: "rgba(124,58,237,0.28)" }} />
        <div aria-hidden className="hww-glow" style={{ right: "-8%", bottom: "-20%", background: "rgba(8,145,178,0.30)" }} />
        <div aria-hidden className="hero-grid absolute inset-0 opacity-70" />

        <div className="relative mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2.5 rounded-full border-[1px] border-white/15 bg-white/[0.05] px-4 py-1.5 text-[11px] font-semibold tracking-[0.25em] text-white/80 backdrop-blur">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#34d399]" />
            OUR JOURNEY
          </p>
          <h2 id="our-journey-title" className="mt-5 font-display text-3xl font-semibold text-white sm:text-4xl">
            A Decade &amp; Beyond, <span className="hww-rainbow-text">Since 2010</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
            From a small design studio to a full-service digital agency, every year has
            added new skills, new clients and new ambition.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Timeline line: vertical on mobile, horizontal on desktop */}
          <div
            aria-hidden
            className="hww-line jny-line absolute left-[27px] top-0 bottom-0 w-[3px] rounded-full lg:left-[6%] lg:right-[6%] lg:top-[27px] lg:h-[3px] lg:w-auto lg:bottom-auto"
          />

          <ol className="relative flex list-none flex-col gap-10 pl-[76px] lg:grid lg:grid-cols-5 lg:gap-5 lg:pl-0">
            {JOURNEY.map((m, index) => (
              <li
                key={m.year}
                className={`reveal-item jny-item group relative flex flex-col lg:items-center ${
                  index % 2 === 1 ? "lg:mt-14" : ""
                }`}
                style={{ ["--c1" as string]: m.from, ["--c2" as string]: m.to } as CSSProperties}
              >
                <span
                  aria-hidden
                  className="hww-orb absolute -left-[76px] top-0 z-10 flex h-14 w-14 items-center justify-center rounded-full text-white lg:static lg:mb-5"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {m.icon}
                  </svg>
                </span>

                <div className="jny-card relative w-full overflow-hidden rounded-2xl px-5 py-6 text-left lg:text-center">
                  {/* Ghost year watermark */}
                  <span
                    aria-hidden
                    className="jny-ghost pointer-events-none absolute -right-2 -top-3 font-display text-7xl font-extrabold leading-none"
                  >
                    {m.year}
                  </span>
                  {m.today && (
                    <span className="relative mb-3 inline-flex items-center gap-1.5 rounded-full border-[1px] border-emerald-300/40 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.2em] text-emerald-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                      TODAY
                    </span>
                  )}
                  <p className="jny-year relative font-display text-3xl font-bold leading-none">{m.year}</p>
                  <p className="relative mt-2 text-sm font-semibold text-white">{m.title}</p>
                  <p className="relative mt-2 text-xs leading-relaxed text-white/60">{m.text}</p>
                  <span aria-hidden className="hww-bar relative mt-4 block h-[3px] w-10 rounded-full transition-all duration-300 group-hover:w-16 lg:mx-auto" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
