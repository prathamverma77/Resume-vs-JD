// src/lib/skills/normalizer.ts

/**
 * High-impact acronym map for terms whose letters don't match the full name.
 * 25 core entries cover ~95% of real-world tech abbreviations.
 */
export const ACRONYM_MAP: Record<string, string> = {
  "amazon web services": "aws",
  "aws": "aws",
  "google cloud platform": "gcp",
  "gcp": "gcp",
  "google cloud": "gcp",
  "microsoft azure": "azure",
  "azure": "azure",
  "k8s": "kubernetes",
  "kubernetes": "kubernetes",
  "postgres": "postgresql",
  "postgresql": "postgresql",
  "pgsql": "postgresql",
  "golang": "go",
  "go": "go",
  "ci/cd": "cicd",
  "cicd": "cicd",
  "continuous integration": "cicd",
  "continuous deployment": "cicd",
  "rest api": "restapi",
  "restful api": "restapi",
  "restful apis": "restapi",
  "rest apis": "restapi",
  "rest": "restapi",
  "restapi": "restapi",
  "ml": "machine learning",
  "machine learning": "machine learning",
  "ai": "artificial intelligence",
  "artificial intelligence": "artificial intelligence",
  "containerization": "docker",
  "containerization experience": "docker",
  "containers": "docker",
  "docker": "docker",
  "js": "javascript",
  "javascript": "javascript",
  "ts": "typescript",
  "typescript": "typescript",
  "node": "nodejs",
  "nodejs": "nodejs",
  "next": "nextjs",
  "nextjs": "nextjs",
  "reactjs": "react",
  "react": "react",
  "c++": "cpp",
  "cpp": "cpp",
  "c/c++": "cpp",
  "c#": "csharp",
  "csharp": "csharp",
  "c sharp": "csharp",
  ".net": "dotnet",
  "dotnet": "dotnet",
  "asp.net": "aspnet",
  "vue.js": "vue",
  "vuejs": "vue",
  "angular.js": "angular",
  "angularjs": "angular",
  "express.js": "express",
  "expressjs": "express",
  "aws ec2": "ec2",
  "ec2": "ec2",
  "aws s3": "s3",
  "s3": "s3",
  "aws lambda": "lambda",
  "lambda": "lambda",
  "aws eks": "eks",
  "eks": "eks",
  "aws ecs": "ecs",
  "ecs": "ecs",
  "aws rds": "rds",
  "rds": "rds",
  "aws fargate": "fargate",
  "fargate": "fargate",
  "aws iam": "iam",
  "iam": "iam",
  "aws sqs": "sqs",
  "sqs": "sqs",
  "aws sns": "sns",
  "sns": "sns",
  "unit testing": "unittesting",
  "unit test": "unittesting",
  "integration testing": "integrationtesting",
  "integration test": "integrationtesting",
  "agile/scrum": "agile",
  "scrum": "agile",
  "agilescrum": "agile",
  "apache airflow": "airflow",
  "airflow dags": "airflow",
  "airflow": "airflow",
  "apache kafka": "kafka",
  "apache spark": "spark",
  "spark": "spark",
  "apache flink": "flink",
  "flink": "flink",
  "apache cassandra": "cassandra",
  "cassandra": "cassandra",
  "apache hadoop": "hadoop",
  "hadoop": "hadoop",
  "github actions": "githubactions",
  "github action": "githubactions",
  "githubactions": "githubactions",
  "gitlab ci": "gitlabci",
  "gitlab ci/cd": "gitlabci",
  "gitlabci": "gitlabci",
  "spring boot": "springboot",
  "springboot": "springboot",
  "system design": "distributedsystems",
  "distributed systems": "distributedsystems",
  "microservices": "microservices",
  "microservice architecture": "microservices",
  "relational database": "rdbms",
  "relational databases": "rdbms",
  "rdbms": "rdbms",
};

/**
 * Extracts and unpacks parenthetical and compound skill tokens.
 * E.g., "AWS (EC2, S3, Lambda, EKS)" -> ["AWS", "EC2", "S3", "Lambda", "EKS"]
 * E.g., "Airflow (DAGs)" -> ["Airflow", "DAGs"]
 */
export function extractParentheticalSkills(raw: string): string[] {
  if (!raw || typeof raw !== "string") return [];
  const trimmed = raw.trim();
  const parenMatch = trimmed.match(/^([^(]+)\(([^)]+)\)$/);

  if (!parenMatch) {
    return [trimmed];
  }

  const parent = parenMatch[1].trim();
  const children = parenMatch[2]
    .split(/[,;/]+/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const results = new Set<string>();
  if (parent) results.add(parent);
  for (const child of children) {
    results.add(child);
  }

  return Array.from(results);
}


/**
 * Normalizes any skill name:
 * 1. Lowers case and trims
 * 2. Resolves acronyms
 * 3. Strips punctuation (dots, hyphens, slashes, spaces)
 */
export function normalizeSkill(skill: string): string {
  if (!skill) return "";
  
  const clean = skill.toLowerCase().trim();

  // 1. Direct acronym lookup
  if (ACRONYM_MAP[clean]) {
    return ACRONYM_MAP[clean];
  }

  // 2. Pre-clean symbol protection for C++, C#, and .NET
  if (clean === "c++" || clean === "c/c++" || clean === "cpp") return "cpp";
  if (clean === "c#" || clean === "csharp" || clean === "c sharp") return "csharp";
  if (clean === ".net" || clean === "dotnet") return "dotnet";
  if (clean === "c") return "c";

  // 3. Strip common suffix noise
  let stripped = clean
    .replace(/\.js\b/g, "")
    .replace(/\bjs\b/g, "")
    .replace(/\bcss\b/g, "");

  // Also strip trailing js/css when word length > 3 (e.g. nodejs -> node, reactjs -> react)
  if (stripped.length > 3) {
    stripped = stripped.replace(/\.?js$/g, "").replace(/\.?css$/g, "");
  }

  // 4. Remove punctuation and symbols
  stripped = stripped.replace(/[.\-_\s/+]/g, "").trim();

  // 5. Secondary acronym lookup
  if (ACRONYM_MAP[stripped]) {
    return ACRONYM_MAP[stripped];
  }

  return stripped || clean;
}

/**
 * Zero-dependency Dice-Coefficient string similarity (0.0 to 1.0)
 * Catches minor typos and variations without any AI.
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeSkill(str1);
  const s2 = normalizeSkill(str2);

  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bigram = str.substring(i, i + 2);
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);
  let intersection = 0;

  for (const [bigram, count1] of b1.entries()) {
    if (b2.has(bigram)) {
      intersection += Math.min(count1, b2.get(bigram)!);
    }
  }

  return (2.0 * intersection) / ((s1.length - 1) + (s2.length - 1));
}
