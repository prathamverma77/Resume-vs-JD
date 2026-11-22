// src/types/tailoring.ts

/**
 * Tailoring intensity level determining how aggressively bullets are reframed:
 * - "conservative": Minimal vocabulary adjustments, focusing strictly on exact keyword matching.
 * - "balanced": Standard ATS optimization; reframes action verbs and weaves in missing skills.
 * - "aggressive": Comprehensive executive reframing, restructuring bullets for maximum ATS impact.
 */
export type TailoringIntensity = "conservative" | "balanced" | "aggressive";

/**
 * Status of an individual bullet refinement in the Human-in-the-Loop review studio:
 * - "pending": Awaiting candidate review (default state).
 * - "accepted": Candidate approved the AI suggested reframing.
 * - "rejected": Candidate discarded the suggestion, keeping the original bullet.
 * - "custom_edited": Candidate manually edited the tailored wording.
 */
export type BulletApprovalStatus = "pending" | "accepted" | "rejected" | "custom_edited";

/**
 * Represents a single refined bullet point with auditability and grounding metadata.
 */
export interface TailoredBullet {
  /** Unique deterministic identifier for the bullet */
  id: string;
  /** ID of the parent section (e.g. "exp-1", "proj-2") */
  sectionId: string;
  /** Exact original text extracted from the candidate's uploaded resume */
  originalText: string;
  /** AI-reframed bullet point incorporating target JD keywords */
  tailoredText: string;
  /** Technical skills or ATS keywords successfully integrated into this bullet */
  injectedKeywords: string[];
  /** Quantitative metrics and numbers detected and preserved from the original bullet */
  preservedMetrics: string[];
  /** Concise explanation of why this specific reframing was suggested */
  rationale: string;
  /** Current candidate approval state in the review studio */
  status: BulletApprovalStatus;
  /** User-modified text if the candidate manually adjusted the wording */
  userEditedText?: string;
}

/**
 * Represents an identifiable section of the resume containing structured bullets.
 */
export interface TailoredSection {
  /** Unique section identifier */
  sectionId: string;
  /** Section type */
  title: "Summary" | "Experience" | "Projects" | "Skills" | string;
  /** Primary heading (e.g. "Senior Software Engineer" or "Personal Portfolio") */
  heading: string;
  /** Subheading such as company name, organization, or project stack */
  subheading?: string;
  /** Employment or project date span (e.g. "Jan 2022 - Present") */
  dateSpan?: string;
  /** Collection of tailored bullets within this section */
  bullets: TailoredBullet[];
}

/**
 * Request payload sent to the `/api/tailor` endpoint.
 */
export interface TailoringRequest {
  /** Clean raw text extracted from candidate resume */
  resumeText: string;
  /** Target role title from the job description */
  targetRole: string;
  /** Mandatory and preferred skills identified as missing in the audit */
  missingSkills: string[];
  /** Adjacent transferable skills identified in the candidate profile */
  adjacentMatches?: Array<{
    requiredSkill: string;
    candidateSkill: string;
    family?: string;
  }>;
  /** Key deliverables and responsibilities extracted from the JD */
  targetResponsibilities?: string[];
  /** Optimization intensity (defaults to "balanced") */
  intensity?: TailoringIntensity;
}

/**
 * Summary metrics of accepted/rejected refinements across the review session.
 */
export interface TailoringProgress {
  totalBullets: number;
  acceptedCount: number;
  rejectedCount: number;
  pendingCount: number;
  customEditedCount: number;
  acceptedKeywords: string[];
}

/**
 * Complete response payload returned by `/api/tailor`.
 */
export interface TailoringResponse {
  /** Execution status flag */
  success: boolean;
  /** Informational or error message */
  message?: string;
  /** Time elapsed in milliseconds during AI extraction and reframing */
  executionTimeMs: number;
  /** Identifier of the model/tier used (e.g. "Groq LPU (qwen/qwen3.8-27b)") */
  engineUsed: string;
  /** Structured sections containing before/after bullet pairs */
  sections: TailoredSection[];
  /** Deduplicated array of all target ATS keywords addressed across sections */
  injectedKeywords: string[];
  /** Baseline audit score prior to tailoring */
  baselineScore: number;
  /** Projected audit score if all recommended refinements are accepted */
  projectedScore: number;
}

