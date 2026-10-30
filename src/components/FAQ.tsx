"use client";

import React from "react";

export default function FAQ() {
  const faqs = [
    {
      question: "Do I need an account or API key?",
      answer:
        "No account, login, or API key is required. MatchEngine runs deterministic algorithms locally on the application server without third-party LLM costs or dependencies.",
    },
    {
      question: "Which resume formats are supported?",
      answer:
        "Selectable text PDF files up to 5MB. Scanned image-only PDFs without an embedded OCR text layer cannot be parsed, and Microsoft Word (.docx) documents are not supported.",
    },
    {
      question: "How is the match score calculated?",
      answer:
        "The scoring engine applies a transparent weighted formula: 75% for mandatory core technical skills and 25% for preferred bonus skills. Skills are normalized for common acronyms (e.g., AWS ↔ Amazon Web Services), punctuation variations, and minor typos.",
    },
    {
      question: "Does a missing skill mean the candidate does not know it?",
      answer:
        "Not necessarily. A missing requirement simply indicates that the keyword or recognized synonym was not detected in the extracted text of the uploaded PDF. Candidates often possess competencies that were omitted or phrased differently.",
    },
    {
      question: "Is my resume or job description stored?",
      answer:
        "No. Files and text inputs are held exclusively in volatile server memory for the duration of the analysis request and are released immediately upon response completion. There is no database or permanent storage.",
    },
    {
      question: "Can I save or share an analysis?",
      answer:
        "Because MatchEngine does not maintain a database or user accounts, results are ephemeral and not saved to a permanent URL. You can use the 'Copy Report' action on the results workspace to copy a complete plain-text summary to your clipboard.",
    },
  ];

  return (
    <section id="faq" className="w-full scroll-mt-24">
      {/* Centered Editorial Header */}
      <div className="mb-8 md:mb-10 text-center max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#141514] dark:text-[#F4F2EE] tracking-[-0.02em] font-normal leading-tight">
          Frequently asked questions
        </h2>
        <p className="text-base sm:text-lg text-[#5C5E58] dark:text-[#9E9F97] mt-2.5 leading-relaxed font-sans">
          Methodology details, supported document formats, and privacy guarantees.
        </p>
      </div>

      <div className="divide-y divide-[#EAE4DC] dark:divide-[#2F302C] border-t border-[#EAE4DC] dark:border-[#2F302C]">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group py-4 md:py-4.5 transition-colors [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none select-none text-sm md:text-[15px] font-medium text-[#141514] dark:text-[#F4F2EE] hover:text-[#5C5E58] dark:hover:text-[#9E9F97] gap-4">
              <span>{faq.question}</span>
              <span className="text-[#82847E] dark:text-[#72736C] group-open:rotate-45 transition-transform duration-200 text-base font-mono shrink-0">
                +
              </span>
            </summary>
            <p className="text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-2.5 leading-relaxed pr-6 max-w-3xl">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
