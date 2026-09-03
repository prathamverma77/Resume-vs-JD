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

export interface StructuredResume {
    skills: string[];
    email?: string;
    phone?: string;
}

export interface JDExtractedData {
    role: string;
    responsibilities: string[];
    technical_req: string[];
    preferred_skills: string[];
    education: string[];
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
