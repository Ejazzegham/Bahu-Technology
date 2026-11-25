"use client";

import { Palette, Globe, Smartphone, Monitor, LifeBuoy, Handshake, type LucideIcon } from "lucide-react";

const TOPICS: { title: string; desc: string; service: string; subject: string; icon: LucideIcon; grad: string }[] = [
  { title: "Graphic Design", desc: "Logos, branding & print", service: "Graphic Design", subject: "Graphic design project", icon: Palette, grad: "from-pink-500 to-rose-500" },
  { title: "Website", desc: "Design & development", service: "Web Design & Development", subject: "Website project", icon: Globe, grad: "from-sky-500 to-blue-600" },
  { title: "Mobile App", desc: "iOS & Android apps", service: "Mobile App Development", subject: "Mobile app project", icon: Smartphone, grad: "from-violet-500 to-purple-600" },
  { title: "Desktop Software", desc: "Custom business tools", service: "Desktop Software", subject: "Desktop software project", icon: Monitor, grad: "from-emerald-500 to-teal-600" },
  { title: "Support", desc: "Help with an existing project", service: "Something else", subject: "Support request", icon: LifeBuoy, grad: "from-amber-500 to-orange-500" },
  { title: "Partnership", desc: "Collaborate with us", service: "Something else", subject: "Partnership enquiry", icon: Handshake, grad: "from-cyan-500 to-indigo-500" },
];

export default function ContactTopics() {
  const pick = (t: (typeof TOPICS)[number]) => {
    window.dispatchEvent(new CustomEvent("contact:prefill", { detail: { service: t.service, subject: t.subject } }));
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="section pb-0" aria-labelledby="contact-topics-title">
      <div className="text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          HOW CAN WE HELP?
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="contact-topics-title" className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Pick a topic, <span className="text-gold">we&apos;ll fill in the form</span>
        </h2>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {TOPICS.map((t) => (
          <button
            key={t.title}
            type="button"
            onClick={() => pick(t)}
            className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${t.grad} p-5 text-left text-white shadow-md transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold`}
          >
            <span aria-hidden className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 transition-transform duration-300 group-hover:scale-125" />
            <t.icon size={26} strokeWidth={1.8} className="relative" />
            <p className="relative mt-4 font-display text-sm font-semibold">{t.title}</p>
            <p className="relative mt-1 text-[11px] leading-snug text-white/85">{t.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
