"use client";

import React from "react";

interface ActionableRecommendationsProps {
  recommendations?: string[];
  responsibilities?: string[];
  education?: string[];
  copied: boolean;
  onCopyReport: () => void;
  onCompareAgain: () => void;
}

export function ActionableRecommendations({
  recommendations,
  responsibilities,
  education,
  copied,
  onCopyReport,
  onCompareAgain,
}: ActionableRecommendationsProps) {
  return (
    <>
      {/* ============================================================
          5. PRIORITIZED ACTIONABLE OPTIMIZATION
      ============================================================ */}
      <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] print:bg-white print:p-4 print-avoid-break">
        <div className="mb-6 print:mb-3">
          <h2 className="font-serif text-2xl sm:text-3xl print:text-xl font-normal text-[#141514] dark:text-[#F4F2EE] tracking-[-0.015em]">
            Prioritized Optimization Guidance
          </h2>
          <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-1 font-sans">
            Actionable adjustments to maximize ATS pass-through and interviewer impression.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3.5 print:gap-2.5">
          {recommendations && recommendations.length > 0 ? (
            recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 print:p-3 rounded-2xl print:rounded-xl bg-[#FAF7F2]/60 dark:bg-[#1E1F1D] print:bg-white border border-[#EAE4DC] dark:border-[#2F302C] print:border-[#D4CFC7] flex items-start gap-4 text-xs sm:text-sm text-[#141514] dark:text-[#F4F2EE] shadow-2xs print:shadow-none print-avoid-break"
              >
                <span className="w-7 h-7 rounded-xl bg-[#141514] text-white dark:bg-[#F4F2EE] dark:text-[#141514] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  0{idx + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{rec}</span>
              </div>
            ))
          ) : (
            <p className="py-4 text-xs text-[#5C5E58] dark:text-[#9E9F97] italic font-sans">
              Candidate profile satisfies parsed job criteria well. Ensure bullets quantify business outcomes.
            </p>
          )}
        </div>
      </div>

      {/* ============================================================
          6. ROLE RESPONSIBILITIES & ACADEMIC INTEL
      ============================================================ */}
      <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] print:bg-white print:p-4 print-avoid-break">
        <div className="mb-6 print:mb-3">
          <h2 className="font-serif text-2xl sm:text-3xl print:text-xl font-normal text-[#141514] dark:text-[#F4F2EE] tracking-[-0.015em]">
            Target Role Deliverables & Prerequisites
          </h2>
          <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-1 font-sans">
            Key responsibilities and qualifications parsed from the employer&apos;s job description.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 print:gap-4 text-xs">
          {/* Key Role Responsibilities */}
          <div className="p-5 print:p-3.5 rounded-2xl print:rounded-xl bg-[#FAF7F2]/40 dark:bg-[#1E1F1D] print:bg-white border border-[#EAE4DC] dark:border-[#2F302C] print:border-[#D4CFC7] print-avoid-break">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block mb-3 print:mb-1.5 font-semibold">
              CORE RESPONSIBILITIES (FROM JD)
            </span>
            {responsibilities && responsibilities.length > 0 ? (
              <ul className="text-xs text-[#141514] dark:text-[#F4F2EE] space-y-2.5 print:space-y-1.5 max-h-56 print:max-h-none overflow-y-auto print:overflow-visible pr-2">
                {responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#141514] dark:bg-[#F4F2EE] shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#5C5E58] dark:text-[#9E9F97] italic font-sans">
                No explicit responsibilities section parsed from JD.
              </p>
            )}
            <p className="text-[11px] text-[#82847E] dark:text-[#72736C] pt-3 border-t border-[#EAE4DC] dark:border-[#2F302C] mt-3 print:hidden">
              Use these duties to align your past project accomplishments with employer expectations.
            </p>
          </div>

          {/* Education Prerequisites */}
          <div className="p-5 print:p-3.5 rounded-2xl print:rounded-xl bg-[#FAF7F2]/40 dark:bg-[#1E1F1D] print:bg-white border border-[#EAE4DC] dark:border-[#2F302C] print:border-[#D4CFC7] print-avoid-break">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block mb-3 print:mb-1.5 font-semibold">
              ACADEMIC PREREQUISITES (FROM JD)
            </span>
            {education && education.length > 0 ? (
              <ul className="text-xs text-[#141514] dark:text-[#F4F2EE] space-y-2 print:space-y-1.5">
                {education.map((edu, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#141514] dark:bg-[#F4F2EE] shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{edu}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#5C5E58] dark:text-[#9E9F97] italic font-sans">
                No explicit academic degree requirements detected in JD text.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          7. REPORT FOOTER
      ============================================================ */}
      <div className="p-6 print:p-3 bg-[#FAF7F2]/80 dark:bg-[#161715] print:bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs print:text-[11px] print-avoid-break">
        <span className="text-[11px] text-[#82847E] dark:text-[#72736C] font-mono">
          Evaluated locally &bull; Zero document retention &bull; MatchEngine v2.4 &bull; Confidential ATS Audit
        </span>

        <div className="flex items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={onCopyReport}
            className="px-4 py-2 font-semibold rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-white dark:bg-[#1E1F1D] hover:bg-[#FAF7F2] text-[#141514] dark:text-[#F4F2EE] transition-all cursor-pointer shadow-2xs"
          >
            {copied ? "Report Copied" : "Copy Plain-Text"}
          </button>

          <button
            type="button"
            onClick={onCompareAgain}
            className="px-5 py-2 font-semibold rounded-full bg-[#141514] hover:bg-neutral-800 dark:bg-[#F4F2EE] dark:text-[#141514] dark:hover:bg-white text-white transition-all cursor-pointer shadow-xs"
          >
            New Analysis
          </button>
        </div>
      </div>
    </>
  );
}

export default ActionableRecommendations;
