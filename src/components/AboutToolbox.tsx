const GROUPS = [
  {
    title: "Design",
    items: ["Figma", "Photoshop", "Illustrator", "UI/UX Design", "Branding", "Logo Design"],
  },
  {
    title: "Web",
    items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "WordPress", "Shopify", "SEO"],
  },
  {
    title: "Mobile & Desktop",
    items: ["Flutter", "React Native", "Android", "iOS", "Electron", ".NET"],
  },
  {
    title: "Backend & Cloud",
    items: ["Node.js", "Python", "Laravel", "Firebase", "REST APIs"],
  },
];

export default function AboutToolbox() {
  return (
    <section className="section pt-0" aria-labelledby="about-toolbox-title">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          OUR TOOLBOX
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="about-toolbox-title" className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Skills across <span className="text-gold">design and code</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          One team covering the whole journey, so your brand, website and software feel
          like they were made together.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g.title} className="card !p-6">
            <h3 className="font-display text-sm font-semibold tracking-wide text-gold">{g.title.toUpperCase()}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {g.items.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-line bg-bg-soft px-3.5 py-1.5 text-xs font-medium text-ink/80 transition-colors hover:border-gold/60 hover:text-gold"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
