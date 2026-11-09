// src/types/analysis.ts

export interface AdjacentSkillMatch {
    requiredSkill: string;
    matchedCandidateSkill: string;
    family: string;
    partialCredit: number; // typically 0.5
}

export interface SkillEvidenceDetail {
    skill: string;
    isMatched: boolean;
    isAdjacent: boolean;
    evidenceQuote?: string;
    isProductionDepth: boolean;
    weightTier: string;
    weightMultiplier: number;
}

export interface ScoringBreakdown {
    coreWeight: number; // e.g. 70, 85, or 100 when redistributed
    preferredWeight: number; // e.g. 15 or 0 when N/A
    adjacentWeight: number; // 10
    seniorityWeight: number; // e.g. 15 or 0 when N/A
    coreRequiredScore: number;
    preferredScore: number;
    adjacentScore: number;
    seniorityScore: number;
    evidenceDepthBonus: number;
    isPreferredRedistributed: boolean;
    isSeniorityRedistributed: boolean;
    dealbreakerCapApplied: boolean;
    capReason?: string;
}

export interface ScoreAnalysisResult {
    overallScore: number;
    matchLevel: "Excellent Match" | "Good Match" | "Moderate Match" | "Low Match";
    technicalMatchScore: number;
    preferredMatchScore: number;
    matchingSkills: string[];
    missingRequiredSkills: string[];
    missingPreferredSkills: string[];
    adjacentMatches: AdjacentSkillMatch[];
    evidenceDetails: SkillEvidenceDetail[];
    recommendations: string[];
    seniorityMatch?: {
        candidateYears: number;
        requiredYears: number;
        isMet: boolean;
        tenureBand: "Aligned" | "Borderline" | "Stretch" | "Significant Stretch" | "Unspecified";
        statusNote: string;
    };
    scoringBreakdown?: ScoringBreakdown;
}

import type {
    EmploymentPeriod,
    AcademicPeriod,
    StructuredResume,
    CandidateLinks,
} from "../lib/parser/resume-structurer";

export type { EmploymentPeriod, AcademicPeriod, StructuredResume, CandidateLinks };

export interface JDExtractedData {
    role: string;
    responsibilities: string[];
    technical_req: string[];
    preferred_skills: string[];
    education: string[];
    minYearsExperience?: number;
}

export interface AnalyzeApiResponse {
    success: boolean;
    message: string;
    matchAnalysis: ScoreAnalysisResult | null;
    resume: {
        fileInfo: {
            name: string;
            size: number;
            type: string;
        };
        textLength: number;
        pageCount: number;
        extractedText: string;
        structuredData: StructuredResume;
    };
    jobDescription: {
        rawText: string;
        parsedData: JDExtractedData | null;
    };
}
