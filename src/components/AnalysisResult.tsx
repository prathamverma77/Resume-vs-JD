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
    if (val >= 80) return "bg-emerald-50 text-emerald-800 border-emerald-300/80 shadow-emerald-500/10";
    if (val >= 60) return "bg-blue-50 text-blue-800 border-blue-300/80 shadow-blue-500/10";
    if (val >= 40) return "bg-amber-50 text-amber-800 border-amber-300/80 shadow-amber-500/10";
    return "bg-rose-50 text-rose-800 border-rose-300/80 shadow-rose-500/10";
  };

  const getScoreColorHex = (val: number) => {
    if (val >= 80) return "#10b981"; // emerald-500
    if (val >= 60) return "#2563eb"; // blue-600
    if (val >= 40) return "#f59e0b"; // amber-500
    return "#ef4444"; // rose-500
  };

  const getScoreTextColor = (val: number) => {
    if (val >= 80) return "text-emerald-600";
    if (val >= 60) return "text-blue-600";
    if (val >= 40) return "text-amber-600";
    return "text-rose-600";
  };

  // Radial progress calculations for 90px circle
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-md animate-fade-in space-y-6">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div className="flex items-center gap-5 text-center md:text-left">
          {/* Circular Score Meter */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="text-slate-100"
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
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-black tracking-tight leading-none ${getScoreTextColor(score)}`}>
                {score}%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                Match
              </span>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <span
                className={`px-3 py-0.5 rounded-full border text-xs font-bold tracking-tight shadow-xs ${getScoreBadgeColor(
                  score
                )}`}
              >
                {match?.matchLevel || "Analysis Complete"}
              </span>
              {jd?.role && (
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 rounded-full">
                  Target Role: {jd.role}
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
              Match Engine Compatibility Report
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center justify-center md:justify-start gap-1.5">
              <span>Resume: <strong className="text-slate-700">{resume.fileInfo.name}</strong></span>
              <span className="text-slate-300">&bull;</span>
              <span>{resume.pageCount} page(s) processed</span>
            </p>
          </div>
        </div>

        {/* Top Action Button */}
        <button
          type="button"
          onClick={onCompareAgain}
          className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Compare New Resume
        </button>
      </div>

      {/* Sub-scores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-1">
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Technical Match
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-900">
              {match?.technicalMatchScore ?? 0}%
            </span>
            <div className="w-20 bg-slate-200/90 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${match?.technicalMatchScore ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Preferred Skills Match
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-900">
              {match?.preferredMatchScore ?? 0}%
            </span>
            <div className="w-20 bg-slate-200/90 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${match?.preferredMatchScore ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 shadow-2xs sm:col-span-2 md:col-span-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Candidate Contact
          </span>
          <p className="text-xs font-bold text-slate-800 truncate" title={resume.structuredData.email}>
            {resume.structuredData.email || "No email detected"}
          </p>
          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5" title={resume.structuredData.phone}>
            {resume.structuredData.phone || "No phone detected"}
          </p>
        </div>
      </div>

      {/* Skills Breakdown Section */}
      <div className="pt-2 pb-2 space-y-5 border-t border-slate-200/80">
        {/* Matching Skills */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
            Matching Skills ({match?.matchingSkills.length || 0})
          </h3>
          {match?.matchingSkills && match.matchingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {match.matchingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs hover:scale-[1.02] transition-transform"
                >
                  <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No matching skills identified.</p>
          )}
        </div>

        {/* Missing Required Skills */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
            Missing Required Skills ({match?.missingRequiredSkills.length || 0})
          </h3>
          {match?.missingRequiredSkills && match.missingRequiredSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {match.missingRequiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              All required skills are present in candidate resume!
            </div>
          )}
        </div>

        {/* Missing Preferred Skills (if any) */}
        {match?.missingPreferredSkills && match.missingPreferredSkills.length > 0 && (
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-xs" />
              Missing Preferred Skills ({match.missingPreferredSkills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {match.missingPreferredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      <div className="pt-4 pb-2 border-t border-slate-200/80">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3.5 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 2.625a3.75 3.75 0 10-7.5 0 3.75 3.75 0 007.5 0z" />
          </svg>
          Actionable Recommendations
        </h3>
        <div className="space-y-2.5">
          {match?.recommendations && match.recommendations.length > 0 ? (
            match.recommendations.map((rec, idx) => (
              <div key={idx} className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3 text-xs text-slate-800">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                  {idx + 1}
                </div>
                <span className="leading-relaxed font-medium">{rec}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No specific recommendations generated.</p>
          )}
        </div>
      </div>

      {/* Bottom Reset Button */}
      <div className="pt-4 border-t border-slate-200/80 flex justify-center">
        <button
          type="button"
          onClick={onCompareAgain}
          className="w-full md:w-80 h-12 rounded-xl text-white font-semibold text-sm tracking-wide bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Compare Another Resume
        </button>
      </div>
    </div>
  );
}

