"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import HeroFX from "./HeroFX";

const CHECKLIST = [
  "Creative & Modern UI/UX Design",
  "Responsive Web & Mobile Apps",
  "Clean, Secure & Scalable Code",
];

const WORDS = ["Websites", "Mobile Apps", "Brand Identities", "Desktop Software"];

/** Types and deletes each word in turn. Static first word if reduced motion. */
function useTypewriter(words: string[]) {
  const [text, setText] = useState(words[0]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let w = 0;
    let c = words[0].length;
    let deleting = true;
    let t: number;

    const tick = () => {
      const word = words[w];
      if (deleting) {
        c -= 1;
        setText(word.slice(0, c));
        if (c <= 0) {
          deleting = false;
          w = (w + 1) % words.length;
        }
        t = window.setTimeout(tick, 45);
      } else {
        const next = words[w];
        c += 1;
        setText(next.slice(0, c));
        if (c >= next.length) {
          deleting = true;
          t = window.setTimeout(tick, 1800);
        } else {
          t = window.setTimeout(tick, 85);
        }
      }
    };

    t = window.setTimeout(tick, 1800);
    return () => window.clearTimeout(t);
  }, [words]);

  return text;
}

export default function Hero() {
  const typed = useTypewriter(WORDS);

  return (
    <section
      id="home"
      className="relative flex min-h-[460px] items-center overflow-hidden lg:min-h-[600px]"
    >
      {/* Full-bleed artwork — slow Ken Burns zoom keeps it alive. */}
      <div className="hero-bg absolute inset-0 -z-10">
        <Image
          src="/home/hero-glow.png"
          alt="Bahu Technology emblem glowing in blue, set on a dark futuristic stage, representing innovation and technology-driven growth"
          fill
          className="object-cover object-[78%_center] lg:object-[70%_center]"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#040711] via-[#040711]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040711] via-transparent to-transparent" />
      </div>

      <HeroFX />

      <div className="section relative w-full">
        <div className="hero-content max-w-xl text-center lg:text-left">
          <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold lg:justify-start">
            <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
            HELLO, WE&apos;RE
            <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
          </p>

          <h1 className="mx-auto mt-4 max-w-xl font-display text-3xl font-semibold leading-[1.15] sm:text-4xl lg:mx-0 lg:text-5xl">
            <span className="text-white">Welcome to</span>
            <br />
            <span className="text-gold tracking-tight">Bahu Technology</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base font-semibold tracking-wide text-white/90 sm:text-lg lg:mx-0">
            We build{" "}
            <span className="inline-block min-w-[1ch] text-[#8ab8ff]">
              <span className="sr-only">websites, mobile apps, brand identities and desktop software</span>
              <span aria-hidden>{typed}</span>
              <span aria-hidden className="type-caret" />
            </span>
            <br className="hidden sm:block" /> that grow your business.
          </p>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/60 lg:mx-0">
            Creative Design. Clean Code. Real Results. We help businesses grow
            with creative design, modern websites, and powerful custom software
            solutions.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href="/contact" className="btn-primary">
              START A PROJECT <span aria-hidden>→</span>
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-md border border-white/25 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors duration-200 hover:border-white/60 hover:bg-white/10"
            >
              VIEW OUR WORK
            </Link>
          </div>

          <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 lg:mx-0 lg:justify-start">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-white/90">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-gold">
                  <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
                  <path
                    d="M8 12.5l2.5 2.5L16 9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <a
        href="#services"
        aria-label="Scroll to services"
        className="absolute bottom-5 left-1/2 hidden h-10 w-6 -translate-x-1/2 items-start justify-center rounded-md border-2 border-white/30 pt-2 sm:flex"
      >
        <span className="scroll-cue h-2 w-1 rounded-full bg-white/70" />
      </a>
    </section>
  );
}
