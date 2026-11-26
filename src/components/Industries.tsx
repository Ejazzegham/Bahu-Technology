const ITEMS = [
  { name: "Startups", icon: <path d="M12 3c3 2 5 5 5 9l-2 3H9l-2-3c0-4 2-7 5-9zM9 18l-2 3M15 18l2 3M12 9h.01" /> },
  { name: "eCommerce", icon: <path d="M3 4h2l2.5 11h10L20 7H6M9 20h.01M17 20h.01" /> },
  { name: "Education", icon: <path d="M2 9l10-5 10 5-10 5-10-5zM6 11v5c0 1 3 3 6 3s6-2 6-3v-5" /> },
  { name: "Healthcare", icon: <path d="M12 21s-8-5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 6-8 11-8 11z" /> },
  { name: "Real Estate", icon: <path d="M3 11.5L12 4l9 7.5M5 10v10h14V10M10 20v-6h4v6" /> },
  { name: "Restaurants", icon: <path d="M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M17 3c-2 2-2 6 0 8v10" /> },
  { name: "Agencies", icon: <path d="M3 7h18v13H3zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /> },
  { name: "Non-Profits", icon: <path d="M12 21l-8-8a5 5 0 017-7l1 1 1-1a5 5 0 017 7l-8 8z" /> },
];

export default function Industries() {
  return (
    <section className="section pt-0">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          INDUSTRIES
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Built for businesses <span className="text-gold">like yours</span>
        </h2>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {ITEMS.map((it) => (
          <div key={it.name} className="card group flex flex-col items-center !p-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md border border-gold/40 text-gold transition-all duration-300 group-hover:scale-110 group-hover:bg-gold group-hover:text-white">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {it.icon}
              </svg>
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">{it.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
