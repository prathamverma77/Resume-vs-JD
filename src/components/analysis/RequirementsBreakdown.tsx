"use client";

import React from "react";
import { RequirementFilter, RequirementItem } from "./types";

interface RequirementsBreakdownProps {
  requirements: RequirementItem[];
  filter: RequirementFilter;
  searchQuery: string;
  counts: {
    all: number;
    matched: number;
    missing_required: number;
    missing_preferred: number;
    simulated: number;
  };
  isSimulating: boolean;
  hasAnyRequirements: boolean;
  onFilterChange: (filter: RequirementFilter) => void;
  onSearchChange: (query: string) => void;
}

export default function RequirementsBreakdown({
  requirements,
  filter,
  searchQuery,
  counts,
  isSimulating,
  hasAnyRequirements,
  onFilterChange,
  onSearchChange,
}: RequirementsBreakdownProps) {
  return (
    <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] print:bg-white print-avoid-break">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#141514] dark:text-[#F4F2EE] tracking-[-0.015em]">
            Requirement Comparison Matrix
          </h2>
          <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-1 font-sans">
            Side-by-side verification of extracted qualifications against candidate evidence.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-72 print:hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter qualifications..."
            className="w-full text-xs px-4 py-2.5 rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2]/60 dark:bg-[#1E1F1D] text-[#141514] dark:text-[#F4F2EE] placeholder-[#82847E] focus:outline-none focus:border-[#141514] dark:focus:border-[#F4F2EE] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#82847E] hover:text-[#141514] cursor-pointer"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6 print:hidden">
        <button
          type="button"
          onClick={() => onFilterChange("all")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
            filter === "all"
              ? "bg-[#141514] text-white dark:bg-[#F4F2EE] dark:text-[#141514] shadow-xs"
              : "bg-[#FAF7F2] dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C] text-[#5C5E58] dark:text-[#9E9F97] hover:text-[#141514] dark:hover:text-[#F4F2EE]"
          }`}
        >
          All Requirements ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => onFilterChange("matched")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === "matched"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-[#FAF7F2] dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C] text-[#5C5E58] dark:text-[#9E9F97] hover:text-emerald-600"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Matched ({counts.matched})
        </button>

        {isSimulating && (
          <button
            type="button"
            onClick={() => onFilterChange("simulated")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === "simulated"
                ? "bg-cyan-600 text-white shadow-xs"
                : "bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
            Simulated ({counts.simulated})
          </button>
        )}

        <button
          type="button"
          onClick={() => onFilterChange("missing_required")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === "missing_required"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-[#FAF7F2] dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C] text-[#5C5E58] dark:text-[#9E9F97] hover:text-rose-600"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Missing Required ({counts.missing_required})
        </button>

        <button
          type="button"
          onClick={() => onFilterChange("missing_preferred")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === "missing_preferred"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-[#FAF7F2] dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C] text-[#5C5E58] dark:text-[#9E9F97] hover:text-amber-600"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Missing Preferred ({counts.missing_preferred})
        </button>
      </div>

      {/* Tabular Matrix */}
      {requirements.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#5C5E58] dark:text-[#9E9F97] rounded-2xl border border-dashed border-[#EAE4DC] dark:border-[#2F302C]">
          {!hasAnyRequirements
            ? "No technical requirements were identified in the provided job description."
            : "No qualifications match the active filter or search query."}
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#EAE4DC] dark:border-[#2F302C] rounded-2xl bg-white dark:bg-[#1B1C1A]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF7F2]/80 dark:bg-[#161715] text-[#5C5E58] dark:text-[#9E9F97] border-b border-[#EAE4DC] dark:border-[#2F302C] font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-5 font-semibold">Requirement / Skill</th>
                <th className="py-3.5 px-4 font-semibold w-28">Category</th>
                <th className="py-3.5 px-4 font-semibold w-40">Status</th>
                <th className="py-3.5 px-5 font-semibold">Evidence / Verification Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE4DC] dark:divide-[#2F302C]">
              {requirements.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#1F201D] transition-colors"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#141514] dark:text-[#F4F2EE] text-xs sm:text-sm">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#141514]/5 dark:bg-white/5 text-[#82847E] dark:text-[#72736C]">
                        {item.weightTier.split(":")[0]}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${
                      item.category === "Required"
                        ? "bg-neutral-100 dark:bg-neutral-800 text-[#141514] dark:text-[#F4F2EE]"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {item.isSimulated ? (
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                          Simulated Match
                        </span>
                      </div>
                    ) : item.isMatched ? (
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          Matched
                        </span>
                        {item.isProductionDepth && (
                          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                            ⚡ Production Depth
                          </span>
                        )}
                      </div>
                    ) : item.isAdjacent ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                        Adjacent (50%)
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                          item.category === "Required"
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Not in resume
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-[#5C5E58] dark:text-[#9E9F97]">
                    <span>{item.evidence}</span>
                    {item.evidenceQuote && (
                      <div className="mt-1.5 p-2 rounded-lg bg-[#FAF7F2] dark:bg-[#151614] border border-[#EAE4DC] dark:border-[#2F302C] text-[11px] text-[#141514] dark:text-[#F4F2EE] font-mono leading-relaxed">
                        <span className="text-[#82847E] font-sans block text-[10px] uppercase font-semibold mb-0.5">Resume Evidence Quote:</span>
                        &ldquo;{item.evidenceQuote}&rdquo;
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

