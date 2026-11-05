"use client";

import React from "react";
import { normalizeSkill } from "@/lib/skills/normalizer";

interface SkillBreakdownSummaryProps {
  matchingSkills: string[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  simulatedSkills: string[];
  hasTechnicalReq: boolean;
  hasPreferredSkills: boolean;
}

export default function SkillBreakdownSummary({
  matchingSkills,
  missingRequiredSkills,
  missingPreferredSkills,
  simulatedSkills,
  hasTechnicalReq,
  hasPreferredSkills,
}: SkillBreakdownSummaryProps) {
  return (
    <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] space-y-6 print:bg-white print-avoid-break">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#141514] dark:text-[#F4F2EE] tracking-[-0.015em]">
          Categorized Skill Inventory
        </h2>
        <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-1 font-sans">
          Complete inventory of technical competencies parsed from resume and target role.
        </p>
      </div>

      {/* Matched Skills */}
      <div>
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Verified Matching Skills ({matchingSkills.length})
        </span>
        {matchingSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {matchingSkills.map((skill, idx) => {
              const isSim = simulatedSkills.some(
                (s) => normalizeSkill(s) === normalizeSkill(skill)
              );
              return (
                <span
                  key={idx}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs transition-all ${
                    isSim
                      ? "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30"
                      : "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20"
                  }`}
                >
                  {isSim ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                  ) : (
                    <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                  {skill}
                  {isSim && (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wide opacity-80">
                      (Simulated)
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#5C5E58] dark:text-[#9E9F97] italic font-sans">
            No direct matching skills identified between candidate resume and job requirements.
          </p>
        )}
      </div>

      {/* Missing Required Skills */}
      <div className="pt-6 border-t border-[#EAE4DC] dark:border-[#2F302C]">
        <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          Missing Mandatory Skills ({missingRequiredSkills.length})
        </span>
        {!hasTechnicalReq ? (
          <p className="text-xs text-[#5C5E58] dark:text-[#9E9F97] italic font-sans">
            No technical requirements were identified in the job description.
          </p>
        ) : missingRequiredSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {missingRequiredSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20 inline-flex items-center gap-1.5 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-sans">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <span>Exceptional: All mandatory technical skills detected in candidate resume!</span>
          </div>
        )}
      </div>

      {/* Missing Preferred Skills */}
      {hasPreferredSkills && (
        <div className="pt-6 border-t border-[#EAE4DC] dark:border-[#2F302C]">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Missing Preferred Bonus Skills ({missingPreferredSkills.length})
          </span>
          {missingPreferredSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {missingPreferredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-sans">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              All preferred bonus skills detected in candidate resume.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

