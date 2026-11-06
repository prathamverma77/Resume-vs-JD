import { NextRequest } from "next/server";

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp in ms
  retryAfter: number; // Seconds until next request is permitted
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,     // 10 requests per minute
};

// In-memory sliding log store: IP -> array of request timestamps (ms)
const ipRequestLog = new Map<string, number[]>();

// Last cleanup timestamp to prevent map from unbounded growth
let lastCleanupTime = Date.now();
const CLEANUP_INTERVAL_MS = 2 * 60 * 1000; // Run cleanup every 2 minutes

function cleanupStaleEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanupTime < CLEANUP_INTERVAL_MS && ipRequestLog.size < 1000) {
    return;
  }

  const threshold = now - windowMs;
  for (const [ip, timestamps] of ipRequestLog.entries()) {
    const valid = timestamps.filter((t) => t > threshold);
    if (valid.length === 0) {
      ipRequestLog.delete(ip);
    } else {
      ipRequestLog.set(ip, valid);
    }
  }
  lastCleanupTime = now;
}

/**
 * Extracts client IP from standard proxy and CDN headers.
 */
export function getClientIp(req: Request | NextRequest): string {
  const headers = req.headers;

  // 1. Cloudflare CDN
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  // 2. Standard X-Real-IP
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // 3. X-Forwarded-For (take the first client IP in comma-separated chain)
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  // 4. RFC 7239 Forwarded header (e.g. for=192.0.2.60;proto=http;by=203.0.113.43)
  const forwarded = headers.get("forwarded");
  if (forwarded) {
    const match = /for="?([^";,]+)"?/i.exec(forwarded);
    if (match?.[1]) return match[1].trim();
  }

  // 5. Fallback for local development or direct connections
  return "127.0.0.1";
}

/**
 * Checks if a request is within the allowed sliding window rate limit.
 */
export function checkRateLimit(
  reqOrIp: Request | NextRequest | string,
  customOptions?: Partial<RateLimitOptions>
): RateLimitResult {
  const options: RateLimitOptions = {
    ...DEFAULT_OPTIONS,
    ...customOptions,
  };

  const ip = typeof reqOrIp === "string" ? reqOrIp : getClientIp(reqOrIp);
  const now = Date.now();
  const windowStart = now - options.windowMs;

  cleanupStaleEntries(options.windowMs);

  const previousTimestamps = ipRequestLog.get(ip) || [];
  // Keep only timestamps within the current sliding window
  const activeTimestamps = previousTimestamps.filter((t) => t > windowStart);

  if (activeTimestamps.length >= options.maxRequests) {
    // Rate limit exceeded: calculate earliest timestamp that will drop off
    const oldestTimestamp = activeTimestamps[0];
    const resetTime = oldestTimestamp + options.windowMs;
    const retryAfter = Math.max(1, Math.ceil((resetTime - now) / 1000));

    return {
      allowed: false,
      limit: options.maxRequests,
      remaining: 0,
      resetTime,
      retryAfter,
    };
  }

  // Record this request
  activeTimestamps.push(now);
  ipRequestLog.set(ip, activeTimestamps);

  const oldestTimestamp = activeTimestamps[0];
  const resetTime = oldestTimestamp + options.windowMs;
  const remaining = options.maxRequests - activeTimestamps.length;

  return {
    allowed: true,
    limit: options.maxRequests,
    remaining,
    resetTime,
    retryAfter: 0,
  };
}

/**
 * Generates standard RFC RateLimit headers for responses.
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": Math.max(0, result.remaining).toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetTime / 1000).toString(),
  };

  if (!result.allowed) {
    headers["Retry-After"] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Resets the in-memory rate limit store (useful for testing).
 */
export function resetRateLimits(): void {
  ipRequestLog.clear();
  lastCleanupTime = Date.now();
}

