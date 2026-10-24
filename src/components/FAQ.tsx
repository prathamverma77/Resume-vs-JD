"use client";

import React from "react";

export default function FAQ() {
  const faqs = [
    {
      question: "Do I need an account or API key?",
      answer:
        "No. MatchEngine runs 100% locally in-memory. There are no logins, subscriptions, or external LLM API costs.",
    },
    {
      question: "What resume formats are supported?",
      answer:
        "PDF (.pdf) files containing selectable text up to 5MB. Scanned image-only PDFs without OCR text layers cannot be extracted.",
    },
    {
      question: "How is the match score computed?",
      answer:
        "A deterministic formula allocates 75% weight to core required technical skills and 25% to preferred bonus qualifications. Skills are normalized for acronyms, punctuation, and typos.",
    },
    {
      question: "Is my resume or job description stored?",
      answer:
        "No. Data is processed exclusively in-memory for the duration of the HTTP request and discarded immediately after returning results.",
    },
  ];

  return (
    <section id="faq" className="w-full mt-14 pt-10 border-t border-zinc-200 dark:border-zinc-800 scroll-mt-20">
      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="inline-block text-xs md:text-sm font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
          Transparency & Privacy
        </span>
        <h2 className="text-xl md:text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Frequently asked questions
        </h2>
        <p className="text-sm md:text-base font-normal text-zinc-600 dark:text-zinc-300 mt-1.5">
          Common questions about the engine and data privacy.
        </p>
      </div>

      <div className="max-w-3xl mx-auto divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group py-4 transition-colors [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none select-none text-sm md:text-base font-bold text-zinc-950 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 gap-4">
              <span>{faq.question}</span>
              <span className="text-zinc-500 dark:text-zinc-400 group-open:rotate-45 transition-transform duration-200 text-lg font-mono font-bold shrink-0">
                +
              </span>
            </summary>
            <p className="text-sm font-normal text-zinc-600 dark:text-zinc-300 mt-2.5 leading-relaxed pr-8">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
