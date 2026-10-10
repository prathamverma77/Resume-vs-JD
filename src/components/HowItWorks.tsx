"use client";

import React from "react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Upload Your Resume",
      description:
        "Upload your resume in PDF format (up to 5MB). MatchEngine parses your skills and text content completely in-memory.",
      icon: (
        <svg
          className="w-5 h-5 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      ),
    },
    {
      step: "02",
      title: "Compare With the Job",
      description:
        "Paste the job description or role requirements. The parser extracts required technical skills and preferred qualifications.",
      icon: (
        <svg
          className="w-5 h-5 text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      step: "03",
      title: "Review Your Results",
      description:
        "View overall match scores, identify missing required and preferred skills, and read actionable recommendations to optimize your application.",
      icon: (
        <svg
          className="w-5 h-5 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="w-full mt-14 pt-10 border-t border-slate-200/80 scroll-mt-20">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
          <span>Simple 3-Step Process</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          How It Works
        </h2>
        <p className="text-sm md:text-base text-slate-600 mt-1.5 leading-relaxed">
          From upload to comprehensive skill breakdown in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between relative"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-xs font-extrabold text-slate-400 font-mono">
                  {item.step}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                {item.title}
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
