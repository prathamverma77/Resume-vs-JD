// src/app/api/tailor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { executeTailoringWithHarness } from "@/lib/ai/tailoring-harness";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/security/rate-limiter";
import { TailoringRequest } from "@/types/tailoring";

const MIN_RESUME_TEXT_LENGTH = 20;
const MAX_RESUME_TEXT_LENGTH = 50000;

export async function POST(req: NextRequest) {
  // 1. In-Memory IP Rate Limiting (10 requests per minute)
  const rateLimit = checkRateLimit(req, { maxRequests: 10, windowMs: 60 * 1000 });
  const rateLimitHeaders = getRateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many tailoring requests. You have reached the limit of ${rateLimit.limit} requests per minute. Please try again in ${rateLimit.retryAfter} seconds.`,
      },
      { status: 429, headers: rateLimitHeaders }
    );
  }

  try {
    // 2. Parse JSON Payload
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request payload. Expected JSON body." },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Malformed request body. Object expected." },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const payload = body as Partial<TailoringRequest>;

    // 3. Validate Resume Text
    if (typeof payload.resumeText !== "string" || payload.resumeText.trim().length < MIN_RESUME_TEXT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: `Resume text is missing or too short. Minimum required length is ${MIN_RESUME_TEXT_LENGTH} characters.`,
        },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    if (payload.resumeText.length > MAX_RESUME_TEXT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: `Resume text exceeds maximum allowed limit of ${MAX_RESUME_TEXT_LENGTH} characters.`,
        },
        { status: 413, headers: rateLimitHeaders }
      );
    }

    // 4. Sanitize and Normalize Fields
    const tailoringPayload: TailoringRequest = {
      resumeText: payload.resumeText.trim(),
      targetRole: typeof payload.targetRole === "string" && payload.targetRole.trim() !== ""
        ? payload.targetRole.trim()
        : "Target Position",
      missingSkills: Array.isArray(payload.missingSkills)
        ? payload.missingSkills.map((s) => String(s).trim()).filter(Boolean)
        : [],
      adjacentMatches: Array.isArray(payload.adjacentMatches)
        ? payload.adjacentMatches
        : undefined,
      targetResponsibilities: Array.isArray(payload.targetResponsibilities)
        ? payload.targetResponsibilities.map((r) => String(r).trim()).filter(Boolean)
        : undefined,
      intensity: payload.intensity === "conservative" || payload.intensity === "aggressive"
        ? payload.intensity
        : "balanced",
    };

    // 5. Execute Multi-Tier AI Tailoring Harness with Metric Invariance Validation
    const result = await executeTailoringWithHarness(tailoringPayload);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        ...rateLimitHeaders,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[POST /api/tailor] Unhandled internal error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An internal error occurred during resume tailoring. Please try again.",
      },
      { status: 500, headers: rateLimitHeaders }
    );
  }
}

