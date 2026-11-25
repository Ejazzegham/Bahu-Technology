import { Clock, ShieldCheck, Gift, Headphones } from "lucide-react";

const PERKS = [
  { icon: Clock, value: "< 24h", label: "Reply time", grad: "from-sky-500 to-blue-600" },
  { icon: Gift, value: "Free", label: "Consultation", grad: "from-pink-500 to-rose-500" },
  { icon: ShieldCheck, value: "NDA", label: "On request", grad: "from-emerald-500 to-teal-600" },
  { icon: Headphones, value: "Post-launch", label: "Support included", grad: "from-amber-500 to-orange-500" },
];

export default function ContactPerks() {
  return (
    <section className="section pt-0" aria-label="What you get when you contact us">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a3fc4] via-[#6d28d9] to-[#db2777] p-1">
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#0b1020] p-6 sm:p-8 lg:grid-cols-4">
          {PERKS.map((p) => (
            <div key={p.label} className="flex items-center gap-4">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${p.grad} text-white`}>
                <p.icon size={22} strokeWidth={1.8} />
              </span>
              <div>
                <p className="font-display text-xl font-bold text-white">{p.value}</p>
                <p className="text-xs text-white/65">{p.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
