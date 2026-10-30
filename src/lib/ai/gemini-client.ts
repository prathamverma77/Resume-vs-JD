// src/lib/ai/gemini-client.ts
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

let aiClient: GoogleGenAI | null = null;
let initializedKey: string | null = null;

/**
 * Resolves GEMINI_API_KEY from process.env or .env.local fallback for standalone scripts.
 */
function resolveApiKey(): string | undefined {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }

  try {
    const envLocalPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, "utf-8");
      const match = content.match(/GEMINI_API_KEY=(.+)/);
      if (match) {
        const key = match[1].trim();
        process.env.GEMINI_API_KEY = key;
        return key;
      }
    }
  } catch {
    // Non-blocking in sandboxed environments
  }

  return undefined;
}

/**
 * Returns a cached GoogleGenAI client singleton if a valid GEMINI_API_KEY is present in the environment.
 * If the key is absent, empty, or a dummy placeholder, returns null so the system falls back
 * immediately to our local deterministic regex parsers without making failing network requests.
 */
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = resolveApiKey();

  if (
    !apiKey ||
    apiKey.trim() === "" ||
    apiKey === "your_gemini_api_key_here" ||
    apiKey.startsWith("YOUR_")
  ) {
    return null;
  }

  // Re-instantiate if the key has changed in the environment
  if (!aiClient || initializedKey !== apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
    initializedKey = apiKey;
  }

  return aiClient;
}

/**
 * Quick boolean check to inspect whether Gemini AI sensor is configured and available.
 */
export function isAIAvailable(): boolean {
  return getGeminiClient() !== null;
}

/**
 * Retrieves the configured Gemini model name.
 * Defaults to "gemini-3.8-flash" as required by Google AI Studio.
 */
export function getGeminiModel(): string {
  if (!process.env.GEMINI_MODEL) {
    try {
      const envLocalPath = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(envLocalPath)) {
        const content = fs.readFileSync(envLocalPath, "utf-8");
        const match = content.match(/GEMINI_MODEL=(.+)/);
        if (match) {
          process.env.GEMINI_MODEL = match[1].trim();
        }
      }
    } catch {
      // ignore
    }
  }
  return process.env.GEMINI_MODEL || "gemini-3.8-flash";
}
