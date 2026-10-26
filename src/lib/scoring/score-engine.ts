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

    // Helper to check if candidate has a specific skill (normalized & fuzzy)
    const hasSkill = (requiredSkill: string) => {
        const normRequired = normalizeSkill(requiredSkill);
        if (!normRequired) return false;

        return resumeSkills.some((resumeSkill) => {
            const normResume = normalizeSkill(resumeSkill);
            if (!normResume) return false;

            // 1. Normalized exact match (e.g., "aws" === "aws", "nodejs" === "nodejs")
            if (normResume === normRequired) return true;

            // 2. Substring match for versioning (e.g., "React" matches "React 19")
            if (normResume.includes(normRequired) || normRequired.includes(normResume)) {
                if (Math.min(normResume.length, normRequired.length) >= 3) {
                    return true;
                }
            }

            // 3. Fuzzy match for minor typos (similarity >= 0.85)
            return calculateSimilarity(normResume, normRequired) >= 0.85;
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

    // 4. Calculate Scores
    const hasRequired = requiredSkills.length > 0;
    const hasPreferred = preferredSkills.length > 0;

    const technicalMatchScore = hasRequired
        ? Math.round((matchingRequired.length / requiredSkills.length) * 100)
        : 0;

    const preferredMatchScore = hasPreferred
        ? Math.round((matchingPreferred.length / preferredSkills.length) * 100)
        : 0;

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

    // 5. Determine Match Level Category
    let matchLevel: ScoreAnalysisResult["matchLevel"];
    if (overallScore >= 80) matchLevel = "Excellent Match";
    else if (overallScore >= 60) matchLevel = "Good Match";
    else if (overallScore >= 40) matchLevel = "Moderate Match";
    else matchLevel = "Low Match";

    // 6. Generate Actionable Recommendations
    const recommendations: string[] = [];

    if (!hasRequired && !hasPreferred) {
        recommendations.push(
            "No technical skills or job requirements were identified in the provided job description. Please provide a detailed job description with technical qualifications to get an accurate match score."
        );
    } else {
        if (missingRequiredSkills.length > 0) {
            recommendations.push(
                `Add core required skills to your resume: ${missingRequiredSkills.slice(0, 3).join(", ")}.`
            );
        }

        if (missingPreferredSkills.length > 0) {
            recommendations.push(
                `Highlight preferred skills if you have experience with them: ${missingPreferredSkills.slice(0, 3).join(", ")}.`
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
    };
}
