"use client";

import React, { useState, useMemo } from "react";
import { AnalyzeApiResponse, ScoreAnalysisResult, StructuredResume } from "@/types/analysis";
import { normalizeSkill } from "@/lib/skills/normalizer";
import { getSkillWeight, calculateScore } from "@/lib/scoring/score-engine";

interface AnalysisResultProps {
  data: AnalyzeApiResponse;
  onCompareAgain: () => void;
}

type RequirementFilter = "all" | "matched" | "missing_required" | "missing_preferred" | "simulated";

interface RequirementItem {
  id: string;
  name: string;
  category: "Required" | "Preferred";
  status: "Matched" | "Adjacent Match" | "Not found in resume" | "Simulated Match";
  isMatched: boolean;
  isAdjacent?: boolean;
  isSimulated?: boolean;
  evidence: string;
  evidenceQuote?: string;
  isProductionDepth?: boolean;
  weightTier: string;
}

export default function AnalysisResult({
  data,
  onCompareAgain,
}: AnalysisResultProps) {
  const [filter, setFilter] = useState<RequirementFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [simulatedSkills, setSimulatedSkills] = useState<string[]>([]);

  const baselineMatch = data.matchAnalysis;
  const resume = data.resume;
  const jd = data.jobDescription.parsedData;
  const baselineScore = baselineMatch?.overallScore ?? 0;

  const baseResume = resume.structuredData;
  const baseRawText = baseResume.rawText || resume.extractedText || "";

  // Dynamic simulated resume with simulated competencies injected
  const simulatedResume: StructuredResume = useMemo(() => {
    if (simulatedSkills.length === 0) return baseResume;
    const combined = new Set([...(baseResume.skills || []), ...simulatedSkills]);
    return {
      ...baseResume,
      skills: Array.from(combined),
      rawText: `${baseRawText}\nSimulated Verified Competencies: ${simulatedSkills.join(", ")}.`,
    };
  }, [baseResume, baseRawText, simulatedSkills]);

  // Recalculated active match analysis in-memory (<1ms client-side)
  const activeMatch: ScoreAnalysisResult | null = useMemo(() => {
    if (!jd) return baselineMatch;
    if (simulatedSkills.length === 0) return baselineMatch;
    return calculateScore(simulatedResume, jd);
  }, [jd, baselineMatch, simulatedSkills.length, simulatedResume]);

  const match = activeMatch;
  const score = match?.overallScore ?? 0;
  const scoreDelta = score - baselineScore;
  const isSimulating = simulatedSkills.length > 0;
  const matchLevel = match?.matchLevel || "Analysis Complete";

  // Pre-calculate marginal ROI score boost for every missing skill
  const missingSkillsWithImpact = useMemo(() => {
    if (!jd || !baselineMatch) return [];

    const missingReq = baselineMatch.missingRequiredSkills || [];
    const missingPref = baselineMatch.missingPreferredSkills || [];

    const allMissing: { name: string; category: "Required" | "Preferred" }[] = [
      ...missingReq.map((s) => ({ name: s, category: "Required" as const })),
      ...missingPref.map((s) => ({ name: s, category: "Preferred" as const })),
    ];

    const seen = new Set<string>();
    const uniqueMissing: { name: string; category: "Required" | "Preferred" }[] = [];
    for (const item of allMissing) {
      const norm = normalizeSkill(item.name);
      if (!seen.has(norm)) {
        seen.add(norm);
        uniqueMissing.push(item);
      }
    }

    return uniqueMissing.map((item) => {
      const testResume: StructuredResume = {
        ...baseResume,
        skills: [...(baseResume.skills || []), item.name],
        rawText: `${baseRawText}\n${item.name}`,
      };
      const testResult = calculateScore(testResume, jd);
      const boost = Math.max(0, testResult.overallScore - baselineScore);
      const weight = getSkillWeight(item.name);
      const weightTier =
        weight === 3.0
          ? "Tier 1: Core"
          : weight === 1.0
          ? "Tier 3: Tool"
          : "Tier 2: Framework";

      return {
        name: item.name,
        category: item.category,
        boost,
        weight,
        weightTier,
      };
    }).sort((a, b) => b.boost - a.boost || b.weight - a.weight);
  }, [baseResume, baseRawText, jd, baselineMatch, baselineScore]);

  // Skill simulator toggle handlers
  const toggleSimulateSkill = (skill: string) => {
    setSimulatedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const resetSimulation = () => {
    setSimulatedSkills([]);
  };

  const simulateAllMissing = () => {
    setSimulatedSkills(missingSkillsWithImpact.map((s) => s.name));
  };

  // Build unified, structured requirements list with weight tiers
  const allRequirements: RequirementItem[] = useMemo(() => {
    const items: RequirementItem[] = [];
    const matchedNormalized = new Set(
      (match?.matchingSkills || []).map((s) => normalizeSkill(s))
    );
    const simulatedNormSet = new Set(simulatedSkills.map((s) => normalizeSkill(s)));

    const adjacentMap = new Map<string, { candidateSkill: string; family: string }>();
    for (const adj of match?.adjacentMatches || []) {
      adjacentMap.set(normalizeSkill(adj.requiredSkill), {
        candidateSkill: adj.matchedCandidateSkill,
        family: adj.family,
      });
    }

    const evidenceMap = new Map<string, { quote?: string; isProduction: boolean }>();
    for (const ev of match?.evidenceDetails || []) {
      evidenceMap.set(normalizeSkill(ev.skill), {
        quote: ev.evidenceQuote,
        isProduction: ev.isProductionDepth,
      });
    }

    // 1. Required Technical Skills
    if (jd?.technical_req) {
      for (const req of jd.technical_req) {
        const norm = normalizeSkill(req);
        const isSimulated = simulatedNormSet.has(norm);
        const isMatched = matchedNormalized.has(norm);
        const adjacent = adjacentMap.get(norm);
        const evidenceDetail = evidenceMap.get(norm);
        const weight = getSkillWeight(req);
        const weightTier =
          weight === 3.0
            ? "Tier 1: Core Language/Cloud"
            : weight === 1.0
            ? "Tier 3: Auxiliary Tool"
            : "Tier 2: Framework/DB";

        let status: "Matched" | "Adjacent Match" | "Not found in resume" | "Simulated Match" = "Not found in resume";
        let evidence = "Searched resume text; no direct or adjacent mention detected";

        if (isSimulated) {
          status = "Simulated Match";
          evidence = "Live Simulator: Candidate simulated acquiring this competency";
        } else if (isMatched) {
          status = "Matched";
          evidence = evidenceDetail?.isProduction
            ? "Demonstrated with production scale & quantifiable impact"
            : "Identified in candidate skills and experience";
        } else if (adjacent) {
          status = "Adjacent Match";
          evidence = `Transferable Sibling: Candidate possesses ${adjacent.candidateSkill} (${adjacent.family})`;
        }

        items.push({
          id: `req-${req}`,
          name: req,
          category: "Required",
          status,
          isMatched,
          isAdjacent: !isMatched && adjacent !== undefined,
          isSimulated,
          evidence,
          evidenceQuote: isSimulated ? undefined : evidenceDetail?.quote,
          isProductionDepth: isSimulated ? false : evidenceDetail?.isProduction,
          weightTier,
        });
      }
    }

    // 2. Preferred Skills
    if (jd?.preferred_skills) {
      for (const pref of jd.preferred_skills) {
        const norm = normalizeSkill(pref);
        const isSimulated = simulatedNormSet.has(norm);
        const isMatched = matchedNormalized.has(norm);
        const adjacent = adjacentMap.get(norm);
        const evidenceDetail = evidenceMap.get(norm);
        const weight = getSkillWeight(pref);
        const weightTier =
          weight === 3.0
            ? "Tier 1: Core Language/Cloud"
            : weight === 1.0
            ? "Tier 3: Auxiliary Tool"
            : "Tier 2: Framework/DB";

        let status: "Matched" | "Adjacent Match" | "Not found in resume" | "Simulated Match" = "Not found in resume";
        let evidence = "Optional preference not detected in resume text";

        if (isSimulated) {
          status = "Simulated Match";
          evidence = "Live Simulator: Candidate simulated acquiring this bonus qualification";
        } else if (isMatched) {
          status = "Matched";
          evidence = evidenceDetail?.isProduction
            ? "Demonstrated with production scale & quantifiable impact"
            : "Identified in candidate skills and experience";
        } else if (adjacent) {
          status = "Adjacent Match";
          evidence = `Transferable Preferred: Candidate possesses ${adjacent.candidateSkill} (${adjacent.family})`;
        }

        items.push({
          id: `pref-${pref}`,
          name: pref,
          category: "Preferred",
          status,
          isMatched,
          isAdjacent: !isMatched && adjacent !== undefined,
          isSimulated,
          evidence,
          evidenceQuote: isSimulated ? undefined : evidenceDetail?.quote,
          isProductionDepth: isSimulated ? false : evidenceDetail?.isProduction,
          weightTier,
        });
      }
    }

    return items;
  }, [jd, match, simulatedSkills]);

  // Counts for filters
  const counts = useMemo(() => {
    const matched = allRequirements.filter((r) => r.isMatched || r.isAdjacent).length;
    const missingReq = allRequirements.filter(
      (r) => !r.isMatched && !r.isAdjacent && r.category === "Required"
    ).length;
    const missingPref = allRequirements.filter(
      (r) => !r.isMatched && !r.isAdjacent && r.category === "Preferred"
    ).length;
    const simulated = allRequirements.filter((r) => r.isSimulated).length;
    return {
      all: allRequirements.length,
      matched,
      missing_required: missingReq,
      missing_preferred: missingPref,
      simulated,
    };
  }, [allRequirements]);

  // Filtered requirements
  const filteredRequirements = useMemo(() => {
    return allRequirements.filter((item) => {
      if (filter === "matched" && !item.isMatched && !item.isAdjacent) return false;
      if (filter === "missing_required" && (item.isMatched || item.isAdjacent || item.category !== "Required")) return false;
      if (filter === "missing_preferred" && (item.isMatched || item.isAdjacent || item.category !== "Preferred")) return false;
      if (filter === "simulated" && !item.isSimulated) return false;

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
      ...(isSimulating
        ? [
            `*** LIVE WHAT-IF SIMULATION ACTIVE ***`,
            `Baseline Score:    ${baselineScore}% -> Simulated Score: ${score}% (Delta: ▲ +${scoreDelta}%)`,
            `Simulated Skills:  ${simulatedSkills.join(", ")}`,
          ]
        : []),
      `Core Technical:    ${match.technicalMatchScore}% (${match.scoringBreakdown?.coreWeight ?? 70}% weight)`,
      `Preferred Skills:  ${match.scoringBreakdown?.isPreferredRedistributed ? "N/A (Redistributed)" : `${match.preferredMatchScore}% (${match.scoringBreakdown?.preferredWeight ?? 15}% weight)`}`,
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
    <div className="w-full bg-white/95 dark:bg-[#181917]/95 border border-[#EAE4DC] dark:border-[#2F302C] rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden text-[#141514] dark:text-[#F4F2EE] backdrop-blur-md transition-all print:border-none print:shadow-none print:rounded-none print:bg-white print:text-black">
      {/* ============================================================
          1. REPORT DOCUMENT HEADER
      ============================================================ */}
      <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] print:p-0 print:pb-6">
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

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 print:hidden">
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
      <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2]/30 dark:bg-[#161715]/40 print:bg-white print-avoid-break">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Radial SVG Circular Score Gauge (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] shadow-xs text-center">
            <div className="flex items-center gap-2 mb-4">
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
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Gate Cap Alert Banner or Gate Lifted Banner */}
            {baselineMatch?.scoringBreakdown?.dealbreakerCapApplied && !match?.scoringBreakdown?.dealbreakerCapApplied ? (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-3 shadow-xs">
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
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-3">
                <span className="text-base">⚠️</span>
                <div>
                  <span className="font-bold block">Dealbreaker Gate Enforced</span>
                  <span>{match?.scoringBreakdown?.capReason || "Missing primary required language; overall score capped at 55%."}</span>
                </div>
              </div>
            ) : null}

            {/* Metric 1: Core Technical Coverage */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] shadow-2xs">
              <div className="flex items-center justify-between mb-2">
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
              <div className="w-full bg-[#EAE4DC] dark:bg-[#2A2B27] rounded-full h-2.5 overflow-hidden mb-2 relative flex">
                <div
                  className="bg-emerald-600 dark:bg-emerald-500 h-2.5 rounded-l-full transition-all duration-500 shrink-0"
                  style={{ width: `${Math.min(100, baselineMatch?.technicalMatchScore ?? 0)}%` }}
                  title={`Baseline: ${baselineMatch?.technicalMatchScore ?? 0}%`}
                />
                {isSimulating && (match?.technicalMatchScore ?? 0) > (baselineMatch?.technicalMatchScore ?? 0) && (
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-teal-400 h-2.5 rounded-r-full transition-all duration-500 animate-pulse"
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

            {/* Metric 2: Preferred Skills Coverage (with N/A redistribution support) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] shadow-2xs">
              <div className="flex items-center justify-between mb-2">
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
              <div className="w-full bg-[#EAE4DC] dark:bg-[#2A2B27] rounded-full h-2.5 overflow-hidden mb-2 relative flex">
                <div
                  className="bg-amber-500 dark:bg-amber-400 h-2.5 rounded-l-full transition-all duration-500 shrink-0"
                  style={{
                    width: `${match?.scoringBreakdown?.isPreferredRedistributed ? 100 : Math.min(100, baselineMatch?.preferredMatchScore ?? 0)}%`,
                  }}
                  title={`Baseline: ${baselineMatch?.preferredMatchScore ?? 0}%`}
                />
                {isSimulating && !match?.scoringBreakdown?.isPreferredRedistributed && (match?.preferredMatchScore ?? 0) > (baselineMatch?.preferredMatchScore ?? 0) && (
                  <div
                    className="bg-gradient-to-r from-amber-400 to-yellow-300 h-2.5 rounded-r-full transition-all duration-500 animate-pulse"
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

              <div className="flex items-center justify-between text-xs text-[#5C5E58] dark:text-[#9E9F97]">
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
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#5C5E58] dark:text-[#9E9F97] block mb-1">
                  Seniority & Tenure Alignment
                </span>
                <span className="text-sm font-semibold text-[#141514] dark:text-[#F4F2EE] block">
                  {match?.seniorityMatch?.statusNote ||
                    (match?.seniorityMatch?.isMet
                      ? "Candidate Meets Experience Prerequisites"
                      : resume.structuredData.yearsOfExperience && jd?.minYearsExperience
                      ? `Experience: ${resume.structuredData.yearsOfExperience} yrs vs ${jd.minYearsExperience}+ yrs requested`
                      : "Experience timeline evaluated without formal penalty")}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                match?.seniorityMatch?.tenureBand === "Aligned" || !jd?.minYearsExperience
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                  : match?.seniorityMatch?.tenureBand === "Borderline"
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
              }`}>
                {match?.seniorityMatch?.tenureBand || (match?.seniorityMatch?.isMet ? "Aligned" : "Review")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          2.2 LIVE "WHAT-IF" SKILL SIMULATOR (DYNAMIC RE-CALCULATOR)
      ============================================================ */}
      <div className={`p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] bg-gradient-to-b from-white via-[#FAF7F2]/50 to-white dark:from-[#181917] dark:via-[#161715] dark:to-[#181917] transition-all print:bg-white print-avoid-break ${isSimulating ? "" : "print:hidden"}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#EAE4DC] dark:border-[#2F302C]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span className="text-[10px] font-mono font-semibold tracking-wider uppercase text-cyan-600 dark:text-cyan-400">
                Deterministic Recalculation Engine (&lt;1ms)
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#141514] dark:text-[#F4F2EE] tracking-[-0.015em] flex items-center gap-2.5">
              <span>Live &ldquo;What-If&rdquo; Skill Simulator</span>
              {isSimulating && (
                <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30">
                  Active
                </span>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#9E9F97] mt-1 font-sans">
              Click missing qualifications below to dynamically simulate score lift and see the exact marginal ROI of acquiring each skill.
            </p>
          </div>

          {/* Simulator Control Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 print:hidden">
            {isSimulating ? (
              <>
                <div className="px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 flex items-center gap-2 shadow-2xs">
                  <span>{simulatedSkills.length} Simulated</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    ▲ +{scoreDelta}% Lift
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-white dark:bg-[#222320] text-[#141514] dark:text-[#F4F2EE] hover:bg-[#FAF7F2] dark:hover:bg-[#2A2B27] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
                >
                  <svg className="w-3.5 h-3.5 text-[#82847E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>Reset Simulation</span>
                </button>
              </>
            ) : (
              missingSkillsWithImpact.length >= 3 && (
                <button
                  type="button"
                  onClick={() => {
                    const topThree = missingSkillsWithImpact.slice(0, 3).map((s) => s.name);
                    setSimulatedSkills(topThree);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
                >
                  <svg className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  <span>Simulate Top 3 ROI Skills</span>
                </button>
              )
            )}

            {missingSkillsWithImpact.length > 0 && simulatedSkills.length < missingSkillsWithImpact.length && (
              <button
                type="button"
                onClick={simulateAllMissing}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#EAE4DC] dark:border-[#2F302C] bg-[#FAF7F2] dark:bg-[#1E1F1D] text-[#5C5E58] dark:text-[#9E9F97] hover:text-[#141514] dark:hover:text-[#F4F2EE] transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                Simulate All Gaps ({missingSkillsWithImpact.length})
              </button>
            )}
          </div>
        </div>

        {/* Missing Skills Interactive Grid */}
        {missingSkillsWithImpact.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <span className="block font-semibold text-sm mb-1">
              🌟 Flawless Technical Match
            </span>
            <span>
              All technical requirements and preferred bonus qualifications are already verified in the candidate profile. No missing skills to simulate!
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Print-only active simulation projection banner */}
            {isSimulating && (
              <div className="hidden print:flex items-center justify-between p-4 rounded-xl border border-cyan-500/40 bg-cyan-50 text-xs mb-3">
                <div>
                  <span className="font-semibold text-cyan-950 block">
                    Modeled What-If Skills Projection Active:
                  </span>
                  <span className="text-cyan-800 font-mono mt-0.5 block">
                    {simulatedSkills.join(", ")}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[11px] text-cyan-700 block">Projected Score: {score}%</span>
                  <span className="font-bold text-emerald-700 block">▲ +{scoreDelta}% Lift</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-[#5C5E58] dark:text-[#9E9F97] print:hidden">
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                Missing Target Skills (Ranked by Score Lift)
              </span>
              <span className="text-[11px] font-mono">
                Click any chip to toggle simulation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 print:hidden">
              {missingSkillsWithImpact.map((item) => {
                const isSelected = simulatedSkills.includes(item.name);
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => toggleSimulateSkill(item.name)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group relative overflow-hidden ${
                      isSelected
                        ? "bg-gradient-to-br from-cyan-500/15 via-emerald-500/10 to-cyan-500/15 border-cyan-500 dark:border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50"
                        : "bg-white dark:bg-[#1E1F1D] border-[#EAE4DC] dark:border-[#2F302C] hover:border-cyan-500/50 hover:bg-[#FAF7F2]/60 dark:hover:bg-[#252623] shadow-2xs hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs sm:text-sm text-[#141514] dark:text-[#F4F2EE] group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#82847E] dark:text-[#72736C] mt-0.5">
                          {item.weightTier}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          item.category === "Required"
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {item.category === "Required" ? "Req" : "Pref"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#EAE4DC]/60 dark:border-[#2F302C]/60 text-xs">
                      {/* Score Lift Pill */}
                      <div className="flex items-center gap-1 font-mono">
                        <span
                          className={`text-[11px] font-bold ${
                            isSelected
                              ? "text-cyan-700 dark:text-cyan-300"
                              : "text-emerald-700 dark:text-emerald-400"
                          }`}
                        >
                          +{item.boost}%
                        </span>
                        <span className="text-[10px] text-[#82847E] dark:text-[#72736C]">
                          lift
                        </span>
                      </div>

                      {/* State Indicator */}
                      <div
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1 transition-all ${
                          isSelected
                            ? "bg-cyan-500 text-white shadow-2xs"
                            : "bg-[#FAF7F2] dark:bg-[#141514] text-[#82847E] dark:text-[#72736C] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 border border-[#EAE4DC] dark:border-[#2F302C]"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            <span>Simulated</span>
                          </>
                        ) : (
                          <>
                            <span>+</span>
                            <span>Add</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Simulator Guidance Footer */}
            <div className="mt-4 p-4 rounded-2xl bg-[#FAF7F2]/80 dark:bg-[#1B1C1A] border border-[#EAE4DC] dark:border-[#2F302C] flex items-start gap-3 text-xs">
              <span className="text-base leading-none">💡</span>
              <div className="space-y-1">
                <span className="font-semibold text-[#141514] dark:text-[#F4F2EE] block">
                  {isSimulating
                    ? `Dynamic Simulation Active (${simulatedSkills.length} skill${simulatedSkills.length > 1 ? "s" : ""} added)`
                    : "Simulator Insights & ROI Prioritization"}
                </span>
                <p className="text-[#5C5E58] dark:text-[#9E9F97] leading-relaxed">
                  {isSimulating ? (
                    <>
                      With simulated skills (<span className="font-mono text-cyan-700 dark:text-cyan-400">{simulatedSkills.join(", ")}</span>), your overall match score shifts from{" "}
                      <span className="font-mono font-semibold">{baselineScore}%</span> to{" "}
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{score}%</span> (▲ +{scoreDelta}%). Remember to substantiate these skills on your resume with concrete business outcomes and architecture bullets.
                    </>
                  ) : (
                    <>
                      Skills are weighted using 3-tier taxonomy (Tier 1 Core Languages &amp; Cloud Platforms = 3.0x, Tier 2 Frameworks = 2.0x, Tier 3 Tools = 1.0x).
                      {missingSkillsWithImpact[0] && (
                        <span>
                          {" "}Prioritizing <strong className="text-[#141514] dark:text-[#F4F2EE] font-mono">{missingSkillsWithImpact[0].name}</strong> yields the greatest individual return (<strong className="text-emerald-700 dark:text-emerald-400">+{missingSkillsWithImpact[0].boost}% boost</strong>).
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          2.5 CAREER CHRONOLOGY & VERIFIED EMPLOYMENT TIMELINE
      ============================================================ */}
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
                {resume.structuredData.totalDurationFormatted ||
                  (resume.structuredData.yearsOfExperience
                    ? `${resume.structuredData.yearsOfExperience} Years`
                    : "0 mos")}
              </span>
            </div>

            {resume.structuredData.employmentTimeline && resume.structuredData.employmentTimeline.length > 0 && (
              <div className="px-3 py-1.5 rounded-full text-xs font-mono bg-[#FAF7F2] dark:bg-[#222320] border border-[#EAE4DC] dark:border-[#2F302C] text-[#5C5E58] dark:text-[#9E9F97]">
                {resume.structuredData.employmentTimeline.length} Positions Analyzed
              </div>
            )}
          </div>
        </div>

        {/* Timeline Nodes */}
        {resume.structuredData.employmentTimeline && resume.structuredData.employmentTimeline.length > 0 ? (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-blue-500/50 before:to-[#EAE4DC] dark:before:to-[#2F302C]">
            {resume.structuredData.employmentTimeline.map((period, idx) => (
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
              No explicit dated employment intervals were parsed from the resume text. Seniority was evaluated from explicit summary claims ({resume.structuredData.yearsOfExperience ? `${resume.structuredData.yearsOfExperience} years` : "unspecified"}).
            </span>
          </div>
        )}

        {/* Academic Degree Isolation Banner */}
        {resume.structuredData.academicTimeline && resume.structuredData.academicTimeline.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 flex items-start gap-3 text-xs">
            <span className="text-base leading-none">🎓</span>
            <div>
              <span className="font-semibold text-blue-900 dark:text-blue-200 block">
                Academic Degree Dates Isolated from Professional Tenure
              </span>
              <span className="text-blue-700/80 dark:text-blue-300/80 block mt-0.5">
                {resume.structuredData.academicTimeline.map((a) => `${a.degreeName} (${a.rawTimeline})`).join(", ")}
                {" "}&mdash; University and academic dates are verified separately and excluded from engineering tenure.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          3. REQUIREMENT COMPARISON MATRIX (PRIMARY REPORT TABLE)
      ============================================================ */}
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
        <div className="flex flex-wrap items-center gap-2 mb-6 print:hidden">
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

          {isSimulating && (
            <button
              type="button"
              onClick={() => setFilter("simulated")}
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

      {/* ============================================================
          4. SKILL BREAKDOWN SUMMARY
      ============================================================ */}
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
            Verified Matching Skills ({match?.matchingSkills.length || 0})
          </span>
          {match?.matchingSkills && match.matchingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {match.matchingSkills.map((skill, idx) => {
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
      <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] print:bg-white print-avoid-break">
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
      <div className="p-6 sm:p-8 md:p-10 border-b border-[#EAE4DC] dark:border-[#2F302C] print:bg-white print-avoid-break">
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
          </div>
        </div>
      </div>

      {/* ============================================================
          7. REPORT FOOTER
      ============================================================ */}
      <div className="p-6 bg-[#FAF7F2]/80 dark:bg-[#161715] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs print:bg-white print-avoid-break">
        <span className="text-[11px] text-[#82847E] dark:text-[#72736C] font-mono">
          Evaluated locally &bull; Zero document retention &bull; MatchEngine v2.4
        </span>

        <div className="flex items-center gap-3 print:hidden">
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
