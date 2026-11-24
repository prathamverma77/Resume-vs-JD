// scripts/test-tailoring-engine.ts
import { validateMetricInvariance, extractMetrics } from "../src/lib/ai/tailoring-validator";
import { executeTailoringWithHarness } from "../src/lib/ai/tailoring-harness";
import { TailoringRequest } from "../src/types/tailoring";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ ${message}`);
}

async function runTailoringVerification() {
  console.log("=================================================");
  console.log("  AI RESUME TAILORING & VALIDATOR TEST SUITE");
  console.log("=================================================\n");

  // --- 1. Testing Metric Extraction ---
  console.log("--- 1. Testing extractMetrics() Regex ---");
  const sampleText1 = "Reduced API latency by 35.5% and handled $2.5M in transactions across 12 microservices with 500k rps.";
  const metrics1 = extractMetrics(sampleText1);

  assert(metrics1.some((m) => m.includes("35.5%")), "Extracts percentage: 35.5%");
  assert(metrics1.some((m) => m.includes("$2.5M") || m.includes("$2.5m")), "Extracts currency: $2.5M");
  assert(metrics1.some((m) => m.toLowerCase().includes("12 microservices")), "Extracts entity scale: 12 microservices");
  assert(metrics1.some((m) => m.toLowerCase().includes("500k rps")), "Extracts throughput: 500k rps");

  // --- 2. Testing Metric Invariance Validator ---
  console.log("\n--- 2. Testing validateMetricInvariance() ---");
  
  // Case A: Perfect preservation
  const originalA = "Built backend endpoints in Python, reducing p99 latency by 40% and saving $50k annually.";
  const tailoredA = "Architected high-throughput REST API services in Python, reducing p99 latency by 40% and saving $50k annually through PostgreSQL caching.";
  const checkA = validateMetricInvariance(originalA, tailoredA);

  assert(checkA.isInvariant === true, "Identifies fully invariant tailored bullet");
  assert(checkA.droppedMetrics.length === 0, "Zero dropped metrics when numbers match");
  assert(checkA.preservedMetrics.some((m) => m.includes("40%")), "40% recognized as preserved");
  assert(checkA.preservedMetrics.some((m) => m.includes("$50k")), "$50k recognized as preserved");

  // Case B: Dropped metric detection & safe reconciliation
  const originalB = "Managed 8 databases and improved throughput by 25%.";
  const tailoredB = "Orchestrated PostgreSQL database clusters and optimized transactional throughput."; // Dropped "25%"
  const checkB = validateMetricInvariance(originalB, tailoredB);

  assert(checkB.isInvariant === false, "Detects that 25% was dropped by LLM");
  assert(checkB.droppedMetrics.some((m) => m.includes("25%")), "Records 25% in droppedMetrics");
  assert(checkB.sanitizedTailoredText.includes("25%"), "Safely restores dropped critical metric to end of sentence");

  // --- 3. Testing Local Fallback & Multi-Tier Harness ---
  console.log("\n--- 3. Testing executeTailoringWithHarness() ---");
  const sampleResume = `
Jane Doe
Software Engineer
jane.doe@example.com

EXPERIENCE
Acme Corporation - Full Stack Developer (Jan 2022 - Present)
• Developed web endpoints using Python and managed relational databases, reducing response times by 30%.
• Built user interfaces in JavaScript and automated testing suites across 4 services.
• Maintained cloud deployment scripts and monitored server uptime.

PROJECTS
E-Commerce API Platform
• Engineered checkout service processing $10,000 daily volume with 99.9% uptime.
`;

  const requestPayload: TailoringRequest = {
    resumeText: sampleResume,
    targetRole: "Senior Backend Engineer",
    missingSkills: ["Docker", "PostgreSQL", "Redis", "REST APIs"],
    adjacentMatches: [
      { requiredSkill: "PostgreSQL", candidateSkill: "relational databases", family: "Databases" },
    ],
    targetResponsibilities: [
      "Architect scalable REST API services",
      "Deploy containerized microservices using Docker",
      "Optimize low-latency database queries using Redis caching",
    ],
    intensity: "balanced",
  };

  const startTime = Date.now();
  const response = await executeTailoringWithHarness(requestPayload);
  const elapsed = Date.now() - startTime;

  console.log(`  Engine used: ${response.engineUsed} (Elapsed: ${elapsed}ms)`);
  assert(response.success === true, "executeTailoringWithHarness returns success: true");
  assert(response.sections.length >= 1, `Extracted ${response.sections.length} structured sections`);

  // Count bullets
  let totalBullets = 0;
  for (const sec of response.sections) {
    totalBullets += sec.bullets.length;
  }
  assert(totalBullets >= 3, `Extracted ${totalBullets} tailored bullets from resume`);

  // Verify bullet integrity
  const firstBullet = response.sections[0].bullets[0];
  assert(typeof firstBullet.originalText === "string" && firstBullet.originalText.length > 0, "Bullet has originalText");
  assert(typeof firstBullet.tailoredText === "string" && firstBullet.tailoredText.length > 0, "Bullet has tailoredText");
  assert(typeof firstBullet.rationale === "string" && firstBullet.rationale.length > 0, "Bullet has rationale");
  assert(firstBullet.status === "pending", "Initial bullet status is 'pending'");

  // Verify scoring calculation
  assert(typeof response.baselineScore === "number", `Baseline score calculated (${response.baselineScore}%)`);
  assert(typeof response.projectedScore === "number", `Projected score calculated (${response.projectedScore}%)`);
  assert(response.projectedScore >= response.baselineScore, "Projected score is >= baseline score");

  console.log("\n=================================================");
  console.log("  TOTAL: ALL TESTS PASSED");
  console.log("=================================================");
}

runTailoringVerification().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

