"use client";

import React, { useState, useMemo } from "react";
import { AnalyzeApiResponse } from "@/types/analysis";
import { normalizeSkill } from "@/lib/skills/normalizer";

interface AnalysisResultProps {
  data: AnalyzeApiResponse;
  onCompareAgain: () => void;
}

type RequirementFilter = "all" | "matched" | "missing_required" | "missing_preferred";

interface RequirementItem {
  id: string;
  name: string;
  category: "Required" | "Preferred";
  status: "Matched" | "Not found in resume";
  isMatched: boolean;
  evidence: string;
}

export default function AnalysisResult({
  data,
  onCompareAgain,
}: AnalysisResultProps) {
  const [filter, setFilter] = useState<RequirementFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const match = data.matchAnalysis;
  const resume = data.resume;
  const jd = data.jobDescription.parsedData;

  const score = match?.overallScore ?? 0;
  const matchLevel = match?.matchLevel || "Analysis Complete";

  // Build unified, structured requirements list
  const allRequirements: RequirementItem[] = useMemo(() => {
    const items: RequirementItem[] = [];
    const matchedNormalized = new Set(
      (match?.matchingSkills || []).map((s) => normalizeSkill(s))
    );

    // 1. Required Technical Skills
    if (jd?.technical_req) {
      for (const req of jd.technical_req) {
        const norm = normalizeSkill(req);
        const isMatched = matchedNormalized.has(norm);
        items.push({
          id: `req-${req}`,
          name: req,
          category: "Required",
          status: isMatched ? "Matched" : "Not found in resume",
          isMatched,
          evidence: isMatched
            ? "Identified in candidate skills and experience"
            : "No direct mention identified in resume text",
        });
      }
    }

    // 2. Preferred Skills
    if (jd?.preferred_skills) {
      for (const pref of jd.preferred_skills) {
        const norm = normalizeSkill(pref);
        const isMatched = matchedNormalized.has(norm);
        items.push({
          id: `pref-${pref}`,
          name: pref,
          category: "Preferred",
          status: isMatched ? "Matched" : "Not found in resume",
          isMatched,
          evidence: isMatched
            ? "Identified in candidate skills and experience"
            : "Optional preference not detected in resume text",
        });
      }
    }

    return items;
  }, [jd, match]);

  // Counts for filters
  const counts = useMemo(() => {
    const matched = allRequirements.filter((r) => r.isMatched).length;
    const missingReq = allRequirements.filter(
      (r) => !r.isMatched && r.category === "Required"
    ).length;
    const missingPref = allRequirements.filter(
      (r) => !r.isMatched && r.category === "Preferred"
    ).length;
    return {
      all: allRequirements.length,
      matched,
      missing_required: missingReq,
      missing_preferred: missingPref,
    };
  }, [allRequirements]);

  // Filtered requirements
  const filteredRequirements = useMemo(() => {
    return allRequirements.filter((item) => {
      // Category filter
      if (filter === "matched" && !item.isMatched) return false;
      if (filter === "missing_required" && (item.isMatched || item.category !== "Required")) return false;
      if (filter === "missing_preferred" && (item.isMatched || item.category !== "Preferred")) return false;

      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.evidence.toLowerCase().includes(q);
      }

      return true;
    });
  }, [allRequirements, filter, searchQuery]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Restrained semantic status styling
  const getScoreColorTone = (val: number) => {
    if (val >= 80) return "text-[#1E6B42] dark:text-[#35A36A]";
    if (val >= 60) return "text-[#233F9B] dark:text-[#5274D9]";
    if (val >= 40) return "text-[#9E5510] dark:text-[#D9822B]";
    return "text-[#B83232] dark:text-[#E55353]";
  };

  // Plain-text copy report
  const handleCopyReport = async () => {
    if (!match) return;

    const reportLines = [
      "=======================================================",
      " MATCHENGINE COMPATIBILITY AUDIT REPORT",
      "=======================================================",
      `Target Role:       ${jd?.role && jd.role !== "Role not specified" ? jd.role : "Not specified"}`,
      `Resume File:       ${resume.fileInfo.name} (${resume.pageCount} page(s))`,
      `Candidate Email:   ${resume.structuredData.email || "Not detected"}`,
      `Candidate Phone:   ${resume.structuredData.phone || "Not detected"}`,
      `Overall Score:     ${score}% (${matchLevel})`,
      `Core Technical:    ${match.technicalMatchScore}% (75% weight)`,
      `Preferred Skills:  ${jd?.preferred_skills?.length === 0 ? "N/A (None listed in JD)" : `${match.preferredMatchScore}% (25% weight)`}`,
      "",
      `Matching Skills (${match.matchingSkills.length}):`,
      match.matchingSkills.length > 0 ? match.matchingSkills.join(", ") : "None identified",
      "",
      `Missing Required Skills (${match.missingRequiredSkills.length}):`,
      (!jd?.technical_req || jd.technical_req.length === 0)
        ? "No required skills identified in JD"
        : match.missingRequiredSkills.length > 0
        ? match.missingRequiredSkills.join(", ")
        : "All required skills found in candidate profile",
      "",
      `Missing Preferred Skills (${match.missingPreferredSkills.length}):`,
      (!jd?.preferred_skills || jd.preferred_skills.length === 0)
        ? "No preferred skills listed in JD"
        : match.missingPreferredSkills.length > 0
        ? match.missingPreferredSkills.join(", ")
        : "All preferred skills found in candidate profile",
      "",
      "Actionable Recommendations:",
      ...(match.recommendations && match.recommendations.length > 0
        ? match.recommendations.map((rec, i) => `${i + 1}. ${rec}`)
        : ["Profile aligns well with target specifications."]),
      "",
      "=======================================================",
      "Generated in-memory via MatchEngine",
    ];

    try {
      await navigator.clipboard.writeText(reportLines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const totalReqCount = jd?.technical_req?.length || 0;
  const totalPrefCount = jd?.preferred_skills?.length || 0;

  return (
    <div className="w-full bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] rounded-2xl shadow-sm overflow-hidden text-[#141514] dark:text-[#F4F2EE]">
      {/* ============================================================
          1. REPORT DOCUMENT HEADER
      ============================================================ */}
      <div className="p-6 md:p-8 border-b border-[#EAE4DC] dark:border-[#2F302C]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 pb-6 border-b border-[#EAE4DC] dark:border-[#2F302C]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#82847E] dark:text-[#72736C]">
                Compatibility Audit
              </span>
              <span className="text-[#82847E]">&bull;</span>
              <span className="text-[11px] font-mono text-[#82847E] dark:text-[#72736C]">
                In-Memory Analysis
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-normal tracking-[-0.02em] text-[#141514] dark:text-[#F4F2EE] leading-tight">
              {jd?.role && jd.role !== "Role not specified" && jd.role !== "Not specified"
                ? jd.role
                : "Requirement Compatibility Report"}
            </h1>

            <p className="text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-1.5 font-sans">
              Deterministic comparison of candidate resume against target role specifications.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyReport}
              className="px-4 py-2 text-xs font-semibold rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2] hover:bg-[#F3ECE4] dark:bg-[#222320] dark:hover:bg-[#2A2B27] text-[#141514] dark:text-[#F4F2EE] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-[#1B663E] dark:text-[#35A36A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-[#5C5E58] dark:text-[#9E9F97]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span>Copy Report</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCompareAgain}
              className="px-4 py-2 text-xs font-semibold rounded-full bg-[#111210] hover:bg-neutral-800 dark:bg-[#F4F2EE] dark:text-[#111210] dark:hover:bg-white text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>Analyze Another</span>
            </button>
          </div>
        </div>

        {/* Metadata Strip (Clean Aligned Table, Not Boxed Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#62635D] dark:text-[#9A9A92] block mb-0.5">
              Candidate Resume
            </span>
            <span className="font-semibold text-[#191A18] dark:text-[#F1EFEB] truncate block" title={resume.fileInfo.name}>
              {resume.fileInfo.name}
            </span>
            <span className="text-[11px] text-[#62635D] dark:text-[#9A9A92] font-mono">
              {formatFileSize(resume.fileInfo.size)} &bull; {resume.pageCount} page(s)
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#62635D] dark:text-[#9A9A92] block mb-0.5">
              Candidate Contact
            </span>
            <span className="font-semibold text-[#191A18] dark:text-[#F1EFEB] truncate block" title={resume.structuredData.email || "None"}>
              {resume.structuredData.email || "No email parsed"}
            </span>
            <span className="text-[11px] text-[#62635D] dark:text-[#9A9A92] font-mono">
              {resume.structuredData.phone || "No phone parsed"}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#62635D] dark:text-[#9A9A92] block mb-0.5">
              Role Requirements
            </span>
            <span className="font-semibold text-[#191A18] dark:text-[#F1EFEB] block">
              {totalReqCount} Required &bull; {totalPrefCount} Preferred
            </span>
            <span className="text-[11px] text-[#62635D] dark:text-[#9A9A92] font-mono">
              {totalReqCount + totalPrefCount} total identified
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#62635D] dark:text-[#9A9A92] block mb-0.5">
              Match Status
            </span>
            <span className={`font-bold block ${getScoreColorTone(score)}`}>
              {score}% &bull; {matchLevel}
            </span>
            <span className="text-[11px] text-[#62635D] dark:text-[#9A9A92] font-mono">
              {match?.matchingSkills.length || 0} skills matched
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          2. ANALYTICAL METRICS STRIP (NO REPEATED BOXES)
      ============================================================ */}
      {/* ============================================================
          2. ANALYTICAL METRICS STRIP (NO REPEATED BOXES)
      ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#EAE4DC] dark:divide-[#2F302C] border-b border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2]/60 dark:bg-[#161715]">
        {/* Metric 1: Overall Compatibility Score */}
        <div className="p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#82847E] dark:text-[#72736C]">
                OVERALL COMPATIBILITY
              </span>
              <span className={`text-[11px] font-mono font-semibold ${getScoreColorTone(score)}`}>
                {matchLevel}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2.5">
              <span className={`text-4xl font-bold leading-none ${getScoreColorTone(score)}`}>
                {score}%
              </span>
            </div>
            <div className="w-full bg-[#EAE4DC] dark:bg-[#2A2B27] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#141514] dark:bg-[#F4F2EE] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-[#5C5E58] dark:text-[#9E9F97] mt-3 leading-relaxed">
            Weighted calculation: 75% core required skills + 25% preferred bonus skills.
          </p>
        </div>

        {/* Metric 2: Core Technical Coverage */}
        <div className="p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#82847E] dark:text-[#72736C]">
                CORE TECHNICAL COVERAGE
              </span>
              <span className="text-[11px] font-mono text-[#82847E] dark:text-[#72736C]">
                75% WT
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2.5">
              <span className="text-4xl font-bold text-[#141514] dark:text-[#F4F2EE] leading-none">
                {match?.technicalMatchScore ?? 0}%
              </span>
              <span className="text-xs text-[#5C5E58] dark:text-[#9E9F97] font-mono">
                ({totalReqCount - (match?.missingRequiredSkills.length || 0)}/{totalReqCount} matched)
              </span>
            </div>
            <div className="w-full bg-[#EAE4DC] dark:bg-[#2A2B27] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#141514] dark:bg-[#F4F2EE] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${match?.technicalMatchScore ?? 0}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-[#5C5E58] dark:text-[#9E9F97] mt-3 leading-relaxed">
            {totalReqCount === 0
              ? "No mandatory technical skills detected in JD."
              : (match?.missingRequiredSkills.length || 0) === 0
              ? "All mandatory technical skills verified in candidate resume."
              : `${match?.missingRequiredSkills.length} mandatory skill gap(s) identified.`}
          </p>
        </div>

        {/* Metric 3: Preferred Skills Coverage */}
        <div className="p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#82847E] dark:text-[#72736C]">
                PREFERRED SKILLS COVERAGE
              </span>
              <span className="text-[11px] font-mono text-[#82847E] dark:text-[#72736C]">
                25% WT
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2.5">
              <span className="text-4xl font-bold text-[#141514] dark:text-[#F4F2EE] leading-none">
                {totalPrefCount === 0 ? "N/A" : `${match?.preferredMatchScore ?? 0}%`}
              </span>
              {totalPrefCount > 0 && (
                <span className="text-xs text-[#5C5E58] dark:text-[#9E9F97] font-mono">
                  ({totalPrefCount - (match?.missingPreferredSkills.length || 0)}/{totalPrefCount} matched)
                </span>
              )}
            </div>
            <div className="w-full bg-[#EAE4DC] dark:bg-[#2A2B27] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#82847E] dark:text-[#72736C] h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${totalPrefCount === 0 ? 0 : match?.preferredMatchScore ?? 0}%`,
                }}
              />
            </div>
          </div>
          <p className="text-[11px] text-[#5C5E58] dark:text-[#9E9F97] mt-3 leading-relaxed">
            {totalPrefCount === 0
              ? "No preferred bonus qualifications specified in JD."
              : (match?.missingPreferredSkills.length || 0) === 0
              ? "All preferred bonus skills identified in profile."
              : `${match?.missingPreferredSkills.length} preferred bonus qualification(s) missing.`}
          </p>
        </div>
      </div>

      {/* ============================================================
          3. REQUIREMENT COMPARISON MATRIX (PRIMARY REPORT TABLE)
      ============================================================ */}
      <div className="p-6 md:p-8 border-b border-[#EAE4DC] dark:border-[#2F302C]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#141514] dark:text-[#F4F2EE] tracking-[-0.015em]">
              Requirement Comparison Matrix
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-0.5 font-sans">
              Side-by-side audit of extracted job qualifications versus candidate resume evidence.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search requirements..."
              className="w-full text-xs px-3.5 py-2 rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2]/60 dark:bg-[#161715] text-[#141514] dark:text-[#F4F2EE] placeholder-[#82847E] focus:outline-none focus:border-[#141514] dark:focus:border-[#F4F2EE] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#82847E] hover:text-[#141514] cursor-pointer"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              filter === "all"
                ? "bg-[#111210] text-white dark:bg-[#F4F2EE] dark:text-[#111210] shadow-2xs"
                : "bg-[#FAF7F2] dark:bg-[#161715] border border-[#EAE4DC] dark:border-[#2F302C] text-[#5C5E58] dark:text-[#9E9F97] hover:text-[#141514] dark:hover:text-[#F4F2EE]"
            }`}
          >
            All ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setFilter("matched")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              filter === "matched"
                ? "bg-[#1B663E] text-white shadow-2xs"
                : "bg-[#FAF7F2] dark:bg-[#161715] border border-[#EAE4DC] dark:border-[#2F302C] text-[#5C5E58] dark:text-[#9E9F97] hover:text-[#1B663E]"
            }`}
          >
            Matched ({counts.matched})
          </button>

          <button
            type="button"
            onClick={() => setFilter("missing_required")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              filter === "missing_required"
                ? "bg-[#B83232] text-white shadow-2xs"
                : "bg-[#FAF7F2] dark:bg-[#161715] border border-[#EAE4DC] dark:border-[#2F302C] text-[#5C5E58] dark:text-[#9E9F97] hover:text-[#B83232]"
            }`}
          >
            Missing Required ({counts.missing_required})
          </button>

          <button
            type="button"
            onClick={() => setFilter("missing_preferred")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              filter === "missing_preferred"
                ? "bg-[#9E5510] text-white shadow-2xs"
                : "bg-[#FAF7F2] dark:bg-[#161715] border border-[#EAE4DC] dark:border-[#2F302C] text-[#5C5E58] dark:text-[#9E9F97] hover:text-[#9E5510]"
            }`}
          >
            Missing Preferred ({counts.missing_preferred})
          </button>
        </div>

        {/* Tabular Matrix */}
        {filteredRequirements.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#5C5E58] dark:text-[#9E9F97] border-t border-[#EAE4DC] dark:border-[#2F302C]">
            {allRequirements.length === 0
              ? "No technical requirements were identified in the provided job description."
              : "No requirements match the active filter or search query."}
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#EAE4DC] dark:border-[#2F302C] rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2]/60 dark:bg-[#161715] text-[#5C5E58] dark:text-[#9E9F97] border-b border-[#EAE4DC] dark:border-[#2F302C] font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Requirement / Skill</th>
                  <th className="py-3 px-3 font-semibold w-24">Type</th>
                  <th className="py-3 px-3 font-semibold w-36">Status</th>
                  <th className="py-3 px-4 font-semibold">Extraction Evidence / Audit Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4DC] dark:divide-[#2F302C]">
                {filteredRequirements.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#161715]/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-[#141514] dark:text-[#F4F2EE]">
                      {item.name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] font-mono text-[#5C5E58] dark:text-[#9E9F97]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {item.isMatched ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#1B663E] dark:text-[#35A36A]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1B663E] dark:bg-[#35A36A]" />
                          Matched
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                            item.category === "Required"
                              ? "text-[#B83232] dark:text-[#E55353]"
                              : "text-[#9E5510] dark:text-[#D9822B]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.category === "Required"
                                ? "bg-[#B83232] dark:bg-[#E55353]"
                                : "bg-[#9E5510] dark:bg-[#D9822B]"
                            }`}
                          />
                          Not found in resume
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#5C5E58] dark:text-[#9E9F97]">
                      {item.evidence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================
          4. SKILL SUMMARY BREAKDOWN (CLEAN INLINE MATRIX)
      ============================================================ */}
      <div className="p-6 md:p-8 border-b border-[#EAE4DC] dark:border-[#2F302C] space-y-6">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#141514] dark:text-[#F4F2EE] tracking-[-0.015em]">
            Skill Breakdown Summary
          </h2>
          <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-0.5 font-sans">
            Normalized skill index categorized by alignment status.
          </p>
        </div>

        {/* Matched Skills */}
        <div>
          <span className="text-xs font-semibold text-[#1B663E] dark:text-[#35A36A] flex items-center gap-1.5 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B663E] dark:bg-[#35A36A]" />
            Matched Skills ({match?.matchingSkills.length || 0})
          </span>
          {match?.matchingSkills && match.matchingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {match.matchingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#1B663E]/8 text-[#1B663E] dark:text-[#35A36A] border border-[#1B663E]/20 inline-flex items-center"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#5C5E58] dark:text-[#9E9F97] italic font-sans">
              No direct matching skills identified between candidate resume and job requirements.
            </p>
          )}
        </div>

        {/* Missing Required Skills */}
        <div className="pt-5 border-t border-[#EAE4DC] dark:border-[#2F302C]">
          <span className="text-xs font-semibold text-[#B83232] dark:text-[#E55353] flex items-center gap-1.5 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B83232] dark:bg-[#E55353]" />
            Missing Required Skills ({match?.missingRequiredSkills.length || 0})
          </span>
          {(!jd?.technical_req || jd.technical_req.length === 0) ? (
            <p className="text-xs text-[#5C5E58] dark:text-[#9E9F97] italic font-sans">
              No technical requirements were identified in the job description.
            </p>
          ) : match?.missingRequiredSkills && match.missingRequiredSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {match.missingRequiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#B83232]/8 text-[#B83232] dark:text-[#E55353] border border-[#B83232]/20 inline-flex items-center"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-xs font-medium text-[#1B663E] dark:text-[#35A36A] flex items-center gap-1.5 font-sans">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              All required technical skills detected in candidate resume.
            </div>
          )}
        </div>

        {/* Missing Preferred Skills */}
        {jd?.preferred_skills && jd.preferred_skills.length > 0 && (
          <div className="pt-5 border-t border-[#EAE4DC] dark:border-[#2F302C]">
            <span className="text-xs font-semibold text-[#9E5510] dark:text-[#D9822B] flex items-center gap-1.5 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9E5510] dark:bg-[#D9822B]" />
              Missing Preferred Skills ({match?.missingPreferredSkills.length || 0})
            </span>
            {match?.missingPreferredSkills && match.missingPreferredSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {match.missingPreferredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#9E5510]/8 text-[#9E5510] dark:text-[#D9822B] border border-[#9E5510]/20 inline-flex items-center"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs font-medium text-[#1B663E] dark:text-[#35A36A] flex items-center gap-1.5 font-sans">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                All preferred bonus skills detected in candidate resume.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================
          5. EXPERIENCE & ACADEMIC CONTEXT (EDITORIAL NOTES)
      ============================================================ */}
      <div className="p-6 md:p-8 border-b border-[#EAE4DC] dark:border-[#2F302C]">
        <div className="mb-5">
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#141514] dark:text-[#F4F2EE] tracking-[-0.015em]">
            Experience & Academic Context
          </h2>
          <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-0.5 font-sans">
            Role prerequisites and responsibilities parsed from the job description.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          {/* Education Prerequisites */}
          <div className="space-y-2.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block">
              ACADEMIC PREREQUISITES (FROM JD)
            </span>
            {jd?.education && jd.education.length > 0 ? (
              <ul className="text-xs text-[#141514] dark:text-[#F4F2EE] space-y-1.5 list-disc list-inside">
                {jd.education.map((edu, i) => (
                  <li key={i}>{edu}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#5C5E58] dark:text-[#9E9F97] italic font-sans">
                No explicit academic degree requirements detected in JD text.
              </p>
            )}
            <p className="text-[11px] text-[#82847E] dark:text-[#72736C] pt-1">
              Note: Candidate degree extraction is not evaluated in current rule-based scoring.
            </p>
          </div>

          {/* Key Role Responsibilities */}
          <div className="space-y-2.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block">
              ROLE RESPONSIBILITIES (FROM JD)
            </span>
            {jd?.responsibilities && jd.responsibilities.length > 0 ? (
              <ul className="text-xs text-[#141514] dark:text-[#F4F2EE] space-y-1.5 list-disc list-inside max-h-36 overflow-y-auto pr-1">
                {jd.responsibilities.slice(0, 5).map((resp, i) => (
                  <li key={i} className="line-clamp-2">
                    {resp}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#5C5E58] dark:text-[#9E9F97] italic font-sans">
                No explicit responsibilities section parsed from JD.
              </p>
            )}
            <p className="text-[11px] text-[#82847E] dark:text-[#72736C] pt-1">
              Use these responsibilities to align project bullet points with target deliverables.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================
          6. PRIORITIZED ACTIONABLE RECOMMENDATIONS
      ============================================================ */}
      <div className="p-6 md:p-8 border-b border-[#EAE4DC] dark:border-[#2F302C]">
        <div className="mb-5">
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#141514] dark:text-[#F4F2EE] tracking-[-0.015em]">
            Actionable Optimization Guidance
          </h2>
          <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-0.5 font-sans">
            Prioritized adjustments to reflect existing competency in resume project bullets.
          </p>
        </div>

        <div className="divide-y divide-[#EAE4DC] dark:divide-[#2F302C] border-y border-[#EAE4DC] dark:border-[#2F302C]">
          {match?.recommendations && match.recommendations.length > 0 ? (
            match.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="py-3.5 flex items-start gap-4 text-xs md:text-sm text-[#141514] dark:text-[#F4F2EE]"
              >
                <span className="text-xs font-mono font-semibold text-[#141514] dark:text-[#F4F2EE] shrink-0 mt-0.5">
                  0{idx + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
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
          7. REPORT FOOTER
      ============================================================ */}
      <div className="p-5 md:p-6 bg-[#FAF7F2]/60 dark:bg-[#161715] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <span className="text-[11px] text-[#82847E] dark:text-[#72736C] font-mono">
          Evaluated locally via MatchEngine &bull; Zero data retained
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyReport}
            className="px-4 py-2 font-semibold rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-white dark:bg-[#1B1C1A] hover:bg-[#FAF7F2] text-[#141514] dark:text-[#F4F2EE] transition-colors cursor-pointer shadow-2xs"
          >
            {copied ? "Report Copied" : "Copy Plain-Text"}
          </button>

          <button
            type="button"
            onClick={onCompareAgain}
            className="px-5 py-2 font-semibold rounded-full bg-[#111210] hover:bg-neutral-800 dark:bg-[#F4F2EE] dark:text-[#111210] dark:hover:bg-white text-white transition-all cursor-pointer shadow-xs"
          >
            New Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
