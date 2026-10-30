// src/lib/ai/extraction-harness.ts
import { getGroqClient, getGroqModel } from "./groq-client";
import { getGeminiClient, getGeminiModel } from "./gemini-client";
import { JD_EXTRACTION_PROMPT, RESUME_EXTRACTION_PROMPT } from "./prompts";
import { JDExtractedData, parseJD } from "../parser/jd-parser";
import { StructuredResume, structureResume } from "../parser/resume-structurer";
import { normalizeSkill } from "../skills/normalizer";

// Strict timeout guard to prevent pending requests on external network spikes
const AI_TIMEOUT_MS = 5000;

/**
 * Race a promise against a strict timeout to prevent indefinite pending states on API latency.
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
 * Clean and deduplicate an array of string items.
 */
function cleanStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of arr) {
    if (typeof item === "string") {
      const trimmed = item.trim();
      const norm = normalizeSkill(trimmed);
      if (trimmed.length > 0 && !seen.has(norm || trimmed.toLowerCase())) {
        seen.add(norm || trimmed.toLowerCase());
        result.push(trimmed);
      }
    }
  }

  return result;
}

/**
 * Executes JD extraction using Groq Cloud LPU inference.
 */
async function extractJDWithGroq(jdText: string): Promise<Record<string, unknown>> {
  const groq = getGroqClient();
  if (!groq) throw new Error("Groq client not configured");

  const model = getGroqModel();
  const completion = await withTimeout(
    groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: JD_EXTRACTION_PROMPT },
        { role: "user", content: `JOB DESCRIPTION TEXT:\n${jdText}` },
      ],
      response_format: { type: "json_object" },
    }),
    AI_TIMEOUT_MS,
    "Groq JD Extraction"
  );

  const rawText = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(sanitizeJsonString(rawText));
}

/**
 * Executes JD extraction using Google Gemini.
 */
async function extractJDWithGemini(jdText: string): Promise<Record<string, unknown>> {
  const ai = getGeminiClient();
  if (!ai) throw new Error("Gemini client not configured");

  const model = getGeminiModel();
  const response = await withTimeout(
    ai.models.generateContent({
      model,
      contents: `${JD_EXTRACTION_PROMPT}\n\nJOB DESCRIPTION TEXT:\n${jdText}`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    }),
    AI_TIMEOUT_MS,
    "Gemini JD Extraction"
  );

  const rawJson = sanitizeJsonString(response.text || "{}");
  return JSON.parse(rawJson);
}

/**
 * Extracts structured job qualifications from Job Description text using the AI harness.
 *
 * Tier 1: Groq Cloud LPU ultra-fast inference (qwen/qwen3.8-27b, ~200ms)
 * Tier 2: Google Gemini (gemini-3.8-flash)
 * Tier 3: Hardened deterministic local regex parser fallback (Zero-downtime, offline-ready)
 *
 * @param jdText - Clean raw job description text
 * @returns Promise<JDExtractedData> conforming to the deterministic scoring engine contract
 */
export async function extractJobDescriptionWithHarness(jdText: string): Promise<JDExtractedData> {
  let parsed: Record<string, unknown> | null = null;
  let sourceUsed: "groq" | "gemini" | "local" = "local";
  const start = Date.now();

  // Tier 1: Try Groq
  if (getGroqClient()) {
    try {
      parsed = await extractJDWithGroq(jdText);
      sourceUsed = "groq";
      console.log(
        `[AI Harness - JD] ⚡ Successfully extracted via GROQ API (Model: ${getGroqModel()}) in ${Date.now() - start}ms`
      );
    } catch (groqErr) {
      console.warn(
        `[AI Harness - JD] Groq API encountered an issue, checking Gemini fallback:`,
        groqErr instanceof Error ? groqErr.message : groqErr
      );
    }
  }

  // Tier 2: Try Gemini if Groq was not configured or failed
  if (!parsed && getGeminiClient()) {
    try {
      parsed = await extractJDWithGemini(jdText);
      sourceUsed = "gemini";
      console.log(
        `[AI Harness - JD] ✨ Successfully extracted via GEMINI API (Model: ${getGeminiModel()}) in ${Date.now() - start}ms`
      );
    } catch (geminiErr) {
      console.warn(
        `[AI Harness - JD] Gemini API encountered an issue:`,
        geminiErr instanceof Error ? geminiErr.message : geminiErr
      );
    }
  }

  // Tier 3: If no AI output obtained, fall back to hardened deterministic parser
  if (!parsed) {
    sourceUsed = "local";
    console.log(
      `[AI Harness - JD] ⚙️ FALLBACK: Using Local Deterministic Regex Parser (Groq/Gemini offline or unconfigured)`
    );
    return parseJD(jdText);
  }

  try {
    const preferredSkills = cleanStringArray(parsed.preferred_skills);
    const preferredSet = new Set(preferredSkills.map((s) => normalizeSkill(s)));

    const rawTechnical = cleanStringArray(parsed.technical_req);
    // Anti-collision: remove any preferred skills accidentally included in technical_req
    const technicalReq = rawTechnical.filter((s) => !preferredSet.has(normalizeSkill(s)));

    let minYearsExperience: number | undefined = undefined;
    if (typeof parsed.minYearsExperience === "number" && parsed.minYearsExperience > 0) {
      minYearsExperience = Math.round(parsed.minYearsExperience);
    }

    const localFallback = parseJD(jdText);

    return {
      role: typeof parsed.role === "string" && parsed.role.trim() !== ""
        ? parsed.role.trim()
        : localFallback.role,
      responsibilities: Array.isArray(parsed.responsibilities) && parsed.responsibilities.length > 0
        ? parsed.responsibilities.map((r: unknown) => String(r).trim()).filter((r: string) => r.length > 0)
        : localFallback.responsibilities,
      technical_req: technicalReq.length > 0 ? technicalReq : localFallback.technical_req,
      preferred_skills: preferredSkills.length > 0 ? preferredSkills : localFallback.preferred_skills,
      education: Array.isArray(parsed.education) && parsed.education.length > 0
        ? parsed.education.map((e: unknown) => String(e).trim()).filter((e: string) => e.length > 0)
        : localFallback.education,
      ...(minYearsExperience !== undefined
        ? { minYearsExperience }
        : localFallback.minYearsExperience !== undefined
        ? { minYearsExperience: localFallback.minYearsExperience }
        : {}),
    };
  } catch (err) {
    console.warn(`[AI Harness - JD] ⚙️ Error building structured JD, falling back to local parser:`, err);
    return parseJD(jdText);
  }
}

/**
 * Executes Resume extraction using Groq Cloud LPU inference.
 */
async function extractResumeWithGroq(resumeText: string): Promise<Record<string, unknown>> {
  const groq = getGroqClient();
  if (!groq) throw new Error("Groq client not configured");

  const model = getGroqModel();
  const completion = await withTimeout(
    groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: RESUME_EXTRACTION_PROMPT },
        { role: "user", content: `RESUME TEXT:\n${resumeText}` },
      ],
      response_format: { type: "json_object" },
    }),
    AI_TIMEOUT_MS,
    "Groq Resume Extraction"
  );

  const rawText = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(sanitizeJsonString(rawText));
}

/**
 * Executes Resume extraction using Google Gemini.
 */
async function extractResumeWithGemini(resumeText: string): Promise<Record<string, unknown>> {
  const ai = getGeminiClient();
  if (!ai) throw new Error("Gemini client not configured");

  const model = getGeminiModel();
  const response = await withTimeout(
    ai.models.generateContent({
      model,
      contents: `${RESUME_EXTRACTION_PROMPT}\n\nRESUME TEXT:\n${resumeText}`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    }),
    AI_TIMEOUT_MS,
    "Gemini Resume Extraction"
  );

  const rawJson = sanitizeJsonString(response.text || "{}");
  return JSON.parse(rawJson);
}

/**
 * Extracts structured candidate profile and skills from Resume text using the AI harness.
 *
 * Tier 1: Groq Cloud LPU ultra-fast inference (qwen/qwen3.8-27b, ~200ms)
 * Tier 2: Google Gemini (gemini-3.8-flash)
 * Tier 3: Hardened deterministic local regex structurer fallback (Zero-downtime, offline-ready)
 *
 * @param resumeText - Clean raw resume text
 * @returns Promise<StructuredResume> conforming to the deterministic scoring engine contract
 */
export async function extractResumeWithHarness(resumeText: string): Promise<StructuredResume> {
  let parsed: Record<string, unknown> | null = null;
  let sourceUsed: "groq" | "gemini" | "local" = "local";
  const start = Date.now();

  // Tier 1: Try Groq
  if (getGroqClient()) {
    try {
      parsed = await extractResumeWithGroq(resumeText);
      sourceUsed = "groq";
      console.log(
        `[AI Harness - Resume] ⚡ Successfully extracted via GROQ API (Model: ${getGroqModel()}) in ${Date.now() - start}ms`
      );
    } catch (groqErr) {
      console.warn(
        `[AI Harness - Resume] Groq API encountered an issue, checking Gemini fallback:`,
        groqErr instanceof Error ? groqErr.message : groqErr
      );
    }
  }

  // Tier 2: Try Gemini if Groq was not used or failed
  if (!parsed && getGeminiClient()) {
    try {
      parsed = await extractResumeWithGemini(resumeText);
      sourceUsed = "gemini";
      console.log(
        `[AI Harness - Resume] ✨ Successfully extracted via GEMINI API (Model: ${getGeminiModel()}) in ${Date.now() - start}ms`
      );
    } catch (geminiErr) {
      console.warn(
        `[AI Harness - Resume] Gemini API encountered an issue:`,
        geminiErr instanceof Error ? geminiErr.message : geminiErr
      );
    }
  }

  // Tier 3: If no AI output obtained, fall back to hardened deterministic structurer
  if (!parsed) {
    sourceUsed = "local";
    console.log(
      `[AI Harness - Resume] ⚙️ FALLBACK: Using Local Deterministic Structurer (Groq/Gemini offline or unconfigured)`
    );
    return structureResume(resumeText);
  }

  try {
    const skills = cleanStringArray(parsed.skills);

    let yearsOfExperience: number | undefined = undefined;
    if (typeof parsed.yearsOfExperience === "number" && parsed.yearsOfExperience > 0) {
      yearsOfExperience = Math.min(40, Math.round(parsed.yearsOfExperience));
    }

    const localFallback = structureResume(resumeText);

    return {
      skills: skills.length > 0 ? skills : localFallback.skills,
      ...(yearsOfExperience !== undefined
        ? { yearsOfExperience }
        : localFallback.yearsOfExperience !== undefined
        ? { yearsOfExperience: localFallback.yearsOfExperience }
        : {}),
      email: typeof parsed.email === "string" && parsed.email.includes("@")
        ? parsed.email.trim()
        : localFallback.email,
      phone: typeof parsed.phone === "string" && parsed.phone.trim() !== ""
        ? parsed.phone.trim()
        : localFallback.phone,
    };
  } catch (err) {
    console.warn(`[AI Harness - Resume] ⚙️ Error building structured resume, falling back to local parser:`, err);
    return structureResume(resumeText);
  }
}
