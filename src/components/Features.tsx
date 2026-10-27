import React from "react";

export default function Features() {
  const capabilities = [
    {
      rung: "Rung 01",
      group: "A. Skill Matching",
      title: "Deterministic Skill Extraction",
      desc: "Scans structured sections and text vocabulary against job requirements. Resolves acronyms (AWS ↔ Amazon Web Services), punctuation variations (Node.js ↔ NodeJS), and minor typographical variants without external AI latency.",
      accent: "Acronyms & Synonyms",
    },
    {
      rung: "Rung 02",
      group: "B. Requirement Weighting",
      title: "Required vs. Preferred Breakdown",
      desc: "Separates mandatory technical qualifications (75% weight) from secondary bonus preferences (25% weight). Prevents optional nice-to-haves from skewing core role suitability.",
      accent: "75% Core / 25% Bonus",
    },
    {
      rung: "Rung 03",
      group: "C. Experience & Context",
      title: "Prerequisite Extraction",
      desc: "Extracts stated academic prerequisites and key role responsibilities directly from the job description for side-by-side reference. Transparently identifies areas not scored by rule-based matching.",
      accent: "Degrees & Qualifications",
    },
    {
      rung: "Rung 04",
      group: "D. Optimization Steps",
      title: "Prioritized Recommendations",
      desc: "Generates clear, actionable guidance to make your existing achievements and competencies explicit in bullet points, without advising users to fabricate unverified tools.",
      accent: "Actionable Guidance",
    },
  ];

  return (
    <section id="capabilities" className="w-full scroll-mt-24 pb-8 md:pb-24">
      {/* Centered Editorial Header */}
      <div className="mb-12 md:mb-16 text-center max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#141514] dark:text-[#F4F2EE] tracking-[-0.02em] font-normal leading-tight">
          Capabilities & methodology
        </h2>
        <p className="text-base sm:text-lg text-[#5C5E58] dark:text-[#9E9F97] mt-3 leading-relaxed font-sans">
          Deterministic parsing algorithms designed for accuracy, speed, and privacy.
        </p>
      </div>

      {/* Creative Ladder Cards Layout (Staggered Stepping Rungs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start max-w-5xl mx-auto">
        {capabilities.map((item, index) => {
          // Even indexes (0, 2) stay at normal top; odd indexes (1, 3) step down on desktop to form ladder
          const isSteppedRung = index % 2 === 1;

          return (
            <div
              key={item.group}
              className={`flex flex-col justify-between bg-white/95 dark:bg-[#1B1C1A]/95 backdrop-blur-sm border border-[#EAE4DC] dark:border-[#2F302C] rounded-2xl p-7 sm:p-8 shadow-[0_12px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-default ${
                isSteppedRung ? "md:translate-y-12 lg:translate-y-16" : "md:translate-y-0"
              }`}
            >
              {/* Card Header: Group and Rung Number */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE4DC]/80 dark:border-[#2F302C]">
                  <span className="text-xs font-mono font-medium text-[#141514] dark:text-[#F4F2EE]">
                    {item.group}
                  </span>
                  <span className="text-[11px] font-mono text-[#82847E] dark:text-[#72736C]">
                    {item.rung}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-medium text-[#141514] dark:text-[#F4F2EE] mt-4 mb-2.5">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-[13.5px] text-[#5C5E58] dark:text-[#9E9F97] leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Card Footer Detail */}
              <div className="mt-6 pt-4 border-t border-[#EAE4DC]/80 dark:border-[#2F302C] flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-[#82847E] dark:text-[#72736C]">
                  {item.accent}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#141514]/25 dark:bg-[#F4F2EE]/25" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
