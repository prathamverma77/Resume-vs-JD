"use client";

import React, { useState, useMemo } from "react";
import { AnalyzeApiResponse, ScoreAnalysisResult, StructuredResume } from "@/types/analysis";
import { normalizeSkill } from "@/lib/skills/normalizer";
import { getSkillWeight, calculateScore } from "@/lib/scoring/score-engine";
import {
  RequirementFilter,
  RequirementItem,
  getScoreTheme,
  ReportHeader,
  ScoreGauge,
  WhatIfSimulator,
  CareerTimeline,
  RequirementsBreakdown,
  SkillBreakdownSummary,
  ActionableRecommendations,
} from "./analysis";

interface AnalysisResultProps {
  data: AnalyzeApiResponse;
  onCompareAgain: () => void;
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

    return uniqueMissing
      .map((item) => {
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
      })
      .sort((a, b) => b.boost - a.boost || b.weight - a.weight);
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

  const simulateTopThree = () => {
    setSimulatedSkills(missingSkillsWithImpact.slice(0, 3).map((s) => s.name));
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
      ...(resume.structuredData.links?.github ? [`Candidate GitHub:  ${resume.structuredData.links.github}`] : []),
      ...(resume.structuredData.links?.linkedin ? [`Candidate LinkedIn:${resume.structuredData.links.linkedin}`] : []),
      ...(resume.structuredData.links?.portfolio ? [`Candidate Portfolio:${resume.structuredData.links.portfolio}`] : []),
      ...(resume.structuredData.links?.leetcode ? [`Candidate LeetCode: ${resume.structuredData.links.leetcode}`] : []),
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
      `Seniority/Tenure:  ${match.scoringBreakdown?.isSeniorityRedistributed ? "N/A (Redistributed to Core)" : `${match.scoringBreakdown?.seniorityScore ?? 100}% (${match.scoringBreakdown?.seniorityWeight ?? 15}% weight)`}`,
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

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white dark:bg-[#1A1B18] border border-[#EAE4DC] dark:border-[#2F302C] shadow-sm overflow-hidden font-sans print:border-none print:shadow-none">
      {/* 1. REPORT HEADER */}
      <ReportHeader
        role={jd?.role}
        fileName={resume.fileInfo.name}
        fileSize={resume.fileInfo.size}
        pageCount={resume.pageCount}
        email={resume.structuredData.email}
        phone={resume.structuredData.phone}
        links={resume.structuredData.links}
        candidateYears={resume.structuredData.yearsOfExperience}
        jdMinYears={jd?.minYearsExperience}
        matchedSkillsCount={match?.matchingSkills.length || 0}
        totalReqCount={jd?.technical_req?.length || 0}
        totalPrefCount={jd?.preferred_skills?.length || 0}
        theme={theme}
        copied={copied}
        extractionEngine={data.extractionEngine}
        onCopyReport={handleCopyReport}
        onCompareAgain={onCompareAgain}
      />

      {/* 2. SCORE & GAUGES */}
      <ScoreGauge
        score={score}
        baselineScore={baselineScore}
        scoreDelta={scoreDelta}
        isSimulating={isSimulating}
        matchLevel={matchLevel}
        theme={theme}
        match={match}
        baselineMatch={baselineMatch}
        totalReqCount={jd?.technical_req?.length || 0}
        totalPrefCount={jd?.preferred_skills?.length || 0}
        resume={resume.structuredData}
        jd={jd}
      />

      {/* 3. WHAT-IF RESUME SIMULATOR */}
      <WhatIfSimulator
        isSimulating={isSimulating}
        simulatedSkills={simulatedSkills}
        score={score}
        baselineScore={baselineScore}
        scoreDelta={scoreDelta}
        missingSkillsWithImpact={missingSkillsWithImpact}
        onToggleSkill={toggleSimulateSkill}
        onReset={resetSimulation}
        onSimulateAll={simulateAllMissing}
        onSimulateTopThree={simulateTopThree}
      />

      {/* 4. CAREER CHRONOLOGY & TIMELINE */}
      <CareerTimeline resume={resume.structuredData} />

      {/* 5. REQUIREMENTS COMPARISON MATRIX */}
      <RequirementsBreakdown
        requirements={filteredRequirements}
        filter={filter}
        searchQuery={searchQuery}
        counts={counts}
        isSimulating={isSimulating}
        hasAnyRequirements={allRequirements.length > 0}
        onFilterChange={setFilter}
        onSearchChange={setSearchQuery}
      />

      {/* 6. CATEGORIZED SKILL INVENTORY */}
      <SkillBreakdownSummary
        matchingSkills={match?.matchingSkills || []}
        missingRequiredSkills={match?.missingRequiredSkills || []}
        missingPreferredSkills={match?.missingPreferredSkills || []}
        simulatedSkills={simulatedSkills}
        hasTechnicalReq={Boolean(jd?.technical_req && jd.technical_req.length > 0)}
        hasPreferredSkills={Boolean(jd?.preferred_skills && jd.preferred_skills.length > 0)}
      />

      {/* 7 & 8. ACTIONABLE RECOMMENDATIONS & FOOTER */}
      <ActionableRecommendations
        recommendations={match?.recommendations}
        responsibilities={jd?.responsibilities}
        education={jd?.education}
        copied={copied}
        onCopyReport={handleCopyReport}
        onCompareAgain={onCompareAgain}
      />
    </div>
  );
}
