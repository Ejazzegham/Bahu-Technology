import Image from "next/image";
import Link from "next/link";
import { Palette, Code2, Smartphone, MonitorCog, Award, Star, ArrowUpRight, ShieldCheck } from "lucide-react";

const PILLARS = [
  { icon: Palette, title: "Graphic Design", text: "Logos, brand identity and marketing creatives." },
  { icon: Code2, title: "Web Development", text: "Fast, responsive and SEO-ready websites." },
  { icon: Smartphone, title: "Mobile Apps", text: "Smooth Android & iOS experiences." },
  { icon: MonitorCog, title: "Desktop Software", text: "Custom tools that run your business." },
];

const HIGHLIGHTS = [
  "Clean & Efficient Code",
  "Fast & Reliable Support",
  "On-Time Delivery",
  "100% Client Satisfaction",
];

const METRICS = [
  { value: "15+", label: "Years of Experience" },
  { value: "2000+", label: "Projects Completed" },
  { value: "1330+", label: "Happy Clients" },
];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden">
      {/* soft background accents */}
      <div aria-hidden className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#c14dff]/10 blur-3xl" />

      <div className="section relative">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
          {/* ---------- Visual column ---------- */}
          <div className="relative mx-auto w-full max-w-xl lg:col-span-5 lg:max-w-none">
            <div className="rgb-box relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#040711]">
              <Image
                src="/about/hero-glow.png"
                alt="Bahu Technology emblem glowing in blue, representing creative design and modern technology"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040711] via-[#040711]/30 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-[11px] font-semibold tracking-[0.25em] text-[#8ab8ff]">SINCE DAY ONE</p>
                <p className="mt-2 font-display text-xl font-semibold leading-snug text-white sm:text-2xl">
                  Creative design meets reliable technology.
                </p>
              </div>
            </div>

            {/* floating: experience badge */}
            <div className="absolute -left-3 top-8 flex items-center gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:-left-6">
              <span className="icon-float flex h-11 w-11 items-center justify-center rounded-xl bg-gold-gradient text-white shadow-gold">
                <Award size={22} strokeWidth={1.7} />
              </span>
              <div>
                <p className="font-display text-xl font-bold leading-none text-ink">15+</p>
                <p className="mt-1 text-[11px] font-semibold tracking-wide text-muted">YEARS OF EXPERTISE</p>
              </div>
            </div>

            {/* floating: satisfaction badge */}
            <div className="absolute -right-3 bottom-28 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:-right-6">
              <div className="flex items-center gap-0.5 text-amber-400" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="mt-1 font-display text-sm font-semibold text-ink">100% Client Satisfaction</p>
              <p className="text-[11px] text-muted">1330+ happy clients</p>
            </div>
          </div>

          {/* ---------- Content column ---------- */}
          <div className="lg:col-span-7">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
              <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
              ABOUT US
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[2.6rem]">
              We turn ideas into <span className="text-gold">premium digital experiences.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              Bahu Technology is a creative digital agency and software studio. Our team of
              graphic designers and full stack developers helps businesses, startups and
              entrepreneurs build a strong digital presence with clean code, great design and
              dependable support.
            </p>

            {/* service pillars */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {PILLARS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="card group flex items-start gap-4 !p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/5 text-gold transition-colors group-hover:bg-gold group-hover:text-white">
                    <Icon size={20} strokeWidth={1.7} />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* checklist */}
            <ul className="mt-7 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-ink/90">
                  <ShieldCheck size={18} className="shrink-0 text-gold" strokeWidth={1.8} />
                  {item}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/about" className="btn-primary">
                OUR STORY <ArrowUpRight size={16} aria-hidden />
              </Link>
              <Link href="/contact" className="btn-outline">
                TALK TO US <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ---------- Metrics strip ---------- */}
        <div className="relative mt-16 overflow-hidden rounded-3xl bg-[#040711] px-6 py-8 sm:px-10">
          <div aria-hidden className="hero-orb hero-orb-a" style={{ opacity: 0.4 }} />
          <div aria-hidden className="hero-orb hero-orb-b" style={{ opacity: 0.35 }} />
          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
            {METRICS.map((m) => (
              <div key={m.label} className="reveal-item text-center">
                <p className="stat-number font-display text-4xl font-bold">{m.value}</p>
                <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-white/60">
                  {m.label.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
