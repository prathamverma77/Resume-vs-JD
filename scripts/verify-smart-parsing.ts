import { structureResume } from "../src/lib/parser/resume-structurer";
import { parseJD } from "../src/lib/parser/jd-parser";
import { calculateScore } from "../src/lib/scoring/score-engine";
import { normalizeSkill, calculateSimilarity } from "../src/lib/skills/normalizer";

interface TestCase {
  name: string;
  resumeText: string;
  jdText: string;
  expectedMinScore: number;
  expectedMatchingSkills: string[];
}

const testCases: TestCase[] = [
  {
    name: "1. Acronym Resolution (AWS <-> Amazon Web Services)",
    resumeText: "Skills: AWS, React\nExperience:\nBuilt cloud apps.",
    jdText: "Requirements: Amazon Web Services, React\nResponsibilities:\nDevelop frontend.",
    expectedMinScore: 100,
    expectedMatchingSkills: ["Amazon Web Services", "React"],
  },
  {
    name: "2. Punctuation Stripping (Node.js/Next.js <-> NodeJS/NextJS)",
    resumeText: "Skills: Node.js, Next.js\nProjects:\nFullstack web platform.",
    jdText: "Requirements: NodeJS, NextJS\nResponsibilities:\nBuild web systems.",
    expectedMinScore: 100,
    expectedMatchingSkills: ["NodeJS", "NextJS"],
  },
  {
    name: "3. Unlisted Emerging Skill (Pinecone, Supabase)",
    resumeText: "Skills: Supabase, Pinecone\nExperience:\nVector databases.",
    jdText: "Requirements: Supabase, Pinecone\nResponsibilities:\nAI Engineer.",
    expectedMinScore: 100,
    expectedMatchingSkills: ["Supabase", "Pinecone"],
  },
  {
    name: "4. Containerization Synonym (Docker <-> Containerization experience)",
    resumeText: "Skills: Docker\nExperience:\nDevOps Engineer.",
    jdText: "Requirements: Containerization experience\nResponsibilities:\nDeploy apps.",
    expectedMinScore: 100,
    expectedMatchingSkills: ["Containerization experience"],
  },
  {
    name: "5. Typo Tolerance (PostgreSql <-> Postgres)",
    resumeText: "Skills: PostgreSql\nProjects:\nDatabase design.",
    jdText: "Requirements: Postgres\nResponsibilities:\nManage SQL schemas.",
    expectedMinScore: 100,
    expectedMatchingSkills: ["Postgres"],
  },
  {
    name: "6. Complex Resume Layout with Subheaders and Bullets",
    resumeText: `
John Doe
john.doe@example.com | (555) 123-4567

Technical Skills:
• Languages: TypeScript, Python, Go
• Frameworks: Next.js, Express.js
• Cloud & Databases: PostgreSQL, AWS, Docker, Pinecone

Work Experience:
Software Engineer at Acme Corp
- Developed web services using FastAPI and Redis.
    `,
    jdText: `
Job Title: Senior Backend Engineer
Requirements:
• TypeScript
• Python
• Next.js
• PostgreSQL
• Docker
• Pinecone
• Redis

Preferred Skills:
• AWS
• Go
    `,
    expectedMinScore: 90,
    expectedMatchingSkills: [
      "TypeScript",
      "Python",
      "Next.js",
      "PostgreSQL",
      "Docker",
      "Pinecone",
      "Redis",
      "AWS",
      "Go"
    ],
  },
];

console.log("=================================================");
console.log("  SMART STRUCTURAL PARSING VERIFICATION SUITE");
console.log("=================================================\n");

let passedCount = 0;
let failedCount = 0;

// Unit Tests for Normalizer
console.log("--- Unit Tests: normalizer.ts ---");
const normTests = [
  { input: "Node.js", expected: "nodejs" },
  { input: "NodeJS", expected: "nodejs" },
  { input: "Amazon Web Services", expected: "aws" },
  { input: "AWS", expected: "aws" },
  { input: "k8s", expected: "kubernetes" },
  { input: "Kubernetes", expected: "kubernetes" },
  { input: "PostgreSql", expected: "postgresql" },
  { input: "Postgres", expected: "postgresql" },
  { input: "CI/CD", expected: "cicd" },
  { input: "Containerization experience", expected: "docker" },
];

for (const t of normTests) {
  const result = normalizeSkill(t.input);
  if (result === t.expected) {
    console.log(`  ✅ normalizeSkill("${t.input}") === "${result}"`);
    passedCount++;
  } else {
    console.error(`  ❌ normalizeSkill("${t.input}") === "${result}", expected "${t.expected}"`);
    failedCount++;
  }
}

// Similarity tests
const sim1 = calculateSimilarity("PostgreSql", "Postgres");
console.log(`  Similarity("PostgreSql", "Postgres") = ${sim1}`);
if (sim1 >= 0.85) {
  passedCount++;
  console.log("  ✅ Typo / variant similarity test passed");
} else {
  failedCount++;
  console.error("  ❌ Typo / variant similarity test failed");
}

console.log("\n--- Integration Tests: End-to-End Pipeline ---");
for (const tc of testCases) {
  console.log(`\nRunning: ${tc.name}`);
  const structuredResume = structureResume(tc.resumeText);
  const parsedJD = parseJD(tc.jdText);
  const scoreResult = calculateScore(structuredResume, parsedJD);

  console.log(`  Parsed Resume Skills: [${structuredResume.skills.join(", ")}]`);
  console.log(`  Parsed JD Required:   [${parsedJD.technical_req.join(", ")}]`);
  console.log(`  Parsed JD Preferred:  [${parsedJD.preferred_skills.join(", ")}]`);
  console.log(`  Matching Skills:      [${scoreResult.matchingSkills.join(", ")}]`);
  console.log(`  Overall Score:        ${scoreResult.overallScore}% (Match Level: ${scoreResult.matchLevel})`);

  let testPassed = true;

  if (scoreResult.overallScore < tc.expectedMinScore) {
    console.error(`  ❌ Score ${scoreResult.overallScore}% < expected ${tc.expectedMinScore}%`);
    testPassed = false;
  }

  for (const expectedSkill of tc.expectedMatchingSkills) {
    const isMatched = scoreResult.matchingSkills.some(
      (ms) => normalizeSkill(ms) === normalizeSkill(expectedSkill)
    );
    if (!isMatched) {
      console.error(`  ❌ Missing expected matching skill: "${expectedSkill}"`);
      testPassed = false;
    }
  }

  if (testPassed) {
    console.log(`  ✅ Test PASSED: ${tc.name}`);
    passedCount++;
  } else {
    console.log(`  ❌ Test FAILED: ${tc.name}`);
    failedCount++;
  }
}

console.log("\n=================================================");
console.log(`  TOTAL: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("=================================================");

if (failedCount > 0) {
  process.exit(1);
}
