import type { CSSProperties } from "react";

const ROW_ONE = [
  "Next.js", "React", "TypeScript", "Node.js", "Firebase", "Tailwind CSS",
  "Flutter", "React Native", "Python", "Laravel", "WordPress", "Shopify",
];
const ROW_TWO = [
  "Figma", "Photoshop", "Illustrator", "UI/UX Design", "Branding", "Logo Design",
  "SEO", "REST APIs", "Electron", ".NET", "Android", "iOS",
];

// Each capsule gets its own two-colour accent. Rows start at different offsets
// so neighbouring capsules (and the two rows) never share a colour.
const GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  ["#10b981", "#06b6d4"], // emerald -> cyan
  ["#3b82f6", "#6366f1"], // blue -> indigo
  ["#8b5cf6", "#d946ef"], // violet -> fuchsia
  ["#f43f5e", "#f97316"], // rose -> orange
  ["#f59e0b", "#ef4444"], // amber -> red
  ["#06b6d4", "#3b82f6"], // cyan -> blue
  ["#ec4899", "#8b5cf6"], // pink -> violet
  ["#84cc16", "#10b981"], // lime -> emerald
];

function Row({ items, reverse = false, offset = 0 }: { items: string[]; reverse?: boolean; offset?: number }) {
  const list = [...items, ...items];
  return (
    <div className="marquee overflow-hidden py-2">
      <div className={`marquee-track ${reverse ? "reverse" : ""}`}>
        {list.map((name, i) => {
          const [c1, c2] = GRADIENTS[(i + offset) % GRADIENTS.length];
          return (
            <span
              key={`${name}-${i}`}
              aria-hidden={i >= items.length}
              className="tech-pill"
              style={{ "--c1": c1, "--c2": c2 } as CSSProperties}
            >
              <span className="tech-pill-dot" aria-hidden />
              <span className="tech-pill-label">{name}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function TechMarquee() {
  return (
    <section
      aria-label="Technologies and tools we work with"
      className="tech-marquee-section relative isolate overflow-hidden border-y border-line bg-bg-soft py-12"
    >
      <div aria-hidden className="pointer-events-none absolute -left-20 top-0 -z-10 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 -bottom-16 -z-10 h-56 w-72 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-20 top-4 -z-10 h-56 w-56 rounded-full bg-pink-400/20 blur-3xl" />

      <p className="mb-8 flex items-center justify-center gap-3 text-[11px] font-semibold tracking-[0.3em] text-muted">
        <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-violet-400" />
        <span>
          TOOLS &amp;{" "}
          <span className="bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
            TECHNOLOGIES
          </span>{" "}
          WE WORK WITH
        </span>
        <span aria-hidden className="h-px w-8 bg-gradient-to-l from-transparent to-pink-400" />
      </p>

      <div className="marquee-mask space-y-1">
        <Row items={ROW_ONE} />
        <Row items={ROW_TWO} reverse offset={3} />
      </div>
    </section>
  );
}
