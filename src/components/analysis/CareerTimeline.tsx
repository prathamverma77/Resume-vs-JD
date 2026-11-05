"use client";

import React from "react";
import { StructuredResume } from "@/types/analysis";

interface CareerTimelineProps {
  resume: StructuredResume;
}

export default function CareerTimeline({ resume }: CareerTimelineProps) {
  return (
    <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] bg-white dark:bg-[#181917] print:bg-white print-avoid-break">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#EAE4DC] dark:border-[#2F302C]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
              Deterministic Timeline Engine
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#141514] dark:text-[#F4F2EE] tracking-[-0.015em]">
            Career Chronology &amp; Employment Timeline
          </h2>
          <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-1 font-sans">
            Month-level date indexing &bull; Contiguous transition verification &bull; Academic degree isolation
          </p>
        </div>

        {/* Metric Chips */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-[#FAF7F2] dark:bg-[#222320] border border-[#EAE4DC] dark:border-[#2F302C] text-[#141514] dark:text-[#F4F2EE] flex items-center gap-2">
            <span className="text-[#82847E] dark:text-[#72736C]">Verified Tenure:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {resume.totalDurationFormatted ||
                (resume.yearsOfExperience
                  ? `${resume.yearsOfExperience} Years`
                  : "0 mos")}
            </span>
          </div>

          {resume.employmentTimeline && resume.employmentTimeline.length > 0 && (
            <div className="px-3 py-1.5 rounded-full text-xs font-mono bg-[#FAF7F2] dark:bg-[#222320] border border-[#EAE4DC] dark:border-[#2F302C] text-[#5C5E58] dark:text-[#9E9F97]">
              {resume.employmentTimeline.length} Positions Analyzed
            </div>
          )}
        </div>
      </div>

      {/* Timeline Nodes */}
      {resume.employmentTimeline && resume.employmentTimeline.length > 0 ? (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-blue-500/50 before:to-[#EAE4DC] dark:before:to-[#2F302C]">
          {resume.employmentTimeline.map((period, idx) => (
            <div key={idx} className="relative group">
              {/* Node Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  period.isCurrent
                    ? "bg-emerald-500 border-white dark:border-[#181917] shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    : "bg-white dark:bg-[#181917] border-[#82847E] dark:border-[#72736C]"
                }`}
              >
                {period.isCurrent ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#82847E] dark:bg-[#72736C]" />
                )}
              </div>

              {/* Role Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2]/60 dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C] hover:border-[#141514]/30 dark:hover:border-white/30 transition-all shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-sm sm:text-base text-[#141514] dark:text-[#F4F2EE]">
                      {period.headline || period.roleTitle || "Professional Employment"}
                    </h3>
                    {period.isCurrent && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active Role
                      </span>
                    )}
                    {period.isInternship && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                        Internship
                      </span>
                    )}
                  </div>

                  {/* Duration Badge */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-white dark:bg-[#141514] border border-[#EAE4DC] dark:border-[#2F302C] text-[#141514] dark:text-[#F4F2EE] shadow-2xs">
                      {period.durationFormatted || `${period.durationMonths} mos`}
                    </span>
                  </div>
                </div>

                {/* Date Span */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C5E58] dark:text-[#9E9F97] font-mono">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-[#82847E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {period.startDate} &ndash; {period.endDate}
                  </span>
                  <span>&bull;</span>
                  <span>{period.durationMonths} calendar months</span>
                </div>

                {/* Transition Indicators */}
                {period.isContiguousWithNext && (
                  <div className="mt-3 pt-3 border-t border-[#EAE4DC]/80 dark:border-[#2F302C]/80 flex items-center gap-2 text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                    <span className="text-xs">🔗</span>
                    <span>Contiguous Transition to Next Role &bull; Merged seamlessly (0 mo gap)</span>
                  </div>
                )}
                {period.isOverlappingWithNext && (
                  <div className="mt-3 pt-3 border-t border-[#EAE4DC]/80 dark:border-[#2F302C]/80 flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                    <span className="text-xs">⚡</span>
                    <span>Overlapping Employment &bull; Concurrent timeline merged without double-counting</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#FAF7F2]/50 dark:bg-[#1E1F1D] border border-dashed border-[#EAE4DC] dark:border-[#2F302C] text-center text-xs text-[#5C5E58] dark:text-[#9E9F97]">
          <span className="block font-semibold text-sm mb-1 text-[#141514] dark:text-[#F4F2EE]">
            Summary-Based Experience Evaluation
          </span>
          <span>
            No explicit dated employment intervals were parsed from the resume text. Seniority was evaluated from explicit summary claims ({resume.yearsOfExperience ? `${resume.yearsOfExperience} years` : "unspecified"}).
          </span>
        </div>
      )}

      {/* Academic Degree Isolation Banner */}
      {resume.academicTimeline && resume.academicTimeline.length > 0 && (
        <div className="mt-6 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 flex items-start gap-3 text-xs">
          <span className="text-base leading-none">🎓</span>
          <div>
            <span className="font-semibold text-blue-900 dark:text-blue-200 block">
              Academic Degree Dates Isolated from Professional Tenure
            </span>
            <span className="text-blue-700/80 dark:text-blue-300/80 block mt-0.5">
              {resume.academicTimeline.map((a) => `${a.degreeName} (${a.rawTimeline})`).join(", ")}
              {" "}&mdash; University and academic dates are verified separately and excluded from engineering tenure.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

