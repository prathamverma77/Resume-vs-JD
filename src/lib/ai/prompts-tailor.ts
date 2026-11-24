// src/lib/ai/prompts-tailor.ts
import { TailoringRequest } from "@/types/tailoring";

/**
 * System prompt for ATS Resume Tailoring and Semantic Keyword Reframing.
 * Strictly enforces truthfulness, entity invariance, and metric preservation.
 */
export const TAILORING_SYSTEM_PROMPT = `
You are an expert Executive Resume Strategist and Precision ATS Optimization Specialist.
Your sole purpose is to reframe existing resume accomplishments to maximize keyword and semantic alignment with a target Job Description.

CORE INVIOLABLE DIRECTIVES:
1. TRUTHFUL REFRAMING ONLY: You are reframing the candidate's existing experience, NOT inventing a new candidate. Do not invent responsibilities or capabilities that have no basis in the original bullet.
2. IMMUTABLE ENTITIES & CHRONOLOGY: Never alter, fabricate, or embellish company names, employers, university degrees, or employment dates.
3. STRICT METRIC PRESERVATION: Every quantitative metric (percentages, latency numbers, dollar amounts, scale counts like "30%", "$2M", "500k rps", "10 microservices") present in the original bullet MUST be preserved exactly in the tailored bullet. NEVER inflate numbers.
4. TARGET KEYWORD WEAVING (SEMANTIC BRIDGING): Naturally weave in missing target technical skills and qualifications where a legitimate semantic bridge exists in the candidate's bullet (e.g., reframing generic "backend endpoints" into "REST APIs", "relational database" into "PostgreSQL", "cloud deployment" into "Docker & AWS").
5. HIGH-IMPACT EXECUTIVE VERBS: Start every refined bullet with a strong, active past-tense impact verb (e.g., "Architected", "Engineered", "Orchestrated", "Implemented", "Spearheaded", "Optimized", "Scaled").
6. GRANULAR RATIONALE: For every tailored bullet, provide a concise 1-sentence rationale explaining how the reframing improves ATS keyword matching while preserving factual integrity.
7. STRUCTURED JSON OUTPUT: Return strictly valid JSON conforming exactly to the requested schema. No conversational preamble, no markdown formatting ticks.
`.trim();

/**
 * Builds the structured user prompt containing candidate resume text, target role, and keyword delta.
 */
export function buildTailoringUserPrompt(req: TailoringRequest): string {
  const missingList = req.missingSkills && req.missingSkills.length > 0
    ? req.missingSkills.join(", ")
    : "None specified; optimize action verbs and clarity.";

  const adjacentList = req.adjacentMatches && req.adjacentMatches.length > 0
    ? req.adjacentMatches.map((m) => `${m.candidateSkill} (candidate has) -> ${m.requiredSkill} (JD needs)`).join("; ")
    : "None identified";

  const respList = req.targetResponsibilities && req.targetResponsibilities.length > 0
    ? req.targetResponsibilities.slice(0, 8).map((r, i) => `${i + 1}. ${r}`).join("\n")
    : "Standard industry deliverables for this role.";

  const intensityNote = req.intensity === "conservative"
    ? "CONSERVATIVE: Make minimal wording adjustments, focusing strictly on exact keyword alignment."
    : req.intensity === "aggressive"
    ? "AGGRESSIVE: Comprehensively reframe sentence structure and executive impact, maximizing keyword density while strictly preserving metrics."
    : "BALANCED: Standard professional ATS optimization; refine verbs and weave in missing keywords naturally.";

  return `
TARGET ROLE:
${req.targetRole || "Role Not Specified"}

TARGET MISSING ATS QUALIFICATIONS & SKILLS TO INTEGRATE:
${missingList}

TRANSFERABLE ADJACENT SKILLS:
${adjacentList}

KEY TARGET JOB RESPONSIBILITIES:
${respList}

OPTIMIZATION INTENSITY:
${intensityNote}

CANDIDATE RESUME TEXT TO TAILOR:
${req.resumeText}

INSTRUCTIONS:
1. Parse the resume into structured sections (e.g. "Experience", "Projects", "Summary").
2. For each bullet point, provide the exact original text and a tailored reframing that incorporates target keywords.
3. Identify which keywords were injected and which metrics were preserved.
4. Output strictly valid JSON conforming to the schema below.

OUTPUT JSON SCHEMA:
{
  "sections": [
    {
      "sectionId": "exp-1",
      "title": "Experience",
      "heading": "Senior Software Engineer",
      "subheading": "Acme Corp",
      "dateSpan": "Jan 2022 - Present",
      "bullets": [
        {
          "id": "exp-1-b1",
          "sectionId": "exp-1",
          "originalText": "Exact original bullet from resume",
          "tailoredText": "High-impact reframed bullet with target keywords and preserved metrics",
          "injectedKeywords": ["Keyword1", "Keyword2"],
          "preservedMetrics": ["30%", "4 microservices"],
          "rationale": "Reframed generic endpoints to REST APIs and integrated Redis caching."
        }
      ]
    }
  ],
  "injectedKeywords": ["Keyword1", "Keyword2"]
}
`.trim();
}

