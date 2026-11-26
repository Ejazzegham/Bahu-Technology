const GRADS = ["from-sky-500 to-blue-600", "from-violet-500 to-purple-600", "from-pink-500 to-rose-500"];
const STEPS = [
  { n: "01", title: "We review", desc: "A team member reads your message and any details you shared." },
  { n: "02", title: "We reply", desc: "Within 24 hours you get answers, questions or a call invite." },
  { n: "03", title: "You get a plan", desc: "A clear scope, timeline and quote, with no obligation." },
];

export default function ContactNextSteps() {
  return (
    <section className="section pt-0" aria-labelledby="contact-next-title">
      <h2 id="contact-next-title" className="text-center font-display text-2xl font-semibold text-ink sm:text-3xl">
        What happens <span className="text-gold">after you message us</span>
      </h2>
      <ol className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.n} className="rounded-xl border border-line bg-white p-6">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br ${GRADS[i]} font-display text-sm font-bold text-white`}>{s.n}</span>
            <h3 className="mt-2 font-display text-base font-semibold text-ink">{s.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{s.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
