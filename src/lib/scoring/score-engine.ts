// src/lib/scoring/score-engine.ts
import { StructuredResume } from "../parser/resume-structurer";
import { JDExtractedData } from "../parser/jd-parser";
import { normalizeSkill, calculateSimilarity } from "../skills/normalizer";

export interface ScoreAnalysisResult {
    overallScore: number;
    matchLevel: "Excellent Match" | "Good Match" | "Moderate Match" | "Low Match";
    technicalMatchScore: number;
    preferredMatchScore: number;
    matchingSkills: string[];
    missingRequiredSkills: string[];
    missingPreferredSkills: string[];
    recommendations: string[];
    seniorityMatch?: {
        candidateYears: number;
        requiredYears: number;
        isMet: boolean;
    };
}

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
 * Calculates a match score between a candidate's resume and job description requirements
 */
export function calculateScore(
    resume: StructuredResume,
    jd: JDExtractedData
): ScoreAnalysisResult {
    const resumeSkills = resume.skills || [];
    const requiredSkills = jd.technical_req || [];
    const preferredSkills = jd.preferred_skills || [];

    // Helper to check if candidate has a specific skill (normalized, version-aware, and fuzzy)
    const hasSkill = (requiredSkill: string) => {
        const normRequired = normalizeSkill(requiredSkill);
        if (!normRequired) return false;

        return resumeSkills.some((resumeSkill) => {
            const normResume = normalizeSkill(resumeSkill);
            if (!normResume) return false;

            // 1. Normalized exact match (e.g., "aws" === "aws", "nodejs" === "nodejs", "cpp" === "cpp")
            if (normResume === normRequired) return true;

            // Strict Firewall: Java and JavaScript must NEVER match each other
            if (
                (normResume === "java" && normRequired === "javascript") ||
                (normResume === "javascript" && normRequired === "java")
            ) {
                return false;
            }

            // Strict Firewall: C, C++, and C# must NEVER match each other
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
                // Valid version extensions: digits (e.g. 3, 18, 19) or standard variants ('native', 'js')
                return /^\d+(\.\d+)*$/.test(suffix) || suffix === "native" || suffix === "js";
            };

            if (isVersionMatch(normRequired, normResume) || isVersionMatch(normResume, normRequired)) {
                return true;
            }

            // 3. Fuzzy match for minor typos (similarity >= 0.85) - only for tokens with 4+ characters
            if (normResume.length >= 4 && normRequired.length >= 4) {
                return calculateSimilarity(normResume, normRequired) >= 0.85;
            }

            return false;
        });
    };

    // 1. Identify matching & missing required skills
    const matchingRequired = requiredSkills.filter(hasSkill);
    const missingRequiredSkills = requiredSkills.filter((s) => !hasSkill(s));

    // 2. Identify matching & missing preferred skills
    const matchingPreferred = preferredSkills.filter(hasSkill);
    const missingPreferredSkills = preferredSkills.filter((s) => !hasSkill(s));

    // 3. Combine unique matching skills across required & preferred
    const matchingSkills = Array.from(
        new Set([...matchingRequired, ...matchingPreferred])
    );

    // 4. Calculate Weighted Scores
    const hasRequired = requiredSkills.length > 0;
    const hasPreferred = preferredSkills.length > 0;

    // Weighted Technical Match Score (Core vs Auxiliary)
    let technicalMatchScore = 0;
    if (hasRequired) {
        const totalReqWeight = requiredSkills.reduce((sum, s) => sum + getSkillWeight(s), 0);
        const matchedReqWeight = matchingRequired.reduce((sum, s) => sum + getSkillWeight(s), 0);
        technicalMatchScore = totalReqWeight > 0
            ? Math.round((matchedReqWeight / totalReqWeight) * 100)
            : 0;
    }

    // Weighted Preferred Match Score
    let preferredMatchScore = 0;
    if (hasPreferred) {
        const totalPrefWeight = preferredSkills.reduce((sum, s) => sum + getSkillWeight(s), 0);
        const matchedPrefWeight = matchingPreferred.reduce((sum, s) => sum + getSkillWeight(s), 0);
        preferredMatchScore = totalPrefWeight > 0
            ? Math.round((matchedPrefWeight / totalPrefWeight) * 100)
            : 0;
    }

    // Weighted Overall Score: 75% Required Skills + 25% Preferred Skills
    let overallScore: number;
    if (!hasRequired && !hasPreferred) {
        overallScore = 0;
    } else if (!hasPreferred) {
        overallScore = technicalMatchScore;
    } else if (!hasRequired) {
        overallScore = preferredMatchScore;
    } else {
        overallScore = Math.round(technicalMatchScore * 0.75 + preferredMatchScore * 0.25);
    }

    // 5. Seniority & Experience Alignment
    let seniorityMatch: ScoreAnalysisResult["seniorityMatch"] | undefined = undefined;
    if (jd.minYearsExperience !== undefined && jd.minYearsExperience > 0) {
        const candidateYears = resume.yearsOfExperience ?? 0;
        const requiredYears = jd.minYearsExperience;
        const isMet = candidateYears >= requiredYears;

        seniorityMatch = {
            candidateYears,
            requiredYears,
            isMet
        };

        // If candidate does not meet the experience threshold, scale overall score gracefully
        // e.g. 0.70 base credit + 0.30 * (candidateYears / requiredYears)
        if (!isMet && overallScore > 0) {
            const seniorityRatio = Math.max(0, candidateYears / requiredYears);
            const seniorityMultiplier = 0.70 + 0.30 * seniorityRatio;
            overallScore = Math.round(overallScore * seniorityMultiplier);
        }
    }

    // 6. Determine Match Level Category
    let matchLevel: ScoreAnalysisResult["matchLevel"];
    if (overallScore >= 80) matchLevel = "Excellent Match";
    else if (overallScore >= 60) matchLevel = "Good Match";
    else if (overallScore >= 40) matchLevel = "Moderate Match";
    else matchLevel = "Low Match";

    // 7. Generate Actionable Recommendations Prioritized by Skill Importance & Seniority
    const recommendations: string[] = [];

    if (!hasRequired && !hasPreferred) {
        recommendations.push(
            "No technical skills or job requirements were identified in the provided job description. Please provide a detailed job description with technical qualifications to get an accurate match score."
        );
    } else {
        // Experience guidance if seniority threshold not met
        if (seniorityMatch && !seniorityMatch.isMet) {
            recommendations.push(
                `The role requests at least ${seniorityMatch.requiredYears} years of experience (your resume indicates ~${seniorityMatch.candidateYears} years). Ensure your work history timeline accurately reflects your full relevant background.`
            );
        }

        // Prioritize missing required skills by tier weight (Tier 1 core skills first)
        const prioritizedMissingRequired = [...missingRequiredSkills].sort(
            (a, b) => getSkillWeight(b) - getSkillWeight(a)
        );

        if (prioritizedMissingRequired.length > 0) {
            recommendations.push(
                `Add core required skills to your resume: ${prioritizedMissingRequired.slice(0, 3).join(", ")}.`
            );
        }

        const prioritizedMissingPreferred = [...missingPreferredSkills].sort(
            (a, b) => getSkillWeight(b) - getSkillWeight(a)
        );

        if (prioritizedMissingPreferred.length > 0) {
            recommendations.push(
                `Highlight preferred skills if you have experience with them: ${prioritizedMissingPreferred.slice(0, 3).join(", ")}.`
            );
        }

        if (overallScore < 60) {
            recommendations.push(
                "Tailor your project descriptions and skill sections to align more closely with the job requirements."
            );
        } else {
            recommendations.push(
                "Your profile matches the core requirements well! Ensure your experience bullets quantify achievements."
            );
        }
    }

    return {
        overallScore,
        matchLevel,
        technicalMatchScore,
        preferredMatchScore,
        matchingSkills,
        missingRequiredSkills,
        missingPreferredSkills,
        recommendations,
        ...(seniorityMatch !== undefined && { seniorityMatch })
    };
}
