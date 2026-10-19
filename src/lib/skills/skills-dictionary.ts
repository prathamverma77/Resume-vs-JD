// src/lib/skills/skills-dictionary.ts

export const COMMON_TECH_VOCABULARY = [
  // Programming Languages
  "JavaScript", "TypeScript", "Python", "Java", "Core Java", "C++", "C#", "Go", "Golang", "Rust",
  "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Scala", "R", "SQL", "HTML5", "HTML", "CSS3", "CSS",
  
  // Frontend Frameworks & Libraries
  "React", "Next.js", "Vue", "Angular", "Svelte", "Tailwind CSS", "Bootstrap",
  "Redux", "Zustand", "Webpack", "Vite", "GraphQL", "SASS", "SCSS", "Material UI", "jQuery",
  
  // Backend & APIs
  "Node.js", "Express.js", "Express", "NestJS", "Django", "Flask", "FastAPI",
  "Spring Boot", "ASP.NET", "Laravel", "REST API", "RESTful API", "RESTful APIs", "REST",
  "gRPC", "WebSockets", "JWT", "OAuth",
  
  // Databases & ORMs
  "PostgreSQL", "Postgres", "MongoDB", "MySQL", "Redis", "Elasticsearch", "Prisma",
  "Firebase", "Supabase", "DynamoDB", "Cassandra", "SQLite", "TypeORM", "MariaDB",
  
  // Cloud, DevOps & Infrastructure
  "AWS", "Docker", "Kubernetes", "K8s", "Azure", "GCP", "CI/CD", "Git", "GitHub", "GitLab",
  "Terraform", "Linux", "Nginx", "Jenkins", "Kafka", "RabbitMQ", "Microservices", "Vercel",
  
  // Data, AI & Machine Learning
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Data Science", "AI"
];

/**
 * Matches known vocabulary against arbitrary text using word-boundary regex.
 */
export function extractFromVocabulary(text: string): string[] {
  const found: string[] = [];

  for (const skill of COMMON_TECH_VOCABULARY) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9#+])${escaped}(?=[^a-zA-Z0-9#+]|$)`, "i");
    if (regex.test(text)) {
      found.push(skill);
    }
  }

  return found;
}
