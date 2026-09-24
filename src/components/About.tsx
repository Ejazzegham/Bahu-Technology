import Link from "next/link";

const HIGHLIGHTS = [
  "15+ Years of Experience",
  "Fast & Reliable Support",
  "2000+ Projects Completed",
  "Clean & Efficient Code",
  "1330+ Happy Clients",
  "100% Client Satisfaction",
];

export default function About() {
  return (
    <section id="about" className="section">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          ABOUT US
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-snug text-ink sm:text-4xl">
          Passionate about design and code.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          We&apos;re a team of Graphic Designers &amp; Full Stack Developers with a
          passion for creating beautiful and powerful digital experiences.
          We believe in clean code, great design, and enhancing user
          experiences.
        </p>

        <ul className="mx-auto mt-8 grid max-w-lg grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-ink/90">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-gold">
                <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
                <path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        <Link href="/about" className="btn-outline mt-8">
          LEARN MORE
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
