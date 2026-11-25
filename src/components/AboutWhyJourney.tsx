import { Users, Settings2, ShieldCheck, Headphones, Clock, Gem } from "lucide-react";

const WHY_US = [
  {
    icon: Users,
    title: "Experienced Professionals",
    text: "Our skilled team brings years of experience in graphic design, web development, mobile apps, and custom software solutions.",
  },
  {
    icon: Settings2,
    title: "Custom-Tailored Solutions",
    text: "Every project is designed specifically for your business goals, brand identity, and operational requirements.",
  },
  {
    icon: ShieldCheck,
    title: "Quality & Reliability",
    text: "We focus on clean design, secure development, optimized performance, and reliable long-term results.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    text: "Our team stays available before, during, and after project completion to ensure a smooth experience.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    text: "We respect deadlines and deliver projects efficiently without compromising quality.",
  },
  {
    icon: Gem,
    title: "Affordable Premium Service",
    text: "Get high-quality design and development solutions at competitive pricing that delivers real business value.",
  },
];

export default function AboutWhyJourney() {
  return (
    <section className="section pt-0 flex flex-col gap-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          WHY CHOOSE US
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold leading-snug text-ink sm:text-3xl">
          We Build Solutions, <span className="text-gold">We Build Trust.</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          At Bahu Technology, we combine creativity, technology, and strategy to deliver
          digital solutions that help your business grow, stand out, and succeed in the
          modern digital world.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
        {WHY_US.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gold/40 text-gold">
              <Icon size={20} strokeWidth={1.6} />
            </span>
            <div>
              <h3 className="font-display text-sm font-semibold text-gold">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
