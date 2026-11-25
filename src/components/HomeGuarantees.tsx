import { Gift, Lock, KeyRound, RefreshCcw, LifeBuoy, MessagesSquare } from "lucide-react";

const PROMISES = [
  {
    icon: Gift,
    title: "Free Consultation",
    text: "Talk through your idea with our team before you spend anything.",
  },
  {
    icon: Lock,
    title: "Confidential by Default",
    text: "Your ideas and data stay private. NDA available on request.",
  },
  {
    icon: KeyRound,
    title: "You Own Everything",
    text: "Final files, source code and assets are yours once the project is delivered.",
  },
  {
    icon: RefreshCcw,
    title: "Revisions Included",
    text: "We refine the work with you until it matches what you had in mind.",
  },
  {
    icon: MessagesSquare,
    title: "Regular Progress Updates",
    text: "No guessing. You see where your project stands at every stage.",
  },
  {
    icon: LifeBuoy,
    title: "Post-Launch Support",
    text: "We stay around after launch to fix, tweak and help you grow.",
  },
];

export default function HomeGuarantees() {
  return (
    <section className="section pt-0" aria-labelledby="home-promise-title">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          OUR PROMISE
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 id="home-promise-title" className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Work with us <span className="text-gold">without the worry.</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Every project comes with the same simple commitments, so you can start with confidence.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PROMISES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card group flex items-start gap-4 !p-6">
            <span className="icon-float flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-gradient text-white shadow-gold">
              <Icon size={22} strokeWidth={1.7} />
            </span>
            <div>
              <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
