// src/lib/skills/skill-clusters.ts
import { normalizeSkill } from "./normalizer";

/**
 * Skill Cluster Family definition for transferable / adjacent skill matching.
 * Candidates who possess an adjacent sibling skill within the same domain family
 * receive 0.5 partial credit rather than a 0% binary penalty.
 */
export interface SkillCluster {
  familyId: string;
  familyDisplayName: string;
  skills: string[]; // Normalized canonical tokens
}

export const SKILL_CLUSTERS: SkillCluster[] = [
  {
    familyId: "rdbms",
    familyDisplayName: "Relational Databases (SQL)",
    skills: ["postgresql", "mysql", "mariadb", "oracle", "mssql", "sqlite", "cockroachdb", "tidb"],
  },
  {
    familyId: "nosql_doc",
    familyDisplayName: "NoSQL Document Databases",
    skills: ["mongodb", "couchdb", "firestore", "documentdb", "dynamodb"],
  },
  {
    familyId: "key_value",
    familyDisplayName: "In-Memory & Key-Value Stores",
    skills: ["redis", "memcached", "aerospike", "valkey"],
  },
  {
    familyId: "message_streaming",
    familyDisplayName: "Message Queues & Event Streaming",
    skills: ["kafka", "rabbitmq", "pulsar", "sqs", "sns", "activemq", "nats", "redisstreams", "kinesis"],
  },
  {
    familyId: "frontend_frameworks",
    familyDisplayName: "Modern Frontend UI Frameworks",
    skills: ["react", "vue", "angular", "svelte", "solidjs", "nextjs", "remix", "nuxt", "astro"],
  },
  {
    familyId: "cloud_providers",
    familyDisplayName: "Hyperscale Cloud Infrastructure",
    skills: ["aws", "gcp", "azure", "digitalocean"],
  },
  {
    familyId: "data_orchestration",
    familyDisplayName: "Data & Workflow Orchestration",
    skills: ["airflow", "prefect", "dagster", "luigi", "nifi", "temporal"],
  },
  {
    familyId: "big_data_compute",
    familyDisplayName: "Distributed Big Data Processing",
    skills: ["spark", "flink", "hadoop", "beam", "databricks"],
  },
  {
    familyId: "container_orchestration",
    familyDisplayName: "Container Orchestration & Runtimes",
    skills: ["kubernetes", "dockerswarm", "nomad", "ecs", "openshift", "docker"],
  },
  {
    familyId: "cicd_automation",
    familyDisplayName: "CI/CD & Deployment Automation",
    skills: ["githubactions", "gitlabci", "jenkins", "circleci", "argocd", "travisci", "tekton", "cicd"],
  },
  {
    familyId: "iac_provisioning",
    familyDisplayName: "Infrastructure as Code (IaC)",
    skills: ["terraform", "cloudformation", "pulumi", "ansible"],
  },
  {
    familyId: "observability",
    familyDisplayName: "Observability, APM & Metrics",
    skills: ["prometheus", "grafana", "datadog", "newrelic", "splunk", "opentelemetry", "dynatrace"],
  },
  {
    familyId: "backend_python",
    familyDisplayName: "Python Backend Frameworks",
    skills: ["fastapi", "flask", "django", "tornado"],
  },
  {
    familyId: "backend_node",
    familyDisplayName: "Node.js Backend Frameworks",
    skills: ["express", "nestjs", "fastify", "koa", "hono"],
  },
  {
    familyId: "backend_java",
    familyDisplayName: "Java / JVM Enterprise Frameworks",
    skills: ["springboot", "spring", "micronaut", "quarkus"],
  },
  {
    familyId: "backend_go",
    familyDisplayName: "Go Web & Microservice Frameworks",
    skills: ["gin", "echo", "fiber", "chi"],
  },
  {
    familyId: "api_protocols",
    familyDisplayName: "API Protocols & Architectures",
    skills: ["restapi", "grpc", "graphql", "trpc", "websocket"],
  },
];

// Inverted lookup map for O(1) cluster resolution
const SKILL_TO_CLUSTER_MAP = new Map<string, SkillCluster>();

for (const cluster of SKILL_CLUSTERS) {
  for (const skill of cluster.skills) {
    SKILL_TO_CLUSTER_MAP.set(skill, cluster);
  }
}

/**
 * Finds the cluster family for a given skill.
 */
export function getSkillCluster(skill: string): SkillCluster | undefined {
  const norm = normalizeSkill(skill);
  return SKILL_TO_CLUSTER_MAP.get(norm);
}

/**
 * Determines if two skills belong to the same domain cluster.
 */
export function areSkillsAdjacent(skillA: string, skillB: string): boolean {
  const normA = normalizeSkill(skillA);
  const normB = normalizeSkill(skillB);
  if (!normA || !normB || normA === normB) return false;

  const clusterA = SKILL_TO_CLUSTER_MAP.get(normA);
  const clusterB = SKILL_TO_CLUSTER_MAP.get(normB);

  return clusterA !== undefined && clusterB !== undefined && clusterA.familyId === clusterB.familyId;
}

/**
 * Searches a candidate's skill list for any adjacent sibling that belongs to the same
 * cluster family as the required skill.
 *
 * @param requiredSkill - The mandatory skill requested by the JD
 * @param candidateSkills - The list of skills extracted from candidate's resume
 * @returns The matched sibling skill and family name, or undefined if no sibling exists
 */
export function findAdjacentSkill(
  requiredSkill: string,
  candidateSkills: string[]
): { matchedCandidateSkill: string; familyDisplayName: string } | undefined {
  const normRequired = normalizeSkill(requiredSkill);
  const cluster = SKILL_TO_CLUSTER_MAP.get(normRequired);

  if (!cluster) return undefined;

  for (const candidateSkill of candidateSkills) {
    const normCandidate = normalizeSkill(candidateSkill);
    if (!normCandidate || normCandidate === normRequired) continue;

    if (cluster.skills.includes(normCandidate)) {
      return {
        matchedCandidateSkill: candidateSkill,
        familyDisplayName: cluster.familyDisplayName,
      };
    }
  }

  return undefined;
}
