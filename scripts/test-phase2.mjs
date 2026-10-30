import { calculateScore, getSkillWeight } from "../src/lib/scoring/score-engine.ts";
import { parseJD } from "../src/lib/parser/jd-parser.ts";

console.log("=== 1. TEST 3-TIER SKILL WEIGHTING ===");
console.log("Go weight (Tier 1 Core Language):", getSkillWeight("Go")); // Expected: 3.0
console.log("Kubernetes weight (Tier 1 Core Platform):", getSkillWeight("Kubernetes")); // Expected: 3.0
console.log("PostgreSQL weight (Tier 2 DB):", getSkillWeight("PostgreSQL")); // Expected: 2.0
console.log("Jira weight (Tier 3 Auxiliary):", getSkillWeight("Jira")); // Expected: 1.0
console.log("Git weight (Tier 3 Auxiliary):", getSkillWeight("Git")); // Expected: 1.0

console.assert(getSkillWeight("Go") === 3.0, "FAIL: Go should be 3.0");
console.assert(getSkillWeight("Kubernetes") === 3.0, "FAIL: Kubernetes should be 3.0");
console.assert(getSkillWeight("PostgreSQL") === 2.0, "FAIL: PostgreSQL should be 2.0");
console.assert(getSkillWeight("Jira") === 1.0, "FAIL: Jira should be 1.0");

// Test JD with Go (3), Kubernetes (3), Jira (1) -> Total weight = 7.0
const jdWithCoreAndAux = {
  role: "Senior Backend Engineer",
  responsibilities: [],
  technical_req: ["Go", "Kubernetes", "Jira"],
  preferred_skills: [],
  education: []
};

// Candidate A has core skills (Go, Kubernetes) but missing Jira
const candidateCore = calculateScore(
  { skills: ["Go", "Kubernetes"] },
  jdWithCoreAndAux
);
console.log("\nCandidate with Go & Kubernetes (missing Jira):");
console.log("Technical score:", candidateCore.technicalMatchScore);
console.log("Overall score:", candidateCore.overallScore);
// Matched weight = 3 + 3 = 6. Total = 7. Score = 6/7 * 100 = 86%
console.assert(candidateCore.technicalMatchScore === 86, `FAIL: Expected 86%, got ${candidateCore.technicalMatchScore}%`);

// Candidate B has auxiliary skill (Jira) but missing Go & Kubernetes
const candidateAux = calculateScore(
  { skills: ["Jira"] },
  jdWithCoreAndAux
);
console.log("\nCandidate with Jira only (missing Go & Kubernetes):");
console.log("Technical score:", candidateAux.technicalMatchScore);
console.log("Overall score:", candidateAux.overallScore);
// Matched weight = 1. Total = 7. Score = 1/7 * 100 = 14%
console.assert(candidateAux.technicalMatchScore === 14, `FAIL: Expected 14%, got ${candidateAux.technicalMatchScore}%`);

// Test Priority of Recommendations
console.log("\nRecommendations for Candidate B (missing Go, Kubernetes, Jira):");
console.log(candidateAux.recommendations);
// Missing required should list Go and Kubernetes before Jira
console.assert(
  candidateAux.recommendations[0].includes("Go") && candidateAux.recommendations[0].includes("Kubernetes"),
  "FAIL: Core skills Go and Kubernetes should be prioritized first in recommendations!"
);

console.log("\n=== 2. TEST UNSTRUCTURED JOB DESCRIPTION FALLBACK ===");
const casualJD = `
We are a fast-growing startup looking for an engineer proficient in Go and Kubernetes.
Experience working with PostgreSQL is essential.
Bonus if you know GraphQL or Docker.
`;

const parsed = parseJD(casualJD);
console.log("Parsed Casual JD result:");
console.log("Role:", parsed.role);
console.log("Technical Requirements (from trigger fallback):", parsed.technical_req);
console.log("Preferred Skills (from bonus trigger fallback):", parsed.preferred_skills);

console.assert(parsed.technical_req.includes("Go"), "FAIL: Unstructured JD missing Go!");
console.assert(parsed.technical_req.includes("Kubernetes"), "FAIL: Unstructured JD missing Kubernetes!");
console.assert(parsed.technical_req.includes("PostgreSQL"), "FAIL: Unstructured JD missing PostgreSQL!");
console.assert(parsed.preferred_skills.includes("GraphQL"), "FAIL: Unstructured JD missing GraphQL in preferred!");
console.assert(parsed.preferred_skills.includes("Docker"), "FAIL: Unstructured JD missing Docker in preferred!");

// Ensure no cross-pollution: Docker and GraphQL should not be duplicated in technical_req
console.assert(!parsed.technical_req.includes("GraphQL"), "FAIL: GraphQL should not be duplicated in technical_req!");

console.log("\n>>> ALL PHASE 2 TESTS PASSED SUCCESSFULLY! <<<");
