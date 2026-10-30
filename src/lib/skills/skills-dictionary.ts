// src/lib/skills/skills-dictionary.ts

/**
 * Curated, industry-standard technology catalog covering 500+ modern engineering skills.
 * Organized by domain to ensure comprehensive coverage across tech roles.
 */
export const COMMON_TECH_VOCABULARY: string[] = [
  // ============================================
  // 1. PROGRAMMING LANGUAGES & RUNTIMES
  // ============================================
  "JavaScript", "TypeScript", "Python", "Java", "Core Java", "C++", "C#", "Go", "Golang", "Rust",
  "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Scala", "R", "SQL", "HTML5", "HTML", "CSS3", "CSS",
  "Solidity", "Elixir", "Erlang", "Clojure", "Haskell", "Lua", "Perl", "Julia", "Bash", "Shell",
  "PowerShell", "Assembly", "Zig", "Groovy", "VBA", "Fortran", "COBOL", "MATLAB",

  // ============================================
  // 2. FRONTEND FRAMEWORKS, LIBRARIES & STATE
  // ============================================
  "React", "React.js", "Next.js", "NextJS", "Vue", "Vue.js", "VueJS", "Nuxt.js", "Nuxt",
  "Angular", "AngularJS", "Svelte", "SvelteKit", "Remix", "Gatsby", "Astro", "SolidJS",
  "Redux", "Redux Toolkit", "Zustand", "MobX", "Recoil", "Jotai", "TanStack Query", "React Query",
  "Apollo Client", "Relay", "Tailwind CSS", "Tailwind", "Bootstrap", "Material UI", "MUI",
  "Chakra UI", "Ant Design", "Shadcn", "Radix UI", "Styled Components", "Emotion",
  "Sass", "SCSS", "Less", "PostCSS", "Webpack", "Vite", "Rollup", "Turbopack", "esbuild",
  "Babel", "jQuery", "Three.js", "D3.js", "Chart.js", "Framer Motion",

  // ============================================
  // 3. BACKEND FRAMEWORKS, RUNTIMES & PROTOCOLS
  // ============================================
  "Node.js", "NodeJS", "Express.js", "Express", "NestJS", "Fastify", "Koa", "Hono",
  "Deno", "Bun", "Django", "Flask", "FastAPI", "Celery", "Tornado", "Spring Boot",
  "Spring MVC", "Spring Framework", "ASP.NET", "ASP.NET Core", ".NET Core", "Ruby on Rails",
  "Rails", "Sinatra", "Laravel", "Symfony", "Gin", "Echo", "Fiber", "Actix", "Axum", "Rocket",
  "Phoenix", "gRPC", "Protobuf", "WebSockets", "Socket.io", "GraphQL", "REST API", "RESTful API",
  "RESTful APIs", "REST", "OpenAPI", "Swagger", "tRPC", "JSON-RPC", "SOAP",

  // ============================================
  // 4. DATABASES, STORAGE & SEARCH ENGINES
  // ============================================
  "PostgreSQL", "Postgres", "MySQL", "MariaDB", "SQLite", "Oracle Database", "Oracle DB",
  "Microsoft SQL Server", "MSSQL", "MongoDB", "DynamoDB", "Cassandra", "Couchbase", "CouchDB",
  "Redis", "Memcached", "Elasticsearch", "OpenSearch", "Apache Solr", "Solr", "Meilisearch",
  "Algolia", "Neo4j", "ArangoDB", "Supabase", "Firebase", "Firebase Realtime Database", "Firestore",
  "PlanetScale", "CockroachDB", "TiDB", "ScyllaDB", "ClickHouse", "Snowflake", "Google BigQuery",
  "BigQuery", "Amazon Redshift", "Redshift", "Databricks", "DuckDB", "HBase", "InfluxDB", "TimescaleDB",

  // ============================================
  // 5. ORMS, ODMS & DATABASE TOOLS
  // ============================================
  "Prisma", "TypeORM", "Drizzle ORM", "Drizzle", "Sequelize", "Mongoose", "Hibernate",
  "SQLAlchemy", "Entity Framework", "Entity Framework Core", "Alembic", "Flyway", "Liquibase",
  "Knex.js", "MikroORM", "jOOQ", "Active Record",

  // ============================================
  // 6. CLOUD PLATFORMS & CLOUD SERVICES
  // ============================================
  "AWS", "Amazon Web Services", "EC2", "S3", "RDS", "AWS Lambda", "Lambda", "ECS", "EKS",
  "AWS Fargate", "Fargate", "CloudFront", "SQS", "SNS", "CloudWatch", "AWS IAM", "Route 53",
  "API Gateway", "Google Cloud Platform", "Google Cloud", "GCP", "Cloud Run", "Cloud Functions",
  "Google Kubernetes Engine", "GKE", "Google Cloud Storage", "Microsoft Azure", "Azure",
  "Azure App Service", "Azure Functions", "Azure DevOps", "Azure Blob Storage", "Azure Cosmos DB",
  "Cloudflare", "Cloudflare Workers", "Vercel", "Netlify", "DigitalOcean", "Heroku", "Linode",

  // ============================================
  // 7. DEVOPS, CONTAINERS, ORCHESTRATION & CI/CD
  // ============================================
  "Docker", "Docker Compose", "Kubernetes", "K8s", "Helm", "Terraform", "Terragrunt",
  "Ansible", "Puppet", "Chef", "Vagrant", "GitHub Actions", "GitLab CI", "GitLab CI/CD",
  "Jenkins", "CircleCI", "Travis CI", "ArgoCD", "FluxCD", "Tekton", "Spinnaker", "Bitbucket Pipelines",
  "Nginx", "Apache HTTP Server", "Apache", "Traefik", "Envoy", "Istio", "Linkerd", "HAProxy",

  // ============================================
  // 8. OBSERVABILITY, MONITORING & LOGGING
  // ============================================
  "Prometheus", "Grafana", "Datadog", "New Relic", "Splunk", "ELK Stack", "Logstash",
  "Kibana", "OpenTelemetry", "Jaeger", "Zipkin", "Sentry", "Dynatrace", "AppDynamics",
  "VictorOps", "PagerDuty", "Winston", "Morgan",

  // ============================================
  // 9. MESSAGING, QUEUES & STREAMING
  // ============================================
  "Apache Kafka", "Kafka", "RabbitMQ", "Apache Pulsar", "Pulsar", "ActiveMQ",
  "Amazon SQS", "Amazon SNS", "Redis Pub/Sub", "NATS", "Celery", "Amazon EventBridge",
  "EventBridge", "Kafka Connect", "Kafka Streams", "ZeroMQ",

  // ============================================
  // 10. DATA ENGINEERING, BIG DATA & PIPELINES
  // ============================================
  "Apache Spark", "Spark", "PySpark", "Apache Flink", "Flink", "Apache Hadoop", "Hadoop",
  "Apache Airflow", "Airflow", "Prefect", "Dagster", "dbt", "Apache Beam", "Luigi",
  "Pandas", "NumPy", "Polars", "SciPy", "ETL", "ELT", "Data Pipeline", "Data Lake", "Data Warehouse",

  // ============================================
  // 11. AI, MACHINE LEARNING, DEEP LEARNING & LLMS
  // ============================================
  "Machine Learning", "Deep Learning", "Natural Language Processing", "NLP", "Computer Vision",
  "Artificial Intelligence", "AI", "TensorFlow", "PyTorch", "Keras", "Scikit-learn",
  "XGBoost", "LightGBM", "Hugging Face", "Transformers", "LangChain", "LlamaIndex",
  "Vector Database", "Pinecone", "Weaviate", "Milvus", "ChromaDB", "Qdrant", "OpenAI API",
  "OpenAI", "Anthropic", "Large Language Models", "LLM", "LLMs", "RAG", "Retrieval-Augmented Generation",
  "Fine-tuning", "Prompt Engineering", "Stable Diffusion", "Ollama", "vLLM", "BERT", "GPT",

  // ============================================
  // 12. TESTING, QA & AUTOMATION
  // ============================================
  "Jest", "Vitest", "Mocha", "Chai", "Jasmine", "Cypress", "Playwright", "Selenium",
  "Puppeteer", "Testing Library", "React Testing Library", "JUnit", "PyTest", "TestNG",
  "RSpec", "Postman", "Newman", "k6", "JMeter", "Gatling", "SonarQube", "MockMvc",

  // ============================================
  // 13. MOBILE & CROSS-PLATFORM
  // ============================================
  "React Native", "Flutter", "SwiftUI", "Objective-C", "Android SDK", "Jetpack Compose",
  "Expo", "Ionic", "Cordova", "Capacitor", "Electron", "Tauri", "MAUI", "Xamarin",

  // ============================================
  // 14. SECURITY, IDENTITY & ACCESS
  // ============================================
  "OAuth", "OAuth 2.0", "OAuth2", "OpenID Connect", "OIDC", "JWT", "JSON Web Tokens",
  "SAML", "SSO", "Single Sign-On", "Keycloak", "Auth0", "Okta", "NextAuth", "NextAuth.js",
  "OWASP", "Penetration Testing", "SSL", "TLS", "HTTPS", "Public Key Infrastructure", "PKI",
  "Zero Trust", "CORS", "CSRF", "XSS", "IAM",

  // ============================================
  // 15. ARCHITECTURE, METHODOLOGIES & PRACTICES
  // ============================================
  "Microservices", "Microservices Architecture", "Monolithic Architecture", "Monolith",
  "Serverless", "Distributed Systems", "Event-Driven Architecture", "EDA", "CQRS",
  "Domain-Driven Design", "DDD", "Test-Driven Development", "TDD", "Behavior-Driven Development",
  "BDD", "Agile", "Scrum", "Kanban", "Pair Programming", "Code Review", "CI/CD",
  "Continuous Integration", "Continuous Delivery", "Continuous Deployment", "DevOps",
  "Git", "GitHub", "GitLab", "Bitbucket", "SVN"
];

/**
 * Matches known vocabulary against arbitrary text using word-boundary regex.
 * Automatically prioritizes multi-word compounds over single words.
 */
export function extractFromVocabulary(text: string): string[] {
  if (!text) return [];

  const found = new Set<string>();

  // Iterate through vocabulary with word boundaries
  for (const skill of COMMON_TECH_VOCABULARY) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9#+])${escaped}(?=[^a-zA-Z0-9#+]|$)`, "i");
    if (regex.test(text)) {
      found.add(skill);
    }
  }

  return Array.from(found);
}
