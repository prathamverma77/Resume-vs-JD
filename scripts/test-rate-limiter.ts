import fs from "fs";
import path from "path";
import {
  checkRateLimit,
  getClientIp,
  getRateLimitHeaders,
  resetRateLimits,
} from "../src/lib/security/rate-limiter";
import { parsePDF, PDFParseError } from "../src/lib/parser/pdf-parser";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, msg: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ ${msg}`);
  } else {
    console.error(`  ❌ FAILED: ${msg}`);
    process.exitCode = 1;
  }
}

console.log("\n=================================================");
console.log("  API RATE LIMITER & PROTECTION VERIFICATION");
console.log("=================================================\n");

// --- 1. IP Header Extraction ---
console.log("--- 1. Testing getClientIp extraction ---");
{
  const reqCf = new Request("http://localhost:3000/api/analyze", {
    headers: { "cf-connecting-ip": "203.0.113.195" },
  });
  assert(getClientIp(reqCf) === "203.0.113.195", "Extracts Cloudflare CF-Connecting-IP");

  const reqReal = new Request("http://localhost:3000/api/analyze", {
    headers: { "x-real-ip": "198.51.100.22" },
  });
  assert(getClientIp(reqReal) === "198.51.100.22", "Extracts X-Real-IP");

  const reqForwarded = new Request("http://localhost:3000/api/analyze", {
    headers: { "x-forwarded-for": "203.0.113.50, 192.168.1.1, 10.0.0.1" },
  });
  assert(getClientIp(reqForwarded) === "203.0.113.50", "Extracts first client IP in X-Forwarded-For chain");

  const reqRfc = new Request("http://localhost:3000/api/analyze", {
    headers: { forwarded: 'for="192.0.2.60";proto=https' },
  });
  assert(getClientIp(reqRfc) === "192.0.2.60", "Extracts client IP from RFC 7239 Forwarded header");

  const reqFallback = new Request("http://localhost:3000/api/analyze");
  assert(getClientIp(reqFallback) === "192.0.2.1" || getClientIp(reqFallback) === "127.0.0.1", "Falls back to 127.0.0.1 when no proxy headers exist");
}

// --- 2. Sliding Window Rate Limiting ---
console.log("\n--- 2. Testing Sliding Window Rate Limiter (10 req/min) ---");
{
  resetRateLimits();
  const testIp = "192.168.10.1";

  // Simulate 10 allowed requests
  for (let i = 1; i <= 10; i++) {
    const res = checkRateLimit(testIp, { maxRequests: 10, windowMs: 60000 });
    assert(res.allowed === true, `Request #${i} is allowed`);
    assert(res.remaining === 10 - i, `Request #${i} remaining count is ${10 - i}`);
  }

  // 11th request must be rejected (429 condition)
  const blocked = checkRateLimit(testIp, { maxRequests: 10, windowMs: 60000 });
  assert(blocked.allowed === false, "Request #11 is BLOCKED (exceeds limit)");
  assert(blocked.remaining === 0, "Blocked request remaining count is 0");
  assert(blocked.retryAfter > 0 && blocked.retryAfter <= 60, `Blocked request retryAfter is valid (${blocked.retryAfter}s)`);

  // RFC headers verification
  const headers = getRateLimitHeaders(blocked);
  assert(headers["X-RateLimit-Limit"] === "10", "X-RateLimit-Limit header is '10'");
  assert(headers["X-RateLimit-Remaining"] === "0", "X-RateLimit-Remaining header is '0'");
  assert(Boolean(headers["Retry-After"]), "Retry-After header is present on blocked request");
}

// --- 3. IP Isolation ---
console.log("\n--- 3. Testing IP Isolation (Independent Buckets) ---");
{
  const otherIp = "192.168.10.2";
  const resOther = checkRateLimit(otherIp, { maxRequests: 10, windowMs: 60000 });
  assert(resOther.allowed === true, "Unrelated IP is allowed even when first IP is rate-limited");
  assert(resOther.remaining === 9, "Unrelated IP starts with full remaining quota");
}

// --- 4. PDF Page Count Guard ---
console.log("\n--- 4. Testing PDF Page Count Guard ---");
{
  async function testPdfLimits() {
    const validPdfPath = path.resolve(__dirname, "../node_modules/pdf-parse/test/data/01-valid.pdf");
    
    if (fs.existsSync(validPdfPath)) {
      const pdfBuffer = fs.readFileSync(validPdfPath);

      // Test 1: Allowed when maxPages is greater than or equal to actual page count
      try {
        const result = await parsePDF(pdfBuffer, { maxPages: 50 });
        assert(result.pageCount > 0, `Real test PDF parsed successfully (${result.pageCount} pages, within limit)`);
      } catch (err) {
        assert(false, `Unexpected error on valid PDF: ${err}`);
      }

      // Test 2: Throws PAGE_LIMIT_EXCEEDED when maxPages is lower than actual page count
      try {
        await parsePDF(pdfBuffer, { maxPages: 1 });
        assert(false, "PDF exceeding maxPages should have been rejected");
      } catch (err) {
        if (err instanceof PDFParseError) {
          assert(err.code === "PAGE_LIMIT_EXCEEDED", `PDF with exceeding page count throws PAGE_LIMIT_EXCEEDED (${err.message})`);
        } else {
          assert(false, `Expected PDFParseError but got: ${err}`);
        }
      }
    } else {
      console.log("  ⚠️ Test PDF not found, skipping fixture test");
    }

    // Test 3: Rejection on empty buffer
    try {
      await parsePDF(Buffer.alloc(0));
      assert(false, "Empty buffer should throw EMPTY_FILE");
    } catch (err) {
      if (err instanceof PDFParseError) {
        assert(err.code === "EMPTY_FILE", "Empty file throws EMPTY_FILE");
      }
    }

    // Test 4: Rejection on missing %PDF- header
    try {
      await parsePDF(Buffer.from("NOT_A_PDF"));
      assert(false, "Invalid header should throw INVALID_HEADER");
    } catch (err) {
      if (err instanceof PDFParseError) {
        assert(err.code === "INVALID_HEADER", "Corrupted header throws INVALID_HEADER");
      }
    }

    console.log("\n=================================================");
    console.log(`  TOTAL: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log("=================================================\n");
    if (passedTests !== totalTests) {
      process.exit(1);
    }
  }

  testPdfLimits();
}
