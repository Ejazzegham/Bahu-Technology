import Link from "next/link";

const FEATURES = [
  {
    title: "Design-First Thinking",
    desc: "Every project starts with research and concepts, so what we build looks right and works for your customers.",
    icon: <path d="M4 20l1-4L15.5 5.5a1.5 1.5 0 012 2L7 17l-3 3zM13.5 7.5l3 3" />,
    big: true,
  },
  {
    title: "Clean, Scalable Code",
    desc: "Modern stacks and tidy architecture that are easy to maintain and grow with your business.",
    icon: <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />,
  },
  {
    title: "Fast, Reliable Support",
    desc: "A real team that answers quickly, before launch and after.",
    icon: (
      <>
        <path d="M4 15v-3a8 8 0 0116 0v3" />
        <rect x="2" y="14" width="5" height="7" rx="1.5" />
        <rect x="17" y="14" width="5" height="7" rx="1.5" />
      </>
    ),
  },
  {
    title: "Performance & SEO Ready",
    desc: "Fast loading pages and search-friendly structure built in from day one.",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </>
    ),
  },
  {
    title: "Transparent Pricing",
    desc: "Clear packages with no surprises. See exactly what you get before you commit.",
    icon: <path d="M20.6 12.3L12.7 20.2a2 2 0 01-2.8 0L3 13.3V4h9.3l8.3 8.3a2 2 0 010 2.8zM7 8h.01" />,
    link: { href: "/pricing", label: "SEE PRICING" },
  },
  {
    title: "Secure by Default",
    desc: "Sensible security practices applied to every site, app and integration we ship.",
    icon: <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3zM9 12l2 2 4-4" />,
  },
];

export default function WhyChoose() {
  return (
    <section id="why-us" className="section">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          WHY CHOOSE US
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Built to look premium. <span className="text-gold">Built to perform.</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Design, development and support under one roof, so your project moves
          faster and feels consistent from first sketch to final launch.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className={`card group flex flex-col items-start ${f.big ? "lg:col-span-1 lg:row-span-1" : ""}`}
          >
            <div className="icon-float mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-gold/40 bg-gold/5 text-gold transition-colors group-hover:bg-gold group-hover:text-white">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {f.icon}
              </svg>
            </div>
            <h3 className="font-display text-base font-semibold text-ink">{f.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{f.desc}</p>
            {f.link && (
              <Link
                href={f.link.href}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gold"
              >
                {f.link.label} <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
