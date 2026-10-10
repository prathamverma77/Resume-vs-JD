"use client";

import React from "react";

export default function FAQ() {
  const faqs = [
    {
      question: "Do I need to create an account?",
      answer:
        "No. MatchEngine is completely free and requires no account creation, sign-up, or login. You can run matches right away.",
    },
    {
      question: "What resume formats are supported?",
      answer:
        "MatchEngine supports PDF (.pdf) documents up to 5MB in size. The PDF must contain extractable text (standard text-based resumes; scanned image-only PDFs without OCR cannot be parsed).",
    },
    {
      question: "How does MatchEngine calculate the match score?",
      answer:
        "The scoring engine parses technical skills from your resume and compares them with requirements extracted from the job description. It applies a weighted formula: 75% for core required skills and 25% for preferred skills.",
    },
    {
      question: "Does a missing skill mean I do not know that skill?",
      answer:
        "Not necessarily. It simply means that specific keyword was not detected in the uploaded resume text. If you have that skill, explicitly mentioning it or common industry synonyms helps ATS filters identify your qualification.",
    },
    {
      question: "What happens to my uploaded resume and job description?",
      answer:
        "All processing happens strictly in-memory during your request. MatchEngine does not use a database, does not write your files to disk, and does not store or retain your resume or job description after the analysis response is sent.",
    },
  ];

  return (
    <section id="faq" className="w-full mt-14 pt-10 border-t border-slate-200/80 scroll-mt-20">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
          <span>Transparency & Privacy</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-sm md:text-base text-slate-600 mt-1.5 leading-relaxed">
          Clear answers about how MatchEngine works and how your data is handled.
        </p>
      </div>

      <div className="space-y-3.5">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-2xs hover:border-slate-300 transition-colors [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none select-none font-bold text-sm md:text-base text-slate-900 gap-4">
              <span>{faq.question}</span>
              <span className="w-7 h-7 rounded-lg bg-slate-100 group-open:bg-blue-50 text-slate-500 group-open:text-blue-600 flex items-center justify-center shrink-0 transition-transform duration-200 group-open:rotate-180">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </span>
            </summary>
            <p className="text-xs md:text-sm text-slate-600 mt-3.5 leading-relaxed pt-3 border-t border-slate-100">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
