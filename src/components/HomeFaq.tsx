"use client";

import Link from "next/link";
import { useState } from "react";

const FAQS = [
  {
    q: "What services do you offer?",
    a: (
      <>
        We cover graphic design, web design &amp; development, mobile app
        development and desktop software. Explore{" "}
        <Link href="/graphic-design" className="text-gold underline-offset-2 hover:underline">graphic design</Link>,{" "}
        <Link href="/web-development" className="text-gold underline-offset-2 hover:underline">web development</Link>,{" "}
        <Link href="/mobile-app-development" className="text-gold underline-offset-2 hover:underline">mobile apps</Link> or{" "}
        <Link href="/desktop-software" className="text-gold underline-offset-2 hover:underline">desktop software</Link>.
      </>
    ),
  },
  {
    q: "How much does a project cost?",
    a: (
      <>
        It depends on scope and complexity. Our{" "}
        <Link href="/pricing" className="text-gold underline-offset-2 hover:underline">pricing page</Link>{" "}
        lists transparent packages, and for anything custom we&apos;ll send a clear quote after a short conversation.
      </>
    ),
  },
  {
    q: "How long does a project take?",
    a: "Timelines vary with the size of the project. Once we understand your requirements we share a realistic schedule, and we keep you updated at every milestone.",
  },
  {
    q: "Do you provide support after launch?",
    a: "Yes. Fast and reliable support is part of how we work, so you are never left alone after your project goes live.",
  },
  {
    q: "How do we get started?",
    a: (
      <>
        Send us a message on the{" "}
        <Link href="/contact" className="text-gold underline-offset-2 hover:underline">contact page</Link>{" "}
        or WhatsApp. We discuss your idea, research your market, share initial concepts, and refine them with your feedback.
      </>
    ),
  },
];

export default function HomeFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold">
          <span aria-hidden className="h-px w-5 bg-gradient-to-r from-transparent to-gold" />
          FAQ
          <span aria-hidden className="h-px w-5 bg-gradient-to-l from-transparent to-gold" />
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Questions? We&apos;ve got answers.
        </h2>
      </div>

      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="reveal-item rgb-box rounded-xl">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-display text-sm font-semibold text-ink sm:text-base">{item.q}</span>
                <span
                  aria-hidden
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gold/50 text-gold transition-transform duration-300 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-sm leading-relaxed text-muted">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
