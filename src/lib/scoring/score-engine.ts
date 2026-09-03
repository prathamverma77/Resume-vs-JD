//making the scoring engine for the parsed jd and the resume 
import { StructuredResume } from "../parser/resume-structurer";
import { JDExtractedData } from "../parser/jd-parser";

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

    // Helper to check if candidate has a specific skill (case-insensitive)
    const hasSkill = (skill: string) =>
        resumeSkills.some(
            (rs) => rs.toLowerCase().trim() === skill.toLowerCase().trim()
        );

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
    const technicalMatchScore =
        requiredSkills.length > 0
            ? Math.round((matchingRequired.length / requiredSkills.length) * 100)
            : 100;

    const preferredMatchScore =
        preferredSkills.length > 0
            ? Math.round((matchingPreferred.length / preferredSkills.length) * 100)
            : 100;

    // Weighted Overall Score: 75% Required Skills + 25% Preferred Skills
    let overallScore: number;
    if (requiredSkills.length === 0 && preferredSkills.length === 0) {
        overallScore = 100;
    } else if (preferredSkills.length === 0) {
        overallScore = technicalMatchScore;
    } else if (requiredSkills.length === 0) {
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
