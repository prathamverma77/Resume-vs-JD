"use client";

import React from "react";
import { ScoreAnalysisResult, StructuredResume, JDExtractedData } from "@/types/analysis";
import { ScoreTheme } from "./types";

interface ScoreGaugeProps {
  score: number;
  baselineScore: number;
  scoreDelta: number;
  isSimulating: boolean;
  matchLevel: string;
  theme: ScoreTheme;
  match: ScoreAnalysisResult | null;
  baselineMatch: ScoreAnalysisResult | null;
  totalReqCount: number;
  totalPrefCount: number;
  resume: StructuredResume;
  jd: JDExtractedData | null;
}

export default function ScoreGauge({
  score,
  baselineScore,
  scoreDelta,
  isSimulating,
  matchLevel,
  theme,
  match,
  baselineMatch,
  totalReqCount,
  totalPrefCount,
  resume,
  jd,
}: ScoreGaugeProps) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (score / 100) * circumference;

  return (
    <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2]/30 dark:bg-[#161715]/40 print:bg-white print:p-4 print-avoid-break">
      <div className="grid grid-cols-1 lg:grid-cols-12 print:grid-cols-12 gap-8 print:gap-4 items-center">
        {/* Radial SVG Circular Score Gauge (5 Cols) */}
        <div className="lg:col-span-5 print:col-span-5 flex flex-col items-center justify-center p-6 sm:p-8 print:p-4 rounded-3xl print:rounded-2xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] print:border-[#D4CFC7] shadow-xs text-center print-avoid-break">
          <div className="flex items-center gap-2 mb-4 print:mb-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#82847E] dark:text-[#72736C]">
              Overall Compatibility Score
            </span>
            {isSimulating && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30">
                Simulated
              </span>
            )}
          </div>

          {/* Circular Gauge */}
          <div className="relative w-44 h-44 print:w-36 print:h-36 flex items-center justify-center mb-4 print:mb-2">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
              {/* Background Track */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-[#EAE4DC] dark:stroke-[#2A2B27] print:stroke-[#EAE4DC]"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Progress Indicator */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke={theme.stroke}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Centered Percentage */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl sm:text-5xl print:text-3xl font-bold font-sans tracking-tight text-[#141514] dark:text-[#F4F2EE]">
                {score}%
              </span>
              <span className={`text-[11px] font-semibold mt-1 px-2.5 py-0.5 rounded-full border ${theme.bgLight} ${theme.badgeBorder} ${theme.badgeText}`}>
                {matchLevel}
              </span>
              {isSimulating && scoreDelta !== 0 && (
                <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 animate-pulse">
                  ▲ {scoreDelta > 0 ? `+${scoreDelta}%` : `${scoreDelta}%`} Lift
                </span>
              )}
            </div>
          </div>

          {isSimulating ? (
            <div className="text-xs font-mono text-[#5C5E58] dark:text-[#9E9F97] flex items-center justify-center gap-2">
              <span>Baseline: <strong className="text-[#141514] dark:text-[#F4F2EE]">{baselineScore}%</strong></span>
              <span>&rarr;</span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400">Simulated: {score}%</span>
            </div>
          ) : (
            <p className="text-xs text-[#5C5E58] dark:text-[#9E9F97] max-w-xs leading-relaxed font-sans">
              {match?.scoringBreakdown?.isPreferredRedistributed
                ? "Dynamic 5-Dimension Weighting: 65% Core + 15% Adjacent + 20% Seniority (Preferred redistributed)."
                : "Dynamic 5-Dimension Weighting: 55% Core + 15% Preferred + 15% Adjacent + 15% Seniority."}
            </p>
          )}
        </div>

        {/* 3 Metric Cards Grid (7 Cols) */}
        <div className="lg:col-span-7 print:col-span-7 flex flex-col gap-4 print:gap-2.5 print-avoid-break">
          {/* Gate Cap Alert Banner or Gate Lifted Banner */}
          {baselineMatch?.scoringBreakdown?.dealbreakerCapApplied && !match?.scoringBreakdown?.dealbreakerCapApplied ? (
            <div className="p-4 print:p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-3 shadow-xs print-avoid-break">
              <span className="text-xl">🎉</span>
              <div>
                <span className="font-bold block text-emerald-800 dark:text-emerald-300">
                  Dealbreaker Gate Constraint Lifted!
                </span>
                <span>
                  Simulating a primary required language satisfied gate prerequisites, releasing your compatibility score from the 55% cap up to{" "}
                  <strong className="font-mono text-emerald-700 dark:text-emerald-300">{score}%</strong>.
                </span>
              </div>
            </div>
          ) : match?.scoringBreakdown?.dealbreakerCapApplied ? (
            <div className="p-4 print:p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-3 print-avoid-break">
              <span className="text-base">⚠️</span>
              <div>
                <span className="font-bold block">Dealbreaker Gate Enforced</span>
                <span>{match?.scoringBreakdown?.capReason || "Missing primary required language; overall score capped at 55%."}</span>
              </div>
            </div>
          ) : null}

          {/* Metric 1: Core Technical Coverage */}
          <div className="p-5 sm:p-6 print:p-3 rounded-2xl print:rounded-xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] print:border-[#D4CFC7] shadow-2xs print-avoid-break">
            <div className="flex items-center justify-between mb-2 print:mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5C5E58] dark:text-[#9E9F97]">
                  Core Technical Coverage ({match?.scoringBreakdown?.coreWeight ?? 55}% Weight)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {match?.technicalMatchScore ?? 0}%
                </span>
                {isSimulating && (match?.technicalMatchScore ?? 0) > (baselineMatch?.technicalMatchScore ?? 0) && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30">
                    +{(match?.technicalMatchScore ?? 0) - (baselineMatch?.technicalMatchScore ?? 0)}% simulated
                  </span>
                )}
              </div>
            </div>

            {/* Dual-tone Progress Bar */}
            <div className="w-full bg-[#EAE4DC] dark:bg-[#2A2B27] rounded-full h-2.5 print:h-2 overflow-hidden mb-2 print:mb-1 relative flex">
              <div
                className="bg-emerald-600 dark:bg-emerald-500 h-2.5 print:h-2 rounded-l-full transition-all duration-500 shrink-0"
                style={{ width: `${Math.min(100, baselineMatch?.technicalMatchScore ?? 0)}%` }}
                title={`Baseline: ${baselineMatch?.technicalMatchScore ?? 0}%`}
              />
              {isSimulating && (match?.technicalMatchScore ?? 0) > (baselineMatch?.technicalMatchScore ?? 0) && (
                <div
                  className="bg-gradient-to-r from-cyan-500 to-teal-400 h-2.5 print:h-2 rounded-r-full transition-all duration-500 animate-pulse"
                  style={{
                    width: `${Math.min(
                      100 - (baselineMatch?.technicalMatchScore ?? 0),
                      (match?.technicalMatchScore ?? 0) - (baselineMatch?.technicalMatchScore ?? 0)
                    )}%`,
                  }}
                  title={`Simulated Boost: +${(match?.technicalMatchScore ?? 0) - (baselineMatch?.technicalMatchScore ?? 0)}%`}
                />
              )}
            </div>

            <div className="flex items-center justify-between text-xs print:text-[11px] text-[#5C5E58] dark:text-[#9E9F97]">
              <span>
                {totalReqCount === 0
                  ? "No mandatory technical skills detected in JD."
                  : (match?.missingRequiredSkills.length || 0) === 0
                  ? "All mandatory technical skills verified in candidate resume."
                  : `${match?.missingRequiredSkills.length} mandatory skill gap(s) identified.`}
              </span>
              <span className="font-mono font-medium">
                {totalReqCount - (match?.missingRequiredSkills.length || 0)} / {totalReqCount} matched
              </span>
            </div>
          </div>

          {/* Metric 2: Preferred Skills Coverage (with N/A redistribution support) */}
          <div className="p-5 sm:p-6 print:p-3 rounded-2xl print:rounded-xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] print:border-[#D4CFC7] shadow-2xs print-avoid-break">
            <div className="flex items-center justify-between mb-2 print:mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5C5E58] dark:text-[#9E9F97]">
                  Preferred Qualifications ({match?.scoringBreakdown?.preferredWeight ?? 15}% Weight)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                  {match?.scoringBreakdown?.isPreferredRedistributed ? "N/A (Redistributed)" : `${match?.preferredMatchScore ?? 0}%`}
                </span>
                {isSimulating && !match?.scoringBreakdown?.isPreferredRedistributed && (match?.preferredMatchScore ?? 0) > (baselineMatch?.preferredMatchScore ?? 0) && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30">
                    +{(match?.preferredMatchScore ?? 0) - (baselineMatch?.preferredMatchScore ?? 0)}% simulated
                  </span>
                )}
              </div>
            </div>

            {/* Dual-tone Progress Bar */}
            <div className="w-full bg-[#EAE4DC] dark:bg-[#2A2B27] rounded-full h-2.5 print:h-2 overflow-hidden mb-2 print:mb-1 relative flex">
              <div
                className="bg-amber-500 dark:bg-amber-400 h-2.5 print:h-2 rounded-l-full transition-all duration-500 shrink-0"
                style={{
                  width: `${match?.scoringBreakdown?.isPreferredRedistributed ? 100 : Math.min(100, baselineMatch?.preferredMatchScore ?? 0)}%`,
                }}
                title={`Baseline: ${baselineMatch?.preferredMatchScore ?? 0}%`}
              />
              {isSimulating && !match?.scoringBreakdown?.isPreferredRedistributed && (match?.preferredMatchScore ?? 0) > (baselineMatch?.preferredMatchScore ?? 0) && (
                <div
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 h-2.5 print:h-2 rounded-r-full transition-all duration-500 animate-pulse"
                  style={{
                    width: `${Math.min(
                      100 - (baselineMatch?.preferredMatchScore ?? 0),
                      (match?.preferredMatchScore ?? 0) - (baselineMatch?.preferredMatchScore ?? 0)
                    )}%`,
                  }}
                  title={`Simulated Boost: +${(match?.preferredMatchScore ?? 0) - (baselineMatch?.preferredMatchScore ?? 0)}%`}
                />
              )}
            </div>

            <div className="flex items-center justify-between text-xs print:text-[11px] text-[#5C5E58] dark:text-[#9E9F97]">
              <span>
                {match?.scoringBreakdown?.isPreferredRedistributed
                  ? "No preferred section parsed in JD. Weight dynamically redistributed to core skills."
                  : (match?.missingPreferredSkills.length || 0) === 0
                  ? "All bonus qualifications detected in resume."
                  : `${match?.missingPreferredSkills.length} bonus qualification gap(s).`}
              </span>
              {totalPrefCount > 0 && !match?.scoringBreakdown?.isPreferredRedistributed && (
                <span className="font-mono font-medium">
                  {totalPrefCount - (match?.missingPreferredSkills.length || 0)} / {totalPrefCount} matched
                </span>
              )}
            </div>
          </div>

          {/* Metric 3: Seniority & Experience Alignment (Banded Nuance) */}
          <div className="p-5 sm:p-6 print:p-3 rounded-2xl print:rounded-xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] print:border-[#D4CFC7] shadow-2xs flex items-center justify-between print-avoid-break">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5C5E58] dark:text-[#9E9F97] block mb-1">
                Seniority & Tenure Alignment {match?.scoringBreakdown?.isSeniorityRedistributed ? "(N/A - Redistributed)" : `(${match?.scoringBreakdown?.seniorityWeight ?? 15}% Weight)`}
              </span>
              <span className="text-sm print:text-xs font-semibold text-[#141514] dark:text-[#F4F2EE] block">
                {match?.seniorityMatch?.statusNote ||
                  (match?.seniorityMatch?.isMet
                    ? "Candidate Meets Experience Prerequisites"
                    : resume.yearsOfExperience && jd?.minYearsExperience
                    ? `Experience: ${resume.yearsOfExperience} yrs vs ${jd.minYearsExperience}+ yrs requested`
                    : "No minimum experience specified in JD (Weight redistributed to core skills)")}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              match?.scoringBreakdown?.isSeniorityRedistributed || match?.seniorityMatch?.tenureBand === "Unspecified"
                ? "bg-neutral-500/10 text-neutral-700 dark:text-neutral-400 border border-neutral-500/20"
                : match?.seniorityMatch?.tenureBand === "Aligned"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                : match?.seniorityMatch?.tenureBand === "Borderline"
                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
            }`}>
              {match?.scoringBreakdown?.isSeniorityRedistributed
                ? "Unspecified (0% Weight)"
                : match?.seniorityMatch?.tenureBand || (match?.seniorityMatch?.isMet ? "Aligned" : "Review")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

