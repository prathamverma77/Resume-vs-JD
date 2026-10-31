// src/lib/scoring/score-engine.ts
import { StructuredResume } from "../parser/resume-structurer";
import { JDExtractedData } from "../parser/jd-parser";
import { normalizeSkill, calculateSimilarity, extractParentheticalSkills } from "../skills/normalizer";
import { findAdjacentSkill } from "../skills/skill-clusters";
import {
  ScoreAnalysisResult,
  AdjacentSkillMatch,
  SkillEvidenceDetail,
  ScoringBreakdown,
} from "../../types/analysis";

export type { ScoreAnalysisResult };

// ============================================
// 3-TIER SKILL TAXONOMY FOR WEIGHTED SCORING
// ============================================
// Tier 1 (Weight 3.0): Core Languages, Cloud Platforms & Primary Architecture
const TIER_1_CORE_LANGUAGES_AND_ARCH = new Set([
  // Core Languages
  "python", "javascript", "typescript", "java", "cpp", "csharp", "c", "go", "rust",
  "php", "ruby", "swift", "kotlin", "dart", "scala", "r", "solidity", "elixir",
  "erlang", "clojure", "haskell", "lua", "perl", "julia", "bash", "shell", "powershell",
  "assembly", "zig", "sql",
  // Core Platforms & Architecture
  "aws", "gcp", "azure", "kubernetes", "docker", "distributedsystems", "systemdesign",
  "microservices", "linux", "cloudcomputing"
]);

// Tier 1 Programming Languages (Used for Dealbreaker Gate checks)
const TIER_1_PRIMARY_LANGUAGES = new Set([
  "python", "javascript", "typescript", "java", "cpp", "csharp", "c", "go", "rust",
  "php", "ruby", "swift", "kotlin", "dart", "scala"
]);

// Tier 3 (Weight 1.0): Auxiliary Workflow Tools, CI/CD, Documentation & Methodologies
const TIER_3_AUXILIARY_TOOLS = new Set([
  "git", "github", "gitlab", "bitbucket", "jira", "confluence", "trello", "slack",
  "postman", "newman", "figma", "agile", "scrum", "kanban", "eslint", "prettier",
  "swagger", "openapi", "sonar", "sonarqube", "sentry", "npm", "yarn", "pnpm",
  "webpack", "vite", "babel", "jest", "vitest", "mocha", "chai", "cypress",
  "playwright", "selenium", "puppeteer", "junit", "pytest", "testng", "k6", "jmeter"
]);

/**
 * Returns the weight multiplier for a skill:
 * - Tier 1: 3.0 (Core Languages, Architecture, Cloud)
 * - Tier 3: 1.0 (Auxiliary Workflow Tools, Tracking, Testing Utilities)
 * - Tier 2: 2.0 (Frameworks, Databases, Libraries - Default)
 */
export function getSkillWeight(skill: string): number {
  const norm = normalizeSkill(skill);
  if (TIER_1_CORE_LANGUAGES_AND_ARCH.has(norm)) {
    return 3.0;
  }
  if (TIER_3_AUXILIARY_TOOLS.has(norm)) {
    return 1.0;
  }
  return 2.0; // Tier 2 default for frameworks, DBs, streaming, etc.
}

/**
 * Searches the candidate's raw resume text for the exact sentence/bullet mentioning the skill,
 * inspecting whether it demonstrates production scale/depth or is a bare keyword mention.
 */
function extractSkillEvidence(
  skill: string,
  rawText?: string
): { quote?: string; isProduction: boolean } {
  if (!rawText || typeof rawText !== "string") return { isProduction: false };

  // Split into individual bullet points and sentences
  const lines = rawText.split(/[\n•\-*–—\r]+|(?<=[.!?])\s+/);
  const normSkill = normalizeSkill(skill);
  const skillLower = skill.toLowerCase();

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 6) continue;

    const lineLower = trimmed.toLowerCase();
    const lineNorm = normalizeSkill(trimmed);

    // Check if the sentence mentions the skill
    const mentionsSkill =
      lineLower.includes(skillLower) ||
      (normSkill.length >= 3 && lineNorm.includes(normSkill));

    if (mentionsSkill) {
      // Production depth heuristics: scale indicators, metrics, or architectural verbs
      const isProduction =
        /\b\d+[\+]?\s*(k|m|b|gb|tb|req|users|msgs|events|rps|tps|daily|weekly|monthly)\b/i.test(trimmed) ||
        /\b\d+%\b/.test(trimmed) ||
        /\b(production|distributed|architected|spearheaded|optimized|scaled|designed|orchestrated|high-throughput|cluster|pipeline|latency|throughput)\b/i.test(trimmed);

      const quote = trimmed.length > 140 ? trimmed.slice(0, 137) + "..." : trimmed;
      return { quote, isProduction };
    }
  }

  return { isProduction: false };
}

/**
 * Evaluates whether a candidate possesses a required skill via exact, version, or similarity matching.
 */
function checkSkillMatch(requiredSkill: string, candidateSkills: string[]): boolean {
  const normRequired = normalizeSkill(requiredSkill);
  if (!normRequired) return false;

  return candidateSkills.some((resumeSkill) => {
    const normResume = normalizeSkill(resumeSkill);
    if (!normResume) return false;

    // 1. Normalized exact match
    if (normResume === normRequired) return true;

    // Strict Anti-Collision Firewall: Java and JavaScript must NEVER match each other
    if (
      (normResume === "java" && normRequired === "javascript") ||
      (normResume === "javascript" && normRequired === "java")
    ) {
      return false;
    }

    // Strict Anti-Collision Firewall: C, C++, and C# must NEVER match each other
    const cFamily = new Set(["c", "cpp", "csharp"]);
    if (cFamily.has(normResume) || cFamily.has(normRequired)) {
      return false;
    }

    // Short Tokens (<= 3 chars, e.g., 'go', 'aws', 'gcp', 'sql', 'git', 'r') MUST be exact match only
    if (normResume.length <= 3 || normRequired.length <= 3) {
      return false;
    }

    // 2. Controlled Version Matching (e.g., "react" matches "react19", "python" matches "python3")
    const isVersionMatch = (base: string, variant: string): boolean => {
      if (!variant.startsWith(base)) return false;
      const suffix = variant.slice(base.length);
      return /^\d+(\.\d+)*$/.test(suffix) || suffix === "native" || suffix === "js";
    };

    if (isVersionMatch(normRequired, normResume) || isVersionMatch(normResume, normRequired)) {
      return true;
    }

    // 3. Fuzzy match for minor typos (similarity >= 0.85) for tokens with 4+ characters
    if (normResume.length >= 4 && normRequired.length >= 4) {
      return calculateSimilarity(normResume, normRequired) >= 0.85;
    }

    return false;
  });
}

/**
 * 5-DIMENSION EVALUATION SCORING ENGINE
 *
 * Dimension 1: Semantic skill matching (normalizes synonyms, parentheticals, acronyms)
 * Dimension 2: Adjacent / transferable skill clusters (0.5 partial credit for technology siblings)
 * Dimension 3: Seniority & tenure fit (banded evaluation: Aligned, Borderline, Stretch)
 * Dimension 4: Evidence strength & production depth (1.2x multiplier for quantified achievements)
 * Dimension 5: Dynamic weight redistribution (N/A != 0; unlisted preferred weights redistribute)
 * Gate: Dealbreaker cap (missing primary programming languages caps score at 55%)
 */
export function calculateScore(
  resume: StructuredResume,
  jd: JDExtractedData
): ScoreAnalysisResult {
  // Unpack any parentheticals from raw skills arrays
  const resumeSkills = (resume.skills || []).flatMap(extractParentheticalSkills);
  const requiredSkills = (jd.technical_req || []).flatMap(extractParentheticalSkills);
  const preferredSkills = (jd.preferred_skills || []).flatMap(extractParentheticalSkills);
  const rawResumeText = resume.rawText;

  const adjacentMatches: AdjacentSkillMatch[] = [];
  const evidenceDetails: SkillEvidenceDetail[] = [];

  // ----------------------------------------------------
  // 1. Process Mandatory / Core Required Skills
  // ----------------------------------------------------
  const matchingRequired: string[] = [];
  const missingRequiredSkills: string[] = [];

  for (const reqSkill of requiredSkills) {
    const isMatched = checkSkillMatch(reqSkill, resumeSkills);
    const weight = getSkillWeight(reqSkill);
    const weightTier =
      weight === 3.0
        ? "Tier 1: Core Language/Cloud"
        : weight === 1.0
        ? "Tier 3: Auxiliary Tool"
        : "Tier 2: Framework/DB";

    if (isMatched) {
      matchingRequired.push(reqSkill);
      const evidence = extractSkillEvidence(reqSkill, rawResumeText);
      evidenceDetails.push({
        skill: reqSkill,
        isMatched: true,
        isAdjacent: false,
        evidenceQuote: evidence.quote,
        isProductionDepth: evidence.isProduction,
        weightTier,
        weightMultiplier: evidence.isProduction ? 1.2 : 1.0,
      });
    } else {
      // Check for Adjacent / Transferable Skill
      const adjacent = findAdjacentSkill(reqSkill, resumeSkills);
      if (adjacent) {
        adjacentMatches.push({
          requiredSkill: reqSkill,
          matchedCandidateSkill: adjacent.matchedCandidateSkill,
          family: adjacent.familyDisplayName,
          partialCredit: 0.5,
        });
        const evidence = extractSkillEvidence(adjacent.matchedCandidateSkill, rawResumeText);
        evidenceDetails.push({
          skill: reqSkill,
          isMatched: false,
          isAdjacent: true,
          evidenceQuote: evidence.quote || `Transferable experience demonstrated via ${adjacent.matchedCandidateSkill}`,
          isProductionDepth: evidence.isProduction,
          weightTier,
          weightMultiplier: 0.5,
        });
      } else {
        missingRequiredSkills.push(reqSkill);
        evidenceDetails.push({
          skill: reqSkill,
          isMatched: false,
          isAdjacent: false,
          evidenceQuote: undefined,
          isProductionDepth: false,
          weightTier,
          weightMultiplier: 0.0,
        });
      }
    }
  }

  // ----------------------------------------------------
  // 2. Process Preferred / Nice-To-Have Skills
  // ----------------------------------------------------
  const matchingPreferred: string[] = [];
  const missingPreferredSkills: string[] = [];

  for (const prefSkill of preferredSkills) {
    const isMatched = checkSkillMatch(prefSkill, resumeSkills);
    const weight = getSkillWeight(prefSkill);
    const weightTier =
      weight === 3.0
        ? "Tier 1: Core Language/Cloud"
        : weight === 1.0
        ? "Tier 3: Auxiliary Tool"
        : "Tier 2: Framework/DB";

    if (isMatched) {
      matchingPreferred.push(prefSkill);
      const evidence = extractSkillEvidence(prefSkill, rawResumeText);
      evidenceDetails.push({
        skill: prefSkill,
        isMatched: true,
        isAdjacent: false,
        evidenceQuote: evidence.quote,
        isProductionDepth: evidence.isProduction,
        weightTier,
        weightMultiplier: evidence.isProduction ? 1.2 : 1.0,
      });
    } else {
      const adjacent = findAdjacentSkill(prefSkill, resumeSkills);
      if (adjacent) {
        adjacentMatches.push({
          requiredSkill: prefSkill,
          matchedCandidateSkill: adjacent.matchedCandidateSkill,
          family: adjacent.familyDisplayName,
          partialCredit: 0.5,
        });
        evidenceDetails.push({
          skill: prefSkill,
          isMatched: false,
          isAdjacent: true,
          evidenceQuote: `Transferable preferred skill via ${adjacent.matchedCandidateSkill}`,
          isProductionDepth: false,
          weightTier,
          weightMultiplier: 0.5,
        });
      } else {
        missingPreferredSkills.push(prefSkill);
        evidenceDetails.push({
          skill: prefSkill,
          isMatched: false,
          isAdjacent: false,
          evidenceQuote: undefined,
          isProductionDepth: false,
          weightTier,
          weightMultiplier: 0.0,
        });
      }
    }
  }

  // 3. Combined unique matching skills
  const matchingSkills = Array.from(new Set([...matchingRequired, ...matchingPreferred]));

  // ----------------------------------------------------
  // 4. Calculate Scores Across Dimensions
  // ----------------------------------------------------
  const hasRequired = requiredSkills.length > 0;
  const hasPreferred = preferredSkills.length > 0;

  // Total base required weight
  const totalReqWeight = requiredSkills.reduce((sum, s) => sum + getSkillWeight(s), 0);

  // Exact required matches with production depth multiplier
  let matchedReqWeightedPoints = 0;
  for (const matchedSkill of matchingRequired) {
    const detail = evidenceDetails.find((d) => d.skill === matchedSkill);
    const depthMult = detail?.isProductionDepth ? 1.2 : 1.0;
    matchedReqWeightedPoints += getSkillWeight(matchedSkill) * depthMult;
  }

  // Adjacent transferable matches score (0.5 partial credit)
  const adjacentWeightedPoints = adjacentMatches
    .filter((a) => requiredSkills.includes(a.requiredSkill))
    .reduce((sum, a) => sum + getSkillWeight(a.requiredSkill) * a.partialCredit, 0);

  const adjacentScore =
    totalReqWeight > 0
      ? Math.min(100, Math.round((adjacentWeightedPoints / totalReqWeight) * 100))
      : 0;

  // Core Technical Match Score (Exact matches + 0.5 adjacent partial credit)
  const technicalMatchScore =
    totalReqWeight > 0
      ? Math.min(100, Math.round(((matchedReqWeightedPoints + adjacentWeightedPoints) / totalReqWeight) * 100))
      : 0;

  // Preferred match score (Exact matches + 0.5 adjacent partial credit)
  let preferredMatchScore = 0;
  if (hasPreferred) {
    const totalPrefWeight = preferredSkills.reduce((sum, s) => sum + getSkillWeight(s), 0);
    let matchedPrefWeight = 0;
    for (const pref of matchingPreferred) {
      const detail = evidenceDetails.find((d) => d.skill === pref);
      const depthMult = detail?.isProductionDepth ? 1.2 : 1.0;
      matchedPrefWeight += getSkillWeight(pref) * depthMult;
    }

    const adjacentPrefWeight = adjacentMatches
      .filter((a) => preferredSkills.includes(a.requiredSkill))
      .reduce((sum, a) => sum + getSkillWeight(a.requiredSkill) * a.partialCredit, 0);

    preferredMatchScore =
      totalPrefWeight > 0
        ? Math.min(100, Math.round(((matchedPrefWeight + adjacentPrefWeight) / totalPrefWeight) * 100))
        : 0;
  }

  // ----------------------------------------------------
  // 5. Seniority & Tenure Fit (Banded Nuance)
  // ----------------------------------------------------
  let seniorityMatch: ScoreAnalysisResult["seniorityMatch"] | undefined = undefined;
  let seniorityScore = 100;

  if (jd.minYearsExperience !== undefined && jd.minYearsExperience > 0) {
    const candidateYears = resume.yearsOfExperience ?? 0;
    const requiredYears = jd.minYearsExperience;
    const isMet = candidateYears >= requiredYears;

    let tenureBand: "Aligned" | "Borderline" | "Stretch" | "Significant Stretch" | "Unspecified" = "Aligned";
    let statusNote = "";

    if (candidateYears >= requiredYears) {
      tenureBand = "Aligned";
      seniorityScore = 100;
      statusNote = `Tenure Aligned (${candidateYears} yrs vs ${requiredYears} yrs requested)`;
    } else if (candidateYears >= requiredYears - 1 || candidateYears / requiredYears >= 0.75) {
      tenureBand = "Borderline";
      seniorityScore = 85; // 85% credit, not a flat 0% drop
      statusNote = `Borderline Tenure Fit (${candidateYears} yrs vs ${requiredYears} yrs requested - near target band)`;
    } else if (candidateYears >= requiredYears - 2 || candidateYears / requiredYears >= 0.5) {
      tenureBand = "Stretch";
      seniorityScore = 55;
      statusNote = `Stretch Experience (${candidateYears} yrs vs ${requiredYears} yrs requested)`;
    } else {
      tenureBand = "Significant Stretch";
      seniorityScore = 25;
      statusNote = `Significant Experience Gap (${candidateYears} yrs vs ${requiredYears} yrs requested)`;
    }

    seniorityMatch = {
      candidateYears,
      requiredYears,
      isMet,
      tenureBand,
      statusNote,
    };
  }

  // ----------------------------------------------------
  // 6. Dynamic Weight Redistribution (N/A != 0)
  // ----------------------------------------------------
  let coreWeight: number;
  let preferredWeight: number;
  const adjacentWeight = adjacentScore > 0 ? 10 : 0;
  let seniorityWeight: number;
  let isPreferredRedistributed = false;

  if (!hasPreferred) {
    // When JD lists no preferred skills, redistribute the 15% preferred weight to Core & Seniority
    isPreferredRedistributed = true;
    coreWeight = 85;
    preferredWeight = 0;
    seniorityWeight = 15;
  } else {
    coreWeight = 70;
    preferredWeight = 15;
    seniorityWeight = 15;
  }

  // Calculate weighted overall composite score
  let overallScore = Math.round(
    (technicalMatchScore * coreWeight +
      preferredMatchScore * preferredWeight +
      seniorityScore * seniorityWeight) /
      100
  );

  if (!hasRequired && !hasPreferred) {
    overallScore = 0;
  }

  // ----------------------------------------------------
  // 7. Dealbreaker Gate (Primary Language Hard Cap)
  // ----------------------------------------------------
  let dealbreakerCapApplied = false;
  let capReason: string | undefined = undefined;

  const requiredPrimaryLanguages = requiredSkills.filter((s) =>
    TIER_1_PRIMARY_LANGUAGES.has(normalizeSkill(s))
  );

  if (requiredPrimaryLanguages.length > 0) {
    const candidateHasPrimaryLanguage = requiredPrimaryLanguages.some((lang) =>
      checkSkillMatch(lang, resumeSkills)
    );

    if (!candidateHasPrimaryLanguage) {
      dealbreakerCapApplied = true;
      capReason = `Missing primary required language (${requiredPrimaryLanguages.join(", ")}). Score capped at 55%.`;
      overallScore = Math.min(55, overallScore);
    }
  }

  // ----------------------------------------------------
  // 8. Determine Match Level Category
  // ----------------------------------------------------
  let matchLevel: ScoreAnalysisResult["matchLevel"];
  if (overallScore >= 80) matchLevel = "Excellent Match";
  else if (overallScore >= 60) matchLevel = "Good Match";
  else if (overallScore >= 40) matchLevel = "Moderate Match";
  else matchLevel = "Low Match";

  // ----------------------------------------------------
  // 9. Prioritized Recommendations
  // ----------------------------------------------------
  const recommendations: string[] = [];

  if (!hasRequired && !hasPreferred) {
    recommendations.push(
      "No technical requirements were detected in the job description. Please provide technical requirements for an accurate match score."
    );
  } else {
    if (dealbreakerCapApplied && capReason) {
      recommendations.push(`⚠️ Gate Constraint: ${capReason}`);
    }

    if (seniorityMatch && seniorityMatch.tenureBand !== "Aligned") {
      recommendations.push(
        `${seniorityMatch.statusNote}. Ensure your experience bullet points highlight ownership, architectural scope, and full chronological timeline.`
      );
    }

    // Missing core required skills
    const prioritizedMissingRequired = [...missingRequiredSkills].sort(
      (a, b) => getSkillWeight(b) - getSkillWeight(a)
    );
    if (prioritizedMissingRequired.length > 0) {
      recommendations.push(
        `Highlight core required skills in your resume: ${prioritizedMissingRequired.slice(0, 3).join(", ")}.`
      );
    }

    // Adjacent / Transferable skills guidance
    if (adjacentMatches.length > 0) {
      const adjSummary = adjacentMatches
        .slice(0, 2)
        .map((a) => `${a.matchedCandidateSkill} → ${a.requiredSkill} (${a.family})`)
        .join("; ");
      recommendations.push(
        `Transferable skills recognized: ${adjSummary}. Explicitly emphasize where your experience transfers to the target stack.`
      );
    }

    // Preferred skills guidance
    if (hasPreferred && missingPreferredSkills.length > 0) {
      recommendations.push(
        `Consider incorporating preferred qualifications if applicable: ${missingPreferredSkills.slice(0, 3).join(", ")}.`
      );
    }

    if (overallScore >= 75) {
      recommendations.push(
        "Strong overall compatibility! Continue quantifying production impact with metrics and deliverables."
      );
    }
  }

  const scoringBreakdown: ScoringBreakdown = {
    coreWeight,
    preferredWeight,
    adjacentWeight,
    seniorityWeight,
    coreRequiredScore: technicalMatchScore,
    preferredScore: preferredMatchScore,
    adjacentScore,
    seniorityScore,
    evidenceDepthBonus: Math.round(matchedReqWeightedPoints - matchingRequired.reduce((s, k) => s + getSkillWeight(k), 0)),
    isPreferredRedistributed,
    dealbreakerCapApplied,
    ...(capReason && { capReason }),
  };

  return {
    overallScore,
    matchLevel,
    technicalMatchScore,
    preferredMatchScore,
    matchingSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    adjacentMatches,
    evidenceDetails,
    recommendations,
    ...(seniorityMatch !== undefined && { seniorityMatch }),
    scoringBreakdown,
  };
}
