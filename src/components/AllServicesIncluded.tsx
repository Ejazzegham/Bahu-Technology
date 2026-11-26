const ITEMS = [
  { title: "Fast Delivery", desc: "Clear milestones and quick turnarounds, so you launch sooner.", grad: "from-amber-400 to-orange-500", icon: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /> },
  { title: "Secure by Default", desc: "Best-practice security, backups and safe data handling.", grad: "from-emerald-400 to-teal-600", icon: <path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5l8-3zM9 12l2 2 4-4" /> },
  { title: "SEO-Ready", desc: "Clean structure and speed that search engines reward.", grad: "from-sky-400 to-blue-600", icon: (<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>) },
  { title: "Mobile-First", desc: "Looks and works great on every screen size.", grad: "from-violet-400 to-purple-600", icon: (<><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M11 18.5h2" /></>) },
  { title: "Free Revisions", desc: "We refine until you love it — no surprise charges.", grad: "from-pink-400 to-rose-600", icon: <path d="M4 12a8 8 0 0114-5.3L20 9M20 4v5h-5M20 12a8 8 0 01-14 5.3L4 15M4 20v-5h5" /> },
  { title: "Ongoing Support", desc: "Maintenance and help after launch, whenever you need it.", grad: "from-cyan-400 to-indigo-600", icon: (<><path d="M4 15v-3a8 8 0 0116 0v3" /><rect x="2.5" y="14" width="4" height="6" rx="1.5" /><rect x="17.5" y="14" width="4" height="6" rx="1.5" /></>) },
];

export default function AllServicesIncluded() {
  return (
    <section className="relative overflow-hidden bg-bg-soft">
      <div aria-hidden className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-pink-300/20 blur-3xl" />
      <div className="section relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
            <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
            INCLUDED WITH EVERY PROJECT
            <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Premium features, <span className="text-gold">no matter the service</span>
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it) => (
            <div key={it.title} className="card group flex items-start gap-4 bg-white">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${it.grad} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  {it.icon}
                </svg>
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-ink">{it.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{it.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
