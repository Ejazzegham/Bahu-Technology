import Link from "next/link";
import { Tag, MessageCircle, FolderOpen, ArrowRight, type LucideIcon } from "lucide-react";

const PATHS: { icon: LucideIcon; title: string; text: string; href: string; cta: string; grad: string }[] = [
  { icon: Tag, title: "See pricing", text: "Transparent packages you can compare in minutes.", href: "/pricing", cta: "View pricing", grad: "from-amber-400 to-orange-500" },
  { icon: FolderOpen, title: "Browse our work", text: "Real projects across design, web, mobile and desktop.", href: "/portfolio", cta: "Open portfolio", grad: "from-sky-400 to-blue-600" },
  { icon: MessageCircle, title: "Talk to us", text: "Share your idea and get a reply within 24 hours.", href: "/contact", cta: "Contact us", grad: "from-pink-400 to-rose-600" },
];

export default function HomeQuickPaths() {
  return (
    <section className="section pt-0" aria-labelledby="home-paths-title">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a3fc4] via-[#6d28d9] to-[#db2777] p-8 sm:p-12">
        <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative text-center">
          <h2 id="home-paths-title" className="font-display text-3xl font-semibold text-white sm:text-4xl">
            Not sure where to start?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">Pick the path that suits you. Every one leads to a real conversation, with no pressure.</p>
        </div>
        <div className="relative mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PATHS.map((p) => (
            <Link key={p.title} href={p.href} className="group rounded-xl bg-white p-6 shadow-lg transition-transform duration-200 hover:-translate-y-1">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${p.grad} text-white`}>
                <p.icon size={20} strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-ink">{p.title}</h3>
              <p className="mt-1 text-sm text-muted">{p.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold">
                {p.cta} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
