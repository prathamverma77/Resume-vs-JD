"use client";

import React, { useState } from "react";
import { AnalyzeApiResponse } from "@/types/analysis";

interface AnalysisResultProps {
  data: AnalyzeApiResponse;
  onCompareAgain: () => void;
}

export default function AnalysisResult({
  data,
  onCompareAgain,
}: AnalysisResultProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const match = data.matchAnalysis;
  const resume = data.resume;
  const jd = data.jobDescription.parsedData;

  const score = match?.overallScore ?? 0;

  // Clean, high-contrast score indicators
  const getScoreBadgeColor = (val: number) => {
    if (val >= 80)
      return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30";
    if (val >= 60)
      return "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30";
    if (val >= 40)
      return "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30";
    return "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30";
  };

  const getScoreTextColor = (val: number) => {
    if (val >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (val >= 60) return "text-blue-600 dark:text-blue-400";
    if (val >= 40) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreColorHex = (val: number) => {
    if (val >= 80) return "#10b981";
    if (val >= 60) return "#2563eb";
    if (val >= 40) return "#f59e0b";
    return "#f43f5e";
  };

  // Radial progress calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Plain-text copy report
  const handleCopyReport = async () => {
    if (!match) return;

    const reportLines = [
      "=== MatchEngine Compatibility Report ===",
      `Target Role: ${jd?.role || "Not specified"}`,
      `Resume File: ${resume.fileInfo.name}`,
      `Overall Score: ${score}% (${match.matchLevel})`,
      `Technical Match: ${match.technicalMatchScore}% (75% weight)`,
      `Preferred Skills Match: ${match.preferredMatchScore}% (25% weight)`,
      "",
      `Matching Skills (${match.matchingSkills.length}):`,
      match.matchingSkills.length > 0
        ? match.matchingSkills.join(", ")
        : "None identified",
      "",
      `Missing Required Skills (${match.missingRequiredSkills.length}):`,
      match.missingRequiredSkills.length > 0
        ? match.missingRequiredSkills.join(", ")
        : "All required skills found",
      "",
      `Missing Preferred Skills (${match.missingPreferredSkills.length}):`,
      match.missingPreferredSkills.length > 0
        ? match.missingPreferredSkills.join(", ")
        : "All preferred skills found",
      "",
      "Recommendations:",
      ...(match.recommendations.map((rec, i) => `${i + 1}. ${rec}`) || []),
    ];

    try {
      await navigator.clipboard.writeText(reportLines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 md:p-8 shadow-xs space-y-7 transition-colors">
      {/* ============================================================
          SECTION A: ANALYSIS SUMMARY HEADER
      ============================================================ */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-5 text-center md:text-left">
          {/* Circular Score Gauge */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 96 96"
            >
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="text-zinc-100 dark:text-zinc-800"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke={getScoreColorHex(score)}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-2xl font-bold tracking-tight leading-none ${getScoreTextColor(
                  score
                )}`}
              >
                {score}%
              </span>
              <span className="text-xs uppercase font-mono font-medium text-zinc-500 dark:text-zinc-400 tracking-wider mt-0.5">
                Score
              </span>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <span
                className={`px-2.5 py-0.5 rounded border text-sm font-semibold tracking-tight ${getScoreBadgeColor(
                  score
                )}`}
              >
                {match?.matchLevel || "Analysis Complete"}
              </span>
              {jd?.role && (
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 px-2.5 py-0.5 rounded">
                  {jd.role}
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Compatibility Report
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 flex flex-wrap items-center justify-center md:justify-start gap-1.5 font-mono">
              <span className="font-semibold">{resume.fileInfo.name}</span>
              <span className="text-zinc-400 dark:text-zinc-600">&bull;</span>
              <span>{resume.pageCount} page(s)</span>
              <span className="text-zinc-400 dark:text-zinc-600">&bull;</span>
              <span>75% req / 25% pref</span>
            </p>
          </div>
        </div>

        {/* Header Action */}
        <button
          type="button"
          onClick={onCompareAgain}
          className="w-full md:w-auto px-4 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/70 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
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
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          <span>New Comparison</span>
        </button>
      </div>

      {/* ============================================================
          SECTION B: METRIC CARDS
      ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            <span>CORE TECHNICAL</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">75% WT</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-zinc-950 dark:text-white">
              {match?.technicalMatchScore ?? 0}%
            </span>
            <div className="w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${match?.technicalMatchScore ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            <span>PREFERRED SKILLS</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">25% WT</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-zinc-950 dark:text-white">
              {match?.preferredMatchScore ?? 0}%
            </span>
            <div className="w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${match?.preferredMatchScore ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <div className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            CANDIDATE CONTACT
          </div>
          <p
            className="text-sm font-semibold text-zinc-950 dark:text-white truncate"
            title={resume.structuredData.email}
          >
            {resume.structuredData.email || "No email detected"}
          </p>
          <p
            className="text-sm text-zinc-600 dark:text-zinc-400 truncate mt-0.5 font-normal"
            title={resume.structuredData.phone}
          >
            {resume.structuredData.phone || "No phone detected"}
          </p>
        </div>
      </div>

      {/* ============================================================
          SECTION C: SKILLS MATRIX
      ============================================================ */}
      <div className="space-y-5 pt-1">
        {/* Matching Skills */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Matching Skills ({match?.matchingSkills.length || 0})
            </h3>
          </div>
          {match?.matchingSkills && match.matchingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {match.matchingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-md bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border border-emerald-500/30 text-sm font-medium inline-flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">
              No matching skills identified between resume and job description.
            </p>
          )}
        </div>

        {/* Missing Required Skills */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Missing Required Skills ({match?.missingRequiredSkills.length || 0})
            </h3>
          </div>
          {match?.missingRequiredSkills &&
          match.missingRequiredSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {match.missingRequiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-md bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-sm font-medium inline-flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              All required technical skills detected in candidate resume!
            </div>
          )}
        </div>

        {/* Missing Preferred Skills */}
        {match?.missingPreferredSkills &&
          match.missingPreferredSkills.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Missing Preferred Skills ({match.missingPreferredSkills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {match.missingPreferredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-md bg-indigo-500/15 text-indigo-900 dark:text-indigo-200 border border-indigo-500/30 text-sm font-medium inline-flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* ============================================================
          SECTION D: ACTIONABLE RECOMMENDATIONS
      ============================================================ */}
      <div className="pt-5 border-t border-zinc-200 dark:border-zinc-800">
        <h3 className="text-base font-semibold text-zinc-950 dark:text-white mb-3">
          Actionable Recommendations
        </h3>
        <div className="space-y-2.5">
          {match?.recommendations && match.recommendations.length > 0 ? (
            match.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 rounded-lg flex items-start gap-3 text-sm md:text-base text-zinc-800 dark:text-zinc-200 font-normal"
              >
                <span className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                  0{idx + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">
              Profile matches job criteria well.
            </p>
          )}
        </div>
      </div>

      {/* ============================================================
          SECTION E: EXTRACTED DETAILS COMPARISON
      ============================================================ */}
      <div className="pt-5 border-t border-zinc-200 dark:border-zinc-800">
        <h3 className="text-base font-semibold text-zinc-950 dark:text-white mb-3">
          Job Requirements Context
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Education Prerequisites */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2.5">
            <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 block">
              ACADEMIC PREREQUISITES
            </span>
            {jd?.education && jd.education.length > 0 ? (
              <ul className="text-zinc-800 dark:text-zinc-200 space-y-1 list-disc list-inside font-normal">
                {jd.education.map((edu, i) => (
                  <li key={i}>{edu}</li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 italic text-xs">
                No specific degree requirements explicitly found.
              </p>
            )}
          </div>

          {/* Key Responsibilities */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2.5">
            <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 block">
              TARGET RESPONSIBILITIES
            </span>
            {jd?.responsibilities && jd.responsibilities.length > 0 ? (
              <ul className="text-zinc-800 dark:text-zinc-200 space-y-1 list-disc list-inside max-h-32 overflow-y-auto pr-1 font-normal">
                {jd.responsibilities.slice(0, 5).map((resp, i) => (
                  <li key={i} className="line-clamp-2">
                    {resp}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 italic text-xs">
                No explicit responsibilities section parsed.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION F: RESULT ACTIONS
      ============================================================ */}
      <div className="pt-5 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleCopyReport}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold text-sm md:text-base tracking-wide border border-zinc-300 dark:border-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span>Copy Report</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onCompareAgain}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-white font-semibold text-sm md:text-base tracking-wide bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg
            className="w-4 h-4 text-blue-100"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          <span>Analyze Another</span>
        </button>
      </div>
    </div>
  );
}
