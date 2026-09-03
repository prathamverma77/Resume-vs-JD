"use client";

import React from "react";
import { AnalyzeApiResponse } from "@/types/analysis";

interface AnalysisResultProps {
  data: AnalyzeApiResponse;
  onCompareAgain: () => void;
}

export default function AnalysisResult({ data, onCompareAgain }: AnalysisResultProps) {
  const match = data.matchAnalysis;
  const resume = data.resume;
  const jd = data.jobDescription.parsedData;

  const score = match?.overallScore ?? 0;

  // Determine theme color based on score
  const getScoreBadgeColor = (val: number) => {
    if (val >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (val >= 60) return "bg-sky-50 text-sky-700 border-sky-200";
    if (val >= 40) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  const getScoreTextColor = (val: number) => {
    if (val >= 80) return "text-emerald-600";
    if (val >= 60) return "text-[var(--primary)]";
    if (val >= 40) return "text-amber-600";
    return "text-rose-600";
  };

  return (
    <div className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs animate-fade-in">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-5 text-center md:text-left">
          {/* Big Score Circle */}
          <div className="relative w-24 h-24 rounded-full bg-slate-50 border-4 border-slate-100 flex flex-col items-center justify-center shrink-0 shadow-inner">
            <span className={`text-2xl font-extrabold tracking-tight ${getScoreTextColor(score)}`}>
              {score}%
            </span>
            <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
              Match
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
              <span
                className={`px-3 py-0.5 rounded-full border text-xs font-semibold ${getScoreBadgeColor(
                  score
                )}`}
              >
                {match?.matchLevel || "Analysis Complete"}
              </span>
              {jd?.role && (
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  Role: {jd.role}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-main)]">
              Match Engine Compatibility Report
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Resume: <span className="font-medium text-slate-700">{resume.fileInfo.name}</span> &bull; {resume.pageCount} page(s)
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          type="button"
          onClick={onCompareAgain}
          className="w-full md:w-auto px-5 py-2.5 rounded-lg bg-[var(--secondary)] text-white text-xs font-medium tracking-wide hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Compare Again
        </button>
      </div>

      {/* Sub-scores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-5 border-b border-[var(--border-color)]">
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3.5">
          <span className="text-xs font-medium text-[var(--text-muted)] block mb-1">
            Technical Match
          </span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-[var(--text-main)]">
              {match?.technicalMatchScore ?? 0}%
            </span>
            <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[var(--primary)] h-2 rounded-full transition-all duration-500"
                style={{ width: `${match?.technicalMatchScore ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3.5">
          <span className="text-xs font-medium text-[var(--text-muted)] block mb-1">
            Preferred Skills Match
          </span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-[var(--text-main)]">
              {match?.preferredMatchScore ?? 0}%
            </span>
            <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${match?.preferredMatchScore ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3.5 sm:col-span-2 md:col-span-1">
          <span className="text-xs font-medium text-[var(--text-muted)] block mb-1">
            Candidate Contact Info
          </span>
          <p className="text-xs font-semibold text-[var(--text-main)] truncate">
            {resume.structuredData.email || "No email detected"}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] truncate">
            {resume.structuredData.phone || "No phone detected"}
          </p>
        </div>
      </div>

      {/* Skills Analysis Section */}
      <div className="py-5 space-y-5 border-b border-[var(--border-color)]">
        {/* Matching Skills */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Matching Skills ({match?.matchingSkills.length || 0})
          </h3>
          {match?.matchingSkills && match.matchingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {match.matchingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No matching skills identified.</p>
          )}
        </div>

        {/* Missing Required Skills */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Missing Required Skills ({match?.missingRequiredSkills.length || 0})
          </h3>
          {match?.missingRequiredSkills && match.missingRequiredSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {match.missingRequiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-medium"
                >
                  ! {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 font-medium text-[11px]">
              ✓ All required skills present in candidate resume!
            </p>
          )}
        </div>

        {/* Missing Preferred Skills (if any) */}
        {match?.missingPreferredSkills && match.missingPreferredSkills.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Missing Preferred Skills ({match.missingPreferredSkills.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {match.missingPreferredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations List */}
      <div className="pt-5 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Actionable Recommendations
        </h3>
        <ul className="space-y-2">
          {match?.recommendations && match.recommendations.length > 0 ? (
            match.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-main)]">
                <span className="text-[var(--primary)] font-bold shrink-0">&bull;</span>
                <span>{rec}</span>
              </li>
            ))
          ) : (
            <li className="text-xs text-slate-400 italic">No recommendations available.</li>
          )}
        </ul>
      </div>

      {/* Bottom Compare Again Centered Button */}
      <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex justify-center">
        <button
          type="button"
          onClick={onCompareAgain}
          style={{ backgroundColor: "var(--primary)" }}
          className="w-full md:w-80 h-11 rounded-lg text-white font-medium text-sm tracking-wide shadow-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Compare Again
        </button>
      </div>
    </div>
  );
}
