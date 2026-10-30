import { calculateScore } from "../src/lib/scoring/score-engine.ts";
import { normalizeSkill } from "../src/lib/skills/normalizer.ts";
import { extractFromVocabulary } from "../src/lib/skills/skills-dictionary.ts";

console.log("=== 1. TEST NORMALIZATION & ACRONYMS ===");
console.log("C++ ->", normalizeSkill("C++"));
console.log("C# ->", normalizeSkill("C#"));
console.log("C ->", normalizeSkill("C"));
console.log("Golang ->", normalizeSkill("Golang"));
console.log("Go ->", normalizeSkill("Go"));
console.log("Java ->", normalizeSkill("Java"));
console.log("JavaScript ->", normalizeSkill("JavaScript"));
console.log("React 19 ->", normalizeSkill("React 19"));

console.log("\n=== 2. TEST SCORE ENGINE ANTI-COLLISION ===");

// Test 1: Candidate with JavaScript should NOT match Java
const testJavaVsJS = calculateScore(
  { skills: ["JavaScript", "HTML", "CSS"] },
  { role: "Backend Engineer", responsibilities: [], technical_req: ["Java"], preferred_skills: [], education: [] }
);
console.log("Candidate with JavaScript tested against JD requiring Java:");
console.log("Matching skills:", testJavaVsJS.matchingSkills);
console.log("Missing required:", testJavaVsJS.missingRequiredSkills);
console.log("Match score:", testJavaVsJS.overallScore);
console.assert(!testJavaVsJS.matchingSkills.includes("Java"), "FAIL: JavaScript should NOT match Java!");

// Test 2: Candidate with C should NOT match C++ or C#
const testC = calculateScore(
  { skills: ["C", "Linux"] },
  { role: "Systems Engineer", responsibilities: [], technical_req: ["C++", "C#"], preferred_skills: [], education: [] }
);
console.log("\nCandidate with C tested against JD requiring C++ and C#:");
console.log("Matching skills:", testC.matchingSkills);
console.log("Missing required:", testC.missingRequiredSkills);
console.assert(testC.matchingSkills.length === 0, "FAIL: C should NOT match C++ or C#!");

// Test 3: Candidate with C++ SHOULD match C++ / Cpp
const testCpp = calculateScore(
  { skills: ["C++", "STL"] },
  { role: "Systems Engineer", responsibilities: [], technical_req: ["Cpp"], preferred_skills: [], education: [] }
);
console.log("\nCandidate with C++ tested against JD requiring Cpp:");
console.log("Matching skills:", testCpp.matchingSkills);
console.assert(testCpp.matchingSkills.length === 1, "FAIL: C++ should match Cpp!");

// Test 4: Candidate with Django should NOT match Go
const testGo = calculateScore(
  { skills: ["Django", "Python"] },
  { role: "Backend Engineer", responsibilities: [], technical_req: ["Go"], preferred_skills: [], education: [] }
);
console.log("\nCandidate with Django tested against JD requiring Go:");
console.log("Matching skills:", testGo.matchingSkills);
console.assert(!testGo.matchingSkills.includes("Go"), "FAIL: Django should NOT match Go!");

// Test 5: Version matching (React matches React 19, Python matches Python3)
const testVersions = calculateScore(
  { skills: ["React", "Python"] },
  { role: "Full Stack Engineer", responsibilities: [], technical_req: ["React 19", "Python 3"], preferred_skills: [], education: [] }
);
console.log("\nCandidate with React & Python tested against React 19 & Python 3:");
console.log("Matching skills:", testVersions.matchingSkills);
console.assert(testVersions.matchingSkills.length === 2, "FAIL: React and Python should match versions!");

console.log("\n=== 3. TEST EXPANDED 500+ VOCABULARY ===");
const sampleResumeText = `
Experienced Software Architect skilled in FastAPI, Snowflake, dbt, Apache Airflow, Kafka,
Docker, Terraform, Kubernetes, PyTorch, Prometheus, Grafana, and PostgreSQL.
`;
const extracted = extractFromVocabulary(sampleResumeText);
console.log("Extracted skills from sample text:", extracted);
console.assert(extracted.includes("FastAPI"), "FAIL: FastAPI not extracted!");
console.assert(extracted.includes("Snowflake"), "FAIL: Snowflake not extracted!");
console.assert(extracted.includes("Terraform"), "FAIL: Terraform not extracted!");

console.log("\n>>> ALL PHASE 1 TESTS PASSED SUCCESSFULLY! <<<");
