import Image from "next/image";
import Link from "next/link";
import HeroFX from "./HeroFX";

const CHIPS = [
  { label: "Web Design", href: "/web-development", cls: "border-sky-400/40 bg-sky-400/10 text-sky-200" },
  { label: "Mobile Apps", href: "/mobile-app-development", cls: "border-violet-400/40 bg-violet-400/10 text-violet-200" },
  { label: "Graphic Design", href: "/graphic-design", cls: "border-pink-400/40 bg-pink-400/10 text-pink-200" },
  { label: "Desktop Software", href: "/desktop-software", cls: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" },
];

const STATS = [
  { value: "4", label: "Core services" },
  { value: "40+", label: "Specialties" },
  { value: "100%", label: "Custom built" },
  { value: "24/7", label: "Support options" },
];

export default function AllServicesHero() {
  return (
    <section
      id="all-services-hero"
      className="relative flex min-h-[420px] items-center overflow-hidden lg:min-h-[520px]"
    >
      <div className="hero-bg absolute inset-0 -z-10">
        <Image
          src="/web-design/hero-glow.png"
          alt="Glowing digital globe surrounded by icons representing Bahu Technology's services"
          fill
          className="object-cover object-[75%_center] lg:object-[65%_center]"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#04060f] via-[#04060f]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04060f] via-transparent to-transparent" />
        <div
          aria-hidden
          className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl"
        />
      </div>

      <HeroFX />
      <div className="section relative w-full">
        <div className="hero-content max-w-2xl text-center lg:text-left">
          <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold lg:justify-start">
            <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
            ALL SERVICES
            <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
          </p>

          <h1 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold leading-[1.15] sm:text-4xl lg:mx-0 lg:text-5xl">
            <span className="text-white">Everything You Need to</span>
            <br />
            <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Launch &amp; Grow Online
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm font-semibold tracking-wide text-white/80 sm:text-base lg:mx-0">
            Design. Develop. Deliver.
          </p>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/60 lg:mx-0">
            Websites, mobile apps, brand design and custom software — all under one roof,
            built by one team that cares about your results.
          </p>

          <div className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-2.5 lg:mx-0 lg:justify-start">
            {CHIPS.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold backdrop-blur transition-transform hover:-translate-y-0.5 ${c.cls}`}
              >
                {c.label}
              </Link>
            ))}
          </div>

          <dl className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-4 lg:mx-0">
            {STATS.map((s) => (
              <div key={s.label} className="text-center lg:text-left">
                <dt className="font-display text-2xl font-semibold text-white">{s.value}</dt>
                <dd className="text-[11px] uppercase tracking-wider text-white/50">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
