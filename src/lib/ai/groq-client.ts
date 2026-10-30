// src/lib/ai/groq-client.ts
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";

let groqClient: Groq | null = null;
let initializedKey: string | null = null;

/**
 * Resolves GROQ_API_KEY from process.env or .env.local fallback for standalone scripts.
 */
function resolveApiKey(): string | undefined {
  if (process.env.GROQ_API_KEY) {
    return process.env.GROQ_API_KEY;
  }

  try {
    const envLocalPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, "utf-8");
      const match = content.match(/GROQ_API_KEY=(.+)/);
      if (match) {
        const key = match[1].trim();
        process.env.GROQ_API_KEY = key;
        return key;
      }
    }
  } catch {
    // Non-blocking in sandboxed environments
  }

  return undefined;
}

/**
 * Returns a cached Groq client singleton if a valid GROQ_API_KEY is present in the environment.
 * If the key is absent or a dummy placeholder, returns null so the system falls back
 * gracefully without making failing network requests.
 */
export function getGroqClient(): Groq | null {
  const apiKey = resolveApiKey();

  if (
    !apiKey ||
    apiKey.trim() === "" ||
    apiKey === "your_groq_api_key_here" ||
    apiKey.startsWith("YOUR_")
  ) {
    return null;
  }

  if (!groqClient || initializedKey !== apiKey) {
    groqClient = new Groq({ apiKey });
    initializedKey = apiKey;
  }

  return groqClient;
}

/**
 * Quick boolean check to inspect whether Groq AI sensor is configured and available.
 */
export function isGroqAvailable(): boolean {
  return getGroqClient() !== null;
}

/**
 * Retrieves the configured Groq model name.
 * Defaults to "qwen/qwen3.8-27b" (ultra-fast 170ms LPU inference with native JSON schema support).
 * Can also be configured to "openai/gpt-oss-120b" or "openai/gpt-oss-20b" via GROQ_MODEL.
 */
export function getGroqModel(): string {
  if (!process.env.GROQ_MODEL) {
    try {
      const envLocalPath = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(envLocalPath)) {
        const content = fs.readFileSync(envLocalPath, "utf-8");
        const match = content.match(/GROQ_MODEL=(.+)/);
        if (match) {
          process.env.GROQ_MODEL = match[1].trim();
        }
      }
    } catch {
      // ignore
    }
  }
  return process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
}
