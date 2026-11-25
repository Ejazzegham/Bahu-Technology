const ROW_ONE = [
  "Next.js", "React", "TypeScript", "Node.js", "Firebase", "Tailwind CSS",
  "Flutter", "React Native", "Python", "Laravel", "WordPress", "Shopify",
];
const ROW_TWO = [
  "Figma", "Photoshop", "Illustrator", "UI/UX Design", "Branding", "Logo Design",
  "SEO", "REST APIs", "Electron", ".NET", "Android", "iOS",
];

function Row({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const list = [...items, ...items];
  return (
    <div className="marquee overflow-hidden">
      <div className={`marquee-track gap-3 ${reverse ? "reverse" : ""}`}>
        {list.map((name, i) => (
          <span
            key={`${name}-${i}`}
            aria-hidden={i >= items.length}
            className="mr-3 inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-white px-5 py-2 text-sm font-medium text-ink/80 shadow-sm transition-colors hover:border-gold/60 hover:text-gold"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TechMarquee() {
  return (
    <section aria-label="Technologies and tools we work with" className="border-y border-line bg-bg-soft py-10">
      <p className="mb-6 text-center text-[11px] font-semibold tracking-[0.3em] text-muted">
        TOOLS &amp; TECHNOLOGIES WE WORK WITH
      </p>
      <div className="marquee-mask space-y-3">
        <Row items={ROW_ONE} />
        <Row items={ROW_TWO} reverse />
      </div>
    </section>
  );
}
