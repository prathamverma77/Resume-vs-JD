"use client";

import React from "react";

export default function Features() {
  const featureList = [
    {
      title: "Resume Match Score",
      description:
        "Calculates an overall compatibility percentage using a deterministic weighted formula (75% core required skills, 25% preferred skills) directly from your extracted text.",
      badge: "Real Scoring Engine",
      iconBg: "bg-blue-50 text-blue-600 border border-blue-100/80",
      icon: (
        <svg
          className="w-6 h-6"
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
    {
      title: "Skill Gap Analysis",
      description:
        "Clearly separates skills into verified matching skills, missing required technical skills, and missing preferred bonus qualifications so you know exactly what is absent.",
      badge: "Keyword Matching",
      iconBg: "bg-amber-50 text-amber-600 border border-amber-100/80",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      ),
    },
    {
      title: "Experience & Education Comparison",
      description:
        "Extracts targeted role names, day-to-day responsibilities, and academic prerequisites from the job description for manual side-by-side review against your resume background.",
      badge: "Requirement Extraction",
      iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100/80",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      ),
    },
    {
      title: "Improvement Recommendations",
      description:
        "Delivers prioritized, actionable feedback identifying which top missing skills or sections you should incorporate into your resume to immediately boost relevance.",
      badge: "Actionable Tips",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100/80",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
          />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="w-full mt-14 pt-10 border-t border-slate-200/80 scroll-mt-20">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
          <span>Core Capabilities</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          What You&apos;ll Get
        </h2>
        <p className="text-sm md:text-base text-slate-600 mt-1.5 leading-relaxed">
          Accurate, verifiable insights produced directly from the application&apos;s matching engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featureList.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-7 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center`}
                >
                  {item.icon}
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 leading-snug">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
