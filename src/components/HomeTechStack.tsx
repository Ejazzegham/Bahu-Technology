"use client";

import { useState } from "react";

/**
 * Home-page "Our toolbox": tabs per service, each showing the tools we use
 * as colourful chips. Gives visitors a quick, scannable answer to
 * "can you build it with X?".
 */
const STACKS = [
  {
    key: "web",
    label: "Web",
    blurb: "Fast, SEO-friendly websites and web apps.",
    chip: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
    tab: "from-sky-500 to-blue-600",
    groups: [
      { title: "Frontend", items: ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "Tailwind CSS", "Bootstrap", "jQuery"] },
      { title: "Backend", items: ["Node.js", "Express.js", "PHP", "Laravel", "Python", "Django", "Java", "Spring Boot", "ASP.NET", "REST APIs", "GraphQL"] },
      { title: "Databases", items: ["SQL", "MySQL", "PostgreSQL", "SQL Server", "MongoDB", "Supabase", "Firebase"] },
      { title: "CMS & eCommerce", items: ["WordPress", "WooCommerce", "Elementor", "Shopify"] },
      { title: "Cloud, Hosting & Tools", items: ["AWS", "Cloudflare", "Vercel", "cPanel", "Docker", "Git & GitHub"] },
      { title: "Growth", items: ["SEO", "Google Analytics"] },
    ],
  },
  {
    key: "mobile",
    label: "Mobile",
    blurb: "Android and iOS apps people enjoy using.",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    tab: "from-emerald-500 to-teal-600",
    groups: [
      { title: "Cross-Platform", items: ["Flutter", "Dart", "React Native", "Expo"] },
      { title: "Native", items: ["Android", "Kotlin", "Java", "Android Studio", "iOS", "Swift", "Xcode"] },
      { title: "Backend & Data", items: ["Firebase", "Supabase", "REST APIs", "Node.js", "SQL", "SQLite", "MySQL", "PostgreSQL"] },
      { title: "Design & Release", items: ["UI/UX Design", "Figma", "Google Play Console", "App Store Connect", "Git & GitHub"] },
    ],
  },
  {
    key: "desktop",
    label: "Desktop",
    blurb: "Reliable software for Windows and beyond.",
    chip: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
    tab: "from-violet-500 to-purple-600",
    groups: [
      { title: "Languages & Frameworks", items: [".NET", "C#", "WPF", "WinForms", "C++", "Qt", "Java", "Python", "Electron"] },
      { title: "Databases", items: ["SQL", "SQL Server", "SQLite", "MySQL", "PostgreSQL", "Supabase"] },
      { title: "Microsoft Office & Reports", items: ["Microsoft Office", "Excel / VBA", "Word", "Access", "Crystal Reports"] },
      { title: "Tools & Delivery", items: ["Visual Studio", "REST APIs", "Inno Setup", "Git & GitHub", "UI/UX Design"] },
    ],
  },
  {
    key: "design",
    label: "Design",
    blurb: "Brands and visuals that get noticed.",
    chip: "border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100",
    tab: "from-pink-500 to-rose-600",
    groups: [
      { title: "Adobe Creative Suite", items: ["Adobe Creative Cloud (Complete Suite)", "Photoshop", "Illustrator", "InDesign", "Premiere Pro", "After Effects", "Lightroom", "Adobe XD", "Acrobat"] },
      { title: "Other Design Software", items: ["CorelDRAW", "InPage (Urdu)", "Figma", "Canva"] },
      { title: "Office & Presentations", items: ["Microsoft Office", "Word", "PowerPoint", "Excel"] },
      { title: "Specialties", items: ["Branding", "Logo Design", "UI/UX Design", "Print Design", "Packaging", "Social Media Graphics"] },
    ],
  },
] as const;

export default function HomeTechStack() {
  const [key, setKey] = useState<(typeof STACKS)[number]["key"]>("web");
  const stack = STACKS.find((s) => s.key === key) ?? STACKS[0];

  return (
    <section className="section pt-0" aria-labelledby="home-toolbox-title">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          OUR TOOLBOX
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="home-toolbox-title" className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          The right tools <span className="text-gold">for every project</span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">Choose a service to see what we build it with.</p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Service toolbox">
        {STACKS.map((s) => {
          const on = s.key === key;
          return (
            <button
              key={s.key}
              role="tab"
              aria-selected={on}
              onClick={() => setKey(s.key)}
              className={`rounded-md border px-5 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
                on ? `border-transparent bg-gradient-to-r ${s.tab} text-white shadow-md` : "border-line bg-white text-ink hover:border-gold hover:text-gold"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-line bg-bg-soft p-6 text-center sm:p-8">
        <p className="text-sm font-medium text-muted">{stack.blurb}</p>
        <div key={stack.key} className="auth-fade-in mt-6 space-y-6">
          {stack.groups.map((g) => (
            <div key={g.title}>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/50">{g.title}</h3>
              <ul className="flex flex-wrap justify-center gap-2.5">
                {g.items.map((name) => (
                  <li
                    key={name}
                    className={`rounded-md border px-3.5 py-1.5 text-sm font-semibold transition-all hover:-translate-y-0.5 ${stack.chip}`}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
