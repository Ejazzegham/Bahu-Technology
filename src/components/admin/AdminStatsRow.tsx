const ICONS: Record<string, JSX.Element> = {
  briefcase: <path d="M3 7h18v13H3zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6M16 8a3 3 0 110-6M22 20c0-2.7-2-5-5-5.8" />
    </>
  ),
  star: <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.5 9.4l6.6-.9L12 2.5z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  userPlus: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      <path d="M19 8v6M22 11h-6" />
    </>
  ),
};

export type Stat = {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: keyof typeof ICONS;
};

const THEMES = [
  { grad: "linear-gradient(135deg,#1477f5,#4facfe)", shadow: "rgba(20,119,245,0.55)" },
  { grad: "linear-gradient(135deg,#7c4dff,#b388ff)", shadow: "rgba(124,77,255,0.55)" },
  { grad: "linear-gradient(135deg,#f59e0b,#fbbf24)", shadow: "rgba(245,158,11,0.55)" },
  { grad: "linear-gradient(135deg,#ff4d6d,#ff8a65)", shadow: "rgba(255,77,109,0.55)" },
  { grad: "linear-gradient(135deg,#10b981,#2fd0c9)", shadow: "rgba(16,185,129,0.55)" },
];

export default function AdminStatsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat, i) => {
        const t = THEMES[i % THEMES.length];
        return (
          <div
            key={stat.label}
            className="admin-stat admin-fade-up p-5"
            style={{ background: t.grad, ["--shadow" as string]: t.shadow, animationDelay: `${i * 70}ms` }}
          >
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-white/85">{stat.label}</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/25 text-white backdrop-blur">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[stat.icon]}
                </svg>
              </span>
            </div>
            <p className="relative z-10 mt-4 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[10.5px] font-semibold text-white">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                {stat.up ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M12 5v14M5 12l7 7 7-7" />}
              </svg>
              {stat.change}
            </p>
          </div>
        );
      })}
    </div>
  );
}
