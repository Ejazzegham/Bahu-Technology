import { Target, Eye, Handshake } from "lucide-react";

const PILLARS = [
  {
    icon: Target,
    label: "OUR MISSION",
    title: "Make great digital work accessible",
    text: "To help businesses, startups and entrepreneurs build a strong digital presence with design and technology that is reliable, affordable and results-driven.",
  },
  {
    icon: Eye,
    label: "OUR VISION",
    title: "A trusted partner worldwide",
    text: "To be the studio clients return to for every digital need, known for honest communication, premium craft and long-term relationships.",
  },
  {
    icon: Handshake,
    label: "OUR COMMITMENT",
    title: "Your success is our benchmark",
    text: "Clear timelines, transparent pricing and dependable support, from the first call to well after launch.",
  },
];

export default function AboutMissionVision() {
  return (
    <section className="section pt-0" aria-labelledby="about-mission-title">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          MISSION &amp; VISION
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="about-mission-title" className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
          What drives <span className="text-gold">everything we do</span>
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {PILLARS.map(({ icon: Icon, label, title, text }) => (
          <div key={label} className="card group flex flex-col">
            <span className="icon-float mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-gradient text-white shadow-gold">
              <Icon size={26} strokeWidth={1.6} />
            </span>
            <p className="text-[11px] font-semibold tracking-[0.25em] text-gold">{label}</p>
            <h3 className="mt-2 font-display text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
