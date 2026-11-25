"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Can I see more details about a project?",
    a: "Yes. Open any project card to see its full gallery, technologies used, the client and a live link where available.",
  },
  {
    q: "Do you sign NDAs for confidential work?",
    a: "Absolutely. We are happy to sign an NDA before discussing your idea, and some of our work is shared only in part for that reason.",
  },
  {
    q: "Can you build something similar to a project here?",
    a: "Yes. Tell us which project caught your eye and what you would change, and we will scope a version tailored to your brand and budget.",
  },
  {
    q: "Which industries have you worked in?",
    a: "We have delivered for retail, education, healthcare, real estate, hospitality and startups, across graphic, web, mobile and desktop work.",
  },
];

export default function PortfolioFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="section pt-0" aria-labelledby="portfolio-faq-title">
      <div className="mx-auto max-w-3xl">
        <h2 id="portfolio-faq-title" className="text-center font-display text-2xl font-semibold text-ink sm:text-3xl">
          Portfolio <span className="text-gold">questions</span>
        </h2>
        <div className="mt-8 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="rounded-lg border border-line bg-white">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-ink"
                >
                  {f.q}
                  <span aria-hidden className={`text-gold transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
                </button>
                {isOpen && <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{f.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
