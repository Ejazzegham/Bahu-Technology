const STEPS = [
  {
    title: "Discover",
    desc: "We learn your goals, audience and constraints so every decision has a reason.",
    icon: <path d="M21 21l-4.3-4.3M11 18a7 7 0 100-14 7 7 0 000 14z" />,
  },
  {
    title: "Design",
    desc: "Wireframes and visual concepts you can react to before a line of code is written.",
    icon: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />,
  },
  {
    title: "Build",
    desc: "Clean, tested code with regular demos so you always see real progress.",
    icon: <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />,
  },
  {
    title: "Launch & Support",
    desc: "We ship, monitor and stay with you after go-live.",
    icon: <path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 00-2.9-.1zM12 15l-3-3a22 22 0 012-4 12.9 12.9 0 0111-6c0 2.7-.8 7.5-6 11a22 22 0 01-4 2zM9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5" />,
  },
];

export default function PortfolioProcess() {
  return (
    <section className="section pt-0" aria-labelledby="portfolio-process-title">
      <div className="text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          HOW WE DELIVER
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="portfolio-process-title" className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Behind every project, <span className="text-gold">the same process</span>
        </h2>
      </div>

      <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rgb-box relative rounded-xl p-6" style={{ ["--box-fill" as string]: "#ffffff" }}>
            <span className="absolute right-5 top-4 font-display text-4xl font-bold text-gold/10">0{i + 1}</span>
            <span className="flex h-11 w-11 items-center justify-center rounded-md border border-gold/40 text-gold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {s.icon}
              </svg>
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
