// src/lib/ai/tailoring-harness.ts
import { getGroqClient, getGroqModel } from "./groq-client";
import { getGeminiClient, getGeminiModel } from "./gemini-client";
import { TAILORING_SYSTEM_PROMPT, buildTailoringUserPrompt } from "./prompts-tailor";
import { validateMetricInvariance } from "./tailoring-validator";
import {
  TailoringRequest,
  TailoringResponse,
  TailoredSection,
  TailoredBullet,
} from "@/types/tailoring";
import { calculateScore } from "../scoring/score-engine";
import { structureResume, StructuredResume } from "../parser/resume-structurer";
import { JDExtractedData } from "../parser/jd-parser";

// Strict timeout guard to prevent hung HTTP connections on external network latency spikes
const AI_TIMEOUT_MS = 5000;

/**
 * Race a promise against a strict timeout guard.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} exceeded ${ms}ms timeout`)), ms)
    ),
  ]);
}

/**
 * Strips markdown code block formatting (```json ... ```) if returned by the model.
 */
function sanitizeJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Tier 1: Executes Resume Tailoring using Groq Cloud LPU ultra-fast inference.
 */
async function tailorWithGroq(req: TailoringRequest): Promise<Record<string, unknown>> {
  const groq = getGroqClient();
  if (!groq) throw new Error("Groq client not configured");

  const model = getGroqModel();
  const userPrompt = buildTailoringUserPrompt(req);

  const completion = await withTimeout(
    groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: TAILORING_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
    AI_TIMEOUT_MS,
    "Groq Tailoring"
  );

  const rawText = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(sanitizeJsonString(rawText));
}

/**
 * Tier 2: Executes Resume Tailoring using Google Gemini.
 */
async function tailorWithGemini(req: TailoringRequest): Promise<Record<string, unknown>> {
  const ai = getGeminiClient();
  if (!ai) throw new Error("Gemini client not configured");

  const model = getGeminiModel();
  const userPrompt = buildTailoringUserPrompt(req);

  const response = await withTimeout(
    ai.models.generateContent({
      model,
      contents: `${TAILORING_SYSTEM_PROMPT}\n\n${userPrompt}`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
    AI_TIMEOUT_MS,
    "Gemini Tailoring"
  );

  const rawJson = sanitizeJsonString(response.text || "{}");
  return JSON.parse(rawJson);
}

/**
 * Tier 3: Local Deterministic Bullet Extractor (Zero-Downtime Offline Fallback).
 * Parses resume text into structural sections and bullets using deterministic regex when AI is offline.
 */
function localFallbackTailoring(req: TailoringRequest): TailoredSection[] {
  const lines = req.resumeText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sections: TailoredSection[] = [];

  let currentSection: TailoredSection = {
    sectionId: "sec-experience",
    title: "Experience",
    heading: req.targetRole || "Professional Experience",
    bullets: [],
  };

  let bulletCounter = 1;
  const missingPool = [...(req.missingSkills || [])];

  for (const line of lines) {
    const isBullet = /^[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s*/.test(line) || /^\d+\.\s+/.test(line);
    const cleanLine = line.replace(/^[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s*/, "").replace(/^\d+\.\s+/, "").trim();

    if (isBullet && cleanLine.length > 15) {
      // Check if we can associate a missing skill
      const candidateSkillToInject = missingPool.length > 0 ? missingPool.shift() : undefined;
      const injectedKeywords = candidateSkillToInject ? [candidateSkillToInject] : [];

      let tailoredText = cleanLine;
      if (candidateSkillToInject) {
        // Deterministic template reframing
        tailoredText = cleanLine.endsWith(".")
          ? `${cleanLine.slice(0, -1)} utilizing ${candidateSkillToInject}.`
          : `${cleanLine} utilizing ${candidateSkillToInject}.`;
      }

      currentSection.bullets.push({
        id: `bullet-${bulletCounter++}`,
        sectionId: currentSection.sectionId,
        originalText: cleanLine,
        tailoredText,
        injectedKeywords,
        preservedMetrics: [],
        rationale: candidateSkillToInject
          ? `Integrated target qualification '${candidateSkillToInject}' into verified accomplishment.`
          : "Refined bullet structure for improved ATS parsing.",
        status: "pending",
      });
    } else if (
      /^(experience|work experience|professional experience|employment history)/i.test(cleanLine) ||
      /^(projects|personal projects|technical projects)/i.test(cleanLine)
    ) {
      if (currentSection.bullets.length > 0) {
        sections.push(currentSection);
      }
      const isProj = /project/i.test(cleanLine);
      currentSection = {
        sectionId: isProj ? `sec-projects-${sections.length + 1}` : `sec-exp-${sections.length + 1}`,
        title: isProj ? "Projects" : "Experience",
        heading: cleanLine,
        bullets: [],
      };
    }
  }

  if (currentSection.bullets.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Sanitizes, validates, and normalizes raw sections returned by the model or fallback,
 * applying the Metric Invariance Validator to each bullet.
 */
function processSections(
  rawSections: unknown,
  fallbackSections: TailoredSection[]
): { sections: TailoredSection[]; allInjectedKeywords: string[] } {
  if (!Array.isArray(rawSections) || rawSections.length === 0) {
    return { sections: fallbackSections, allInjectedKeywords: [] };
  }

  const processedSections: TailoredSection[] = [];
  const allInjectedSet = new Set<string>();

  for (let sIdx = 0; sIdx < rawSections.length; sIdx++) {
    const s = rawSections[sIdx] as Record<string, unknown>;
    const sectionId = typeof s.sectionId === "string" ? s.sectionId : `sec-${sIdx + 1}`;
    const title = typeof s.title === "string" ? s.title : "Experience";
    const heading = typeof s.heading === "string" ? s.heading : "Professional Experience";
    const subheading = typeof s.subheading === "string" ? s.subheading : undefined;
    const dateSpan = typeof s.dateSpan === "string" ? s.dateSpan : undefined;

    const rawBullets = Array.isArray(s.bullets) ? s.bullets : [];
    const validBullets: TailoredBullet[] = [];

    for (let bIdx = 0; bIdx < rawBullets.length; bIdx++) {
      const b = rawBullets[bIdx] as Record<string, unknown>;
      const originalText = typeof b.originalText === "string" ? b.originalText.trim() : "";
      const rawTailoredText = typeof b.tailoredText === "string" ? b.tailoredText.trim() : originalText;

      if (!originalText || !rawTailoredText) continue;

      // Execute Programmatic Metric Invariance Validation
      const metricCheck = validateMetricInvariance(originalText, rawTailoredText);

      const injectedKeywords = Array.isArray(b.injectedKeywords)
        ? (b.injectedKeywords as string[]).map((k) => String(k).trim()).filter(Boolean)
        : [];

      for (const k of injectedKeywords) {
        allInjectedSet.add(k);
      }

      validBullets.push({
        id: typeof b.id === "string" ? b.id : `${sectionId}-b${bIdx + 1}`,
        sectionId,
        originalText,
        tailoredText: metricCheck.sanitizedTailoredText,
        injectedKeywords,
        preservedMetrics: metricCheck.preservedMetrics,
        rationale: typeof b.rationale === "string" ? b.rationale : "Reframed for target keyword alignment.",
        status: "pending",
      });
    }

    if (validBullets.length > 0) {
      processedSections.push({
        sectionId,
        title,
        heading,
        subheading,
        dateSpan,
        bullets: validBullets,
      });
    }
  }

  return {
    sections: processedSections.length > 0 ? processedSections : fallbackSections,
    allInjectedKeywords: Array.from(allInjectedSet),
  };
}

/**
 * Main Orchestration Entry Point for Resume Tailoring.
 * Cascades through Groq LPU -> Google Gemini -> Local Fallback with timeout & metric validation.
 */
export async function executeTailoringWithHarness(
  req: TailoringRequest
): Promise<TailoringResponse> {
  const startTime = Date.now();
  let parsedRaw: Record<string, unknown> | null = null;
  let usedEngine = "Local Deterministic Fallback";

  // Tier 1: Groq Cloud LPU
  if (getGroqClient()) {
    try {
      parsedRaw = await tailorWithGroq(req);
      usedEngine = `Groq LPU (${getGroqModel()})`;
      console.log(`[AI Tailor] ⚡ Successfully tailored via Groq in ${Date.now() - startTime}ms`);
    } catch (groqErr) {
      console.warn(
        `[AI Tailor] Groq API issue, trying Gemini fallback:`,
        groqErr instanceof Error ? groqErr.message : groqErr
      );
    }
  }

  // Tier 2: Google Gemini Flash
  if (!parsedRaw && getGeminiClient()) {
    try {
      parsedRaw = await tailorWithGemini(req);
      usedEngine = `Google Gemini (${getGeminiModel()})`;
      console.log(`[AI Tailor] ✨ Successfully tailored via Gemini in ${Date.now() - startTime}ms`);
    } catch (geminiErr) {
      console.warn(
        `[AI Tailor] Gemini API issue:`,
        geminiErr instanceof Error ? geminiErr.message : geminiErr
      );
    }
  }

  // Generate local deterministic fallback sections
  const fallbackSections = localFallbackTailoring(req);

  // Process and validate output through the Metric Invariance Guard
  const { sections, allInjectedKeywords } = processSections(
    parsedRaw?.sections,
    fallbackSections
  );

  // Compute Baseline and Projected Scores using the deterministic scoring engine
  let baselineScore = 65;
  let projectedScore = 88;

  try {
    const baseResume: StructuredResume = structureResume(req.resumeText);
    const mockJD: JDExtractedData = {
      role: req.targetRole || "Target Position",
      responsibilities: req.targetResponsibilities || [],
      technical_req: req.missingSkills || [],
      preferred_skills: [],
      education: [],
    };

    const baseResult = calculateScore(baseResume, mockJD);
    baselineScore = baseResult.overallScore;

    // Simulate candidate profile with injected keywords
    const simulatedSkills = Array.from(
      new Set([...(baseResume.skills || []), ...allInjectedKeywords])
    );

    const simulatedResume: StructuredResume = {
      ...baseResume,
      skills: simulatedSkills,
      rawText: `${baseResume.rawText}\nTailored Injected Competencies: ${allInjectedKeywords.join(", ")}`,
    };

    const projResult = calculateScore(simulatedResume, mockJD);
    projectedScore = Math.max(baselineScore, projResult.overallScore);
  } catch (scoreErr) {
    console.warn("[AI Tailor] Could not recalculate live scores:", scoreErr);
  }

  const executionTimeMs = Date.now() - startTime;

  return {
    success: true,
    engineUsed: usedEngine,
    executionTimeMs,
    sections,
    injectedKeywords: allInjectedKeywords,
    baselineScore,
    projectedScore,
  };
}

