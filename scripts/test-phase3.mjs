import { extractYearsOfExperience, structureResume } from "../src/lib/parser/resume-structurer.ts";
import { extractMinYearsExperience, parseJD } from "../src/lib/parser/jd-parser.ts";
import { calculateScore } from "../src/lib/scoring/score-engine.ts";
import mammoth from "mammoth";

console.log("=== 1. TEST RESUME EXPERIENCE EXTRACTION ===");

// Test 1: Explicit claim
const explicitResumeText = `
John Doe
Senior Software Engineer with 6+ years of professional experience building scalable systems.
Skills: Go, Kubernetes, PostgreSQL
`;
const yearsExplicit = extractYearsOfExperience(explicitResumeText);
console.log("Explicit claim '6+ years' extracted years:", yearsExplicit);
console.assert(yearsExplicit === 6, `FAIL: Expected 6 years, got ${yearsExplicit}`);

// Test 2: Timeline intervals (2018 - 2021, 2021 - 2024) = 6 years
const timelineResumeText = `
Jane Smith
Work Experience:
Software Engineer at Acme Corp
2021 - 2024
Built APIs in Python and FastAPI.

Junior Engineer at Startup
2018 - 2021
Maintained PostgreSQL databases.
`;
const yearsTimeline = extractYearsOfExperience(timelineResumeText);
console.log("Timeline intervals (2018-2021, 2021-2024) extracted years:", yearsTimeline);
console.assert(yearsTimeline === 6, `FAIL: Expected 6 years from timeline, got ${yearsTimeline}`);

// Test 3: Structured resume returns yearsOfExperience
const structured = structureResume(timelineResumeText);
console.log("Structured resume yearsOfExperience:", structured.yearsOfExperience);
console.assert(structured.yearsOfExperience === 6, "FAIL: structuredResume should include yearsOfExperience: 6");

console.log("\n=== 2. TEST JD MINIMUM EXPERIENCE EXTRACTION ===");
const jd5Years = `
Senior Go Engineer
We are looking for a Senior Go Engineer with at least 5+ years of relevant experience.
Requirements: Go, Kubernetes, PostgreSQL
`;
const minYears = extractMinYearsExperience(jd5Years);
console.log("Extracted min experience from 'at least 5+ years':", minYears);
console.assert(minYears === 5, `FAIL: Expected 5 years, got ${minYears}`);

const parsedJD = parseJD(jd5Years);
console.log("Parsed JD minYearsExperience:", parsedJD.minYearsExperience);
console.assert(parsedJD.minYearsExperience === 5, "FAIL: parseJD should include minYearsExperience: 5");

console.log("\n=== 3. TEST SENIORITY-AWARE SCORING ===");
// Case A: Candidate meets experience requirement (6 years >= 5 years required)
const scoreQualified = calculateScore(
  { skills: ["Go", "Kubernetes", "PostgreSQL"], yearsOfExperience: 6 },
  parsedJD
);
console.log("\nQualified Candidate (6 yrs vs 5 yrs required):");
console.log("Overall score:", scoreQualified.overallScore);
console.log("Seniority match:", scoreQualified.seniorityMatch);
console.assert(scoreQualified.overallScore === 100, `FAIL: Expected 100%, got ${scoreQualified.overallScore}`);
console.assert(scoreQualified.seniorityMatch?.isMet === true, "FAIL: seniorityMatch.isMet should be true");

// Case B: Candidate has identical skills but only 1 year experience for a 5-year role
const scoreJunior = calculateScore(
  { skills: ["Go", "Kubernetes", "PostgreSQL"], yearsOfExperience: 1 },
  parsedJD
);
console.log("\nJunior Candidate (1 yr vs 5 yrs required, identical skills):");
console.log("Overall score:", scoreJunior.overallScore);
console.log("Seniority match:", scoreJunior.seniorityMatch);
console.log("Recommendations:", scoreJunior.recommendations);
// 100% * (0.70 + 0.30 * 1/5) = 100% * 0.76 = 76%
console.assert(scoreJunior.overallScore === 76, `FAIL: Expected 76%, got ${scoreJunior.overallScore}`);
console.assert(scoreJunior.seniorityMatch?.isMet === false, "FAIL: seniorityMatch.isMet should be false");
console.assert(
  scoreJunior.recommendations.some(r => r.includes("at least 5 years")),
  "FAIL: Recommendation should mention experience threshold!"
);

console.log("\n=== 4. TEST MAMMOTH DOCX MODULE READINESS ===");
console.log("Mammoth extractRawText function type:", typeof mammoth.extractRawText);
console.assert(typeof mammoth.extractRawText === "function", "FAIL: mammoth.extractRawText is not a function");

console.log("\n>>> ALL PHASE 3 TESTS PASSED SUCCESSFULLY! <<<");
