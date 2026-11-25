import Link from "next/link";

const ALL = [
  { slug: "web", title: "Web Development", href: "/web-development", desc: "Websites, eCommerce and custom web apps." },
  { slug: "mobile", title: "Mobile Apps", href: "/mobile-app-development", desc: "Android and iOS apps built to grow." },
  { slug: "design", title: "Graphic Design", href: "/graphic-design", desc: "Logos, branding and marketing visuals." },
  { slug: "desktop", title: "Desktop Software", href: "/desktop-software", desc: "Custom software for your workflow." },
];

export default function RelatedServices({ current }: { current: "web" | "mobile" | "design" | "desktop" }) {
  const others = ALL.filter((s) => s.slug !== current);
  return (
    <section className="section pb-4">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          ALSO EXPLORE
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
          More ways we can help
        </h2>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {others.map((s) => (
          <Link key={s.slug} href={s.href} className="card group block">
            <h3 className="font-display text-base font-semibold text-gold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted">{s.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gold">
              EXPLORE <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
