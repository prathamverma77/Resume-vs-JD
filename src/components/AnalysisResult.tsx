"use client";

import React, { useState, useMemo } from "react";
import { AnalyzeApiResponse } from "@/types/analysis";
import { normalizeSkill } from "@/lib/skills/normalizer";
import { getSkillWeight } from "@/lib/scoring/score-engine";

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
  weightTier: string;
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

  // Build unified, structured requirements list with weight tiers
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
        const weight = getSkillWeight(req);
        const weightTier =
          weight === 3.0
            ? "Tier 1: Core Language/Cloud"
            : weight === 1.0
            ? "Tier 3: Auxiliary Tool"
            : "Tier 2: Framework/DB";

        items.push({
          id: `req-${req}`,
          name: req,
          category: "Required",
          status: isMatched ? "Matched" : "Not found in resume",
          isMatched,
          evidence: isMatched
            ? "Identified in candidate skills and experience"
            : "No direct mention identified in resume text",
          weightTier,
        });
      }
    }

    // 2. Preferred Skills
    if (jd?.preferred_skills) {
      for (const pref of jd.preferred_skills) {
        const norm = normalizeSkill(pref);
        const isMatched = matchedNormalized.has(norm);
        const weight = getSkillWeight(pref);
        const weightTier =
          weight === 3.0
            ? "Tier 1: Core Language/Cloud"
            : weight === 1.0
            ? "Tier 3: Auxiliary Tool"
            : "Tier 2: Framework/DB";

        items.push({
          id: `pref-${pref}`,
          name: pref,
          category: "Preferred",
          status: isMatched ? "Matched" : "Not found in resume",
          isMatched,
          evidence: isMatched
            ? "Identified in candidate skills and experience"
            : "Optional preference not detected in resume text",
          weightTier,
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
      if (filter === "matched" && !item.isMatched) return false;
      if (filter === "missing_required" && (item.isMatched || item.category !== "Required")) return false;
      if (filter === "missing_preferred" && (item.isMatched || item.category !== "Preferred")) return false;

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

  // SVG Gauge calculations (radius = 58, circumference ≈ 364.4)
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (score / 100) * circumference;

  const getScoreTheme = (val: number) => {
    if (val >= 75) {
      return {
        stroke: "#10B981",
        strokeGradStart: "#10B981",
        strokeGradEnd: "#059669",
        textColor: "text-emerald-700 dark:text-emerald-400",
        bgLight: "bg-emerald-500/10 dark:bg-emerald-500/15",
        badgeBorder: "border-emerald-500/30",
        badgeText: "text-emerald-800 dark:text-emerald-300",
      };
    }
    if (val >= 50) {
      return {
        stroke: "#3B82F6",
        strokeGradStart: "#3B82F6",
        strokeGradEnd: "#1D4ED8",
        textColor: "text-blue-700 dark:text-blue-400",
        bgLight: "bg-blue-500/10 dark:bg-blue-500/15",
        badgeBorder: "border-blue-500/30",
        badgeText: "text-blue-800 dark:text-blue-300",
      };
    }
    if (val >= 35) {
      return {
        stroke: "#F59E0B",
        strokeGradStart: "#F59E0B",
        strokeGradEnd: "#D97706",
        textColor: "text-amber-700 dark:text-amber-400",
        bgLight: "bg-amber-500/10 dark:bg-amber-500/15",
        badgeBorder: "border-amber-500/30",
        badgeText: "text-amber-800 dark:text-amber-300",
      };
    }
    return {
      stroke: "#EF4444",
      strokeGradStart: "#EF4444",
      strokeGradEnd: "#B91C1C",
      textColor: "text-rose-700 dark:text-rose-400",
      bgLight: "bg-rose-500/10 dark:bg-rose-500/15",
      badgeBorder: "border-rose-500/30",
      badgeText: "text-rose-800 dark:text-rose-300",
    };
  };

  const theme = getScoreTheme(score);

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
      `Candidate Exp:     ${resume.structuredData.yearsOfExperience ? `${resume.structuredData.yearsOfExperience} years` : "Not explicitly detected"}`,
      `JD Required Exp:   ${jd?.minYearsExperience ? `${jd.minYearsExperience}+ years` : "Not specified"}`,
      `Overall Score:     ${score}% (${matchLevel})`,
      `Core Technical:    ${match.technicalMatchScore}% (75% weight)`,
      `Preferred Skills:  ${jd?.preferred_skills?.length === 0 ? "N/A" : `${match.preferredMatchScore}% (25% weight)`}`,
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
      "Generated in-memory via MatchEngine ATS Audit",
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
    <div className="w-full bg-white/95 dark:bg-[#181917]/95 border border-[#EAE4DC] dark:border-[#2F302C] rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden text-[#141514] dark:text-[#F4F2EE] backdrop-blur-md transition-all">
      {/* ============================================================
          1. REPORT DOCUMENT HEADER
      ============================================================ */}
      <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[#EAE4DC] dark:border-[#2F302C]">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-[#141514]/5 dark:bg-white/10 text-[#5C5E58] dark:text-[#A8A9A2] border border-[#EAE4DC] dark:border-[#2F302C]">
                ATS Compatibility Audit
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#5C5E58] dark:text-[#A8A9A2] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                100% In-Memory &bull; Zero Cloud Retention
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-[-0.025em] text-[#141514] dark:text-[#F4F2EE] leading-tight">
              {jd?.role && jd.role !== "Role not specified" && jd.role !== "Not specified"
                ? jd.role
                : "Target Role Compatibility Report"}
            </h1>

            <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-2 font-sans leading-relaxed">
              Deterministic parsing and 3-tier weighted evaluation of candidate skills, qualifications, and seniority.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyReport}
              className="px-4 py-2.5 text-xs font-semibold rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2] hover:bg-[#F3ECE4] dark:bg-[#222320] dark:hover:bg-[#2A2B27] text-[#141514] dark:text-[#F4F2EE] transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>Report Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-[#5C5E58] dark:text-[#9E9F97]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span>Copy Report</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 text-xs font-semibold rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2] hover:bg-[#F3ECE4] dark:bg-[#222320] dark:hover:bg-[#2A2B27] text-[#141514] dark:text-[#F4F2EE] transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <svg className="w-4 h-4 text-[#5C5E58] dark:text-[#9E9F97]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.076-.672-2.03-1.28-2.829H4.5A2.25 2.25 0 002.25 13.25v4.5A2.25 2.25 0 004.5 20h15a2.25 2.25 0 002.25-2.25v-4.5A2.25 2.25 0 0019.5 11H18.56a8.887 8.887 0 01-1.28 2.829M12 15V3m0 0l3 3m-3-3L9 6" />
              </svg>
              <span>Export PDF</span>
            </button>

            <button
              type="button"
              onClick={onCompareAgain}
              className="px-5 py-2.5 text-xs font-semibold rounded-full bg-[#141514] hover:bg-neutral-800 dark:bg-[#F4F2EE] dark:text-[#141514] dark:hover:bg-white text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>Analyze Another</span>
            </button>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-6 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/60 dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block mb-1">
              Candidate Resume
            </span>
            <span className="font-semibold text-[#141514] dark:text-[#F4F2EE] truncate block" title={resume.fileInfo.name}>
              {resume.fileInfo.name}
            </span>
            <span className="text-[11px] text-[#5C5E58] dark:text-[#9E9F97] font-mono mt-0.5 block">
              {formatFileSize(resume.fileInfo.size)} &bull; {resume.pageCount} page(s)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/60 dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block mb-1">
              Contact Verified
            </span>
            <span className="font-semibold text-[#141514] dark:text-[#F4F2EE] truncate block" title={resume.structuredData.email || "None"}>
              {resume.structuredData.email || "No email parsed"}
            </span>
            <span className="text-[11px] text-[#5C5E58] dark:text-[#9E9F97] font-mono mt-0.5 block">
              {resume.structuredData.phone || "No phone detected"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/60 dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block mb-1">
              Seniority & Tenure
            </span>
            <span className="font-semibold text-[#141514] dark:text-[#F4F2EE] block">
              {resume.structuredData.yearsOfExperience
                ? `${resume.structuredData.yearsOfExperience}+ Years Experience`
                : "Timeline not specified"}
            </span>
            <span className="text-[11px] text-[#5C5E58] dark:text-[#9E9F97] font-mono mt-0.5 block">
              {jd?.minYearsExperience ? `Job requests ${jd.minYearsExperience}+ yrs` : "No JD minimum specified"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/60 dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block mb-1">
              Skill Alignment
            </span>
            <span className={`font-semibold block ${theme.textColor}`}>
              {match?.matchingSkills.length || 0} Skills Matched
            </span>
            <span className="text-[11px] text-[#5C5E58] dark:text-[#9E9F97] font-mono mt-0.5 block">
              {totalReqCount} Required &bull; {totalPrefCount} Preferred
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          2. ANALYTICAL SHOWCASE (CIRCULAR GAUGE + METRIC CARDS)
      ============================================================ */}
      <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2]/30 dark:bg-[#161715]/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Radial SVG Circular Score Gauge (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] shadow-xs text-center">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#82847E] dark:text-[#72736C] mb-4">
              Overall Compatibility Score
            </span>

            {/* Circular Gauge */}
            <div className="relative w-44 h-44 flex items-center justify-center mb-4">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                {/* Background Track */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-[#EAE4DC] dark:stroke-[#2A2B27]"
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
                <span className="text-4xl sm:text-5xl font-bold font-sans tracking-tight text-[#141514] dark:text-[#F4F2EE]">
                  {score}%
                </span>
                <span className={`text-[11px] font-semibold mt-1 px-2.5 py-0.5 rounded-full border ${theme.bgLight} ${theme.badgeBorder} ${theme.badgeText}`}>
                  {matchLevel}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#5C5E58] dark:text-[#9E9F97] max-w-xs leading-relaxed font-sans">
              Weighted calculation: 75% core required technical skills + 25% preferred bonus qualifications.
            </p>
          </div>

          {/* 3 Metric Cards Grid (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Metric 1: Core Technical Coverage */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5C5E58] dark:text-[#9E9F97]">
                    Core Technical Coverage (75% Weight)
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {match?.technicalMatchScore ?? 0}%
                </span>
              </div>

              <div className="w-full bg-[#EAE4DC] dark:bg-[#2A2B27] rounded-full h-2 overflow-hidden mb-2">
                <div
                  className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${match?.technicalMatchScore ?? 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#5C5E58] dark:text-[#9E9F97]">
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

            {/* Metric 2: Preferred Skills Coverage */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5C5E58] dark:text-[#9E9F97]">
                    Preferred Qualifications (25% Weight)
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                  {totalPrefCount === 0 ? "N/A" : `${match?.preferredMatchScore ?? 0}%`}
                </span>
              </div>

              <div className="w-full bg-[#EAE4DC] dark:bg-[#2A2B27] rounded-full h-2 overflow-hidden mb-2">
                <div
                  className="bg-amber-500 dark:bg-amber-400 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${totalPrefCount === 0 ? 0 : match?.preferredMatchScore ?? 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#5C5E58] dark:text-[#9E9F97]">
                <span>
                  {totalPrefCount === 0
                    ? "No bonus qualifications listed in job description."
                    : (match?.missingPreferredSkills.length || 0) === 0
                    ? "All bonus qualifications detected in resume."
                    : `${match?.missingPreferredSkills.length} bonus qualification gap(s).`}
                </span>
                {totalPrefCount > 0 && (
                  <span className="font-mono font-medium">
                    {totalPrefCount - (match?.missingPreferredSkills.length || 0)} / {totalPrefCount} matched
                  </span>
                )}
              </div>
            </div>

            {/* Metric 3: Seniority & Experience Alignment */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5C5E58] dark:text-[#9E9F97] block mb-1">
                  Seniority Alignment
                </span>
                <span className="text-sm font-semibold text-[#141514] dark:text-[#F4F2EE] block">
                  {match?.seniorityMatch?.isMet
                    ? "Candidate Meets Experience Prerequisites"
                    : resume.structuredData.yearsOfExperience && jd?.minYearsExperience
                    ? `Experience Gap: ${resume.structuredData.yearsOfExperience} yrs vs ${jd.minYearsExperience}+ yrs requested`
                    : "Experience timeline evaluated without formal penalty"}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                match?.seniorityMatch?.isMet || !jd?.minYearsExperience
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
              }`}>
                {match?.seniorityMatch?.isMet || !jd?.minYearsExperience ? "Aligned" : "Review Required"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          3. REQUIREMENT COMPARISON MATRIX (PRIMARY REPORT TABLE)
      ============================================================ */}
      <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C]">
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
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter qualifications..."
              className="w-full text-xs px-4 py-2.5 rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2]/60 dark:bg-[#1E1F1D] text-[#141514] dark:text-[#F4F2EE] placeholder-[#82847E] focus:outline-none focus:border-[#141514] dark:focus:border-[#F4F2EE] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#82847E] hover:text-[#141514] cursor-pointer"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setFilter("all")}
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
            onClick={() => setFilter("matched")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === "matched"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-[#FAF7F2] dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C] text-[#5C5E58] dark:text-[#9E9F97] hover:text-emerald-600"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Matched ({counts.matched})
          </button>

          <button
            type="button"
            onClick={() => setFilter("missing_required")}
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
            onClick={() => setFilter("missing_preferred")}
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
        {filteredRequirements.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#5C5E58] dark:text-[#9E9F97] rounded-2xl border border-dashed border-[#EAE4DC] dark:border-[#2F302C]">
            {allRequirements.length === 0
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
                {filteredRequirements.map((item) => (
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
                      {item.isMatched ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          Matched
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
          4. SKILL BREAKDOWN SUMMARY
      ============================================================ */}
      <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] space-y-6">
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
            Verified Matching Skills ({match?.matchingSkills.length || 0})
          </span>
          {match?.matchingSkills && match.matchingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {match.matchingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
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
        <div className="pt-6 border-t border-[#EAE4DC] dark:border-[#2F302C]">
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Missing Mandatory Skills ({match?.missingRequiredSkills.length || 0})
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
        {jd?.preferred_skills && jd.preferred_skills.length > 0 && (
          <div className="pt-6 border-t border-[#EAE4DC] dark:border-[#2F302C]">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Missing Preferred Bonus Skills ({match?.missingPreferredSkills.length || 0})
            </span>
            {match?.missingPreferredSkills && match.missingPreferredSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {match.missingPreferredSkills.map((skill, idx) => (
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

      {/* ============================================================
          5. PRIORITIZED ACTIONABLE OPTIMIZATION
      ============================================================ */}
      <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C]">
        <div className="mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#141514] dark:text-[#F4F2EE] tracking-[-0.015em]">
            Prioritized Optimization Guidance
          </h2>
          <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-1 font-sans">
            Actionable adjustments to maximize ATS pass-through and interviewer impression.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {match?.recommendations && match.recommendations.length > 0 ? (
            match.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2]/60 dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C] flex items-start gap-4 text-xs sm:text-sm text-[#141514] dark:text-[#F4F2EE] shadow-2xs"
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
      <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C]">
        <div className="mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#141514] dark:text-[#F4F2EE] tracking-[-0.015em]">
            Target Role Deliverables & Prerequisites
          </h2>
          <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-1 font-sans">
            Key responsibilities and qualifications parsed from the employer&apos;s job description.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Key Role Responsibilities */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2]/40 dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block mb-3 font-semibold">
              CORE RESPONSIBILITIES (FROM JD)
            </span>
            {jd?.responsibilities && jd.responsibilities.length > 0 ? (
              <ul className="text-xs text-[#141514] dark:text-[#F4F2EE] space-y-2.5 max-h-56 overflow-y-auto pr-2">
                {jd.responsibilities.map((resp, i) => (
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
            <p className="text-[11px] text-[#82847E] dark:text-[#72736C] pt-3 border-t border-[#EAE4DC] dark:border-[#2F302C] mt-3">
              Use these duties to align your past project accomplishments with employer expectations.
            </p>
          </div>

          {/* Education Prerequisites */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2]/40 dark:bg-[#1E1F1D] border border-[#EAE4DC] dark:border-[#2F302C]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#82847E] dark:text-[#72736C] block mb-3 font-semibold">
              ACADEMIC PREREQUISITES (FROM JD)
            </span>
            {jd?.education && jd.education.length > 0 ? (
              <ul className="text-xs text-[#141514] dark:text-[#F4F2EE] space-y-2">
                {jd.education.map((edu, i) => (
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
            <p className="text-[11px] text-[#82847E] dark:text-[#72736C] pt-3 border-t border-[#EAE4DC] dark:border-[#2F302C] mt-3">
              Most engineering roles accept equivalent practical industry experience in lieu of formal degrees.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================
          7. REPORT FOOTER
      ============================================================ */}
      <div className="p-6 bg-[#FAF7F2]/80 dark:bg-[#161715] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <span className="text-[11px] text-[#82847E] dark:text-[#72736C] font-mono">
          Evaluated locally &bull; Zero document retention &bull; MatchEngine v2.4
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyReport}
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
    </div>
  );
}
