# System Architecture & Detailed Design Specification (HLD & LLD)
## MatchEngine: AI-Assisted Deterministic Resume vs. Job Description Matcher

---

## 1. Executive Summary & Design Philosophy

**MatchEngine** is an enterprise-grade recruitment analytics system that matches candidate resumes against job descriptions (JDs) with explainable, repeatable, and mathematically verified scoring.

### The Fundamental Architectural Dilemma
Recruiting tools that rely solely on generative AI to evaluate candidates suffer from three catastrophic production flaws:
1. **Hallucination & Inconsistency:** The exact same candidate might get an 85% match on one call and a 42% match on the next.
2. **Opacity (Black Box Problem):** Generative AI cannot prove or audit how it arrived at a final percentage score, exposing companies to compliance and bias risks.
3. **Vendor Outage Downtime:** If the third-party LLM provider experiences latency, rate limiting, or an outage, the platform goes down completely.

### The MatchEngine Solution: Hybrid Architecture
MatchEngine solves this through a strict separation of concerns:
* **AI for Semantic Extraction Only:** High-speed LLMs (Groq LPU / Google Gemini) convert unstructured natural language into structured JSON objects (skills, years of experience, requirements, and preferred qualifications).
* **Deterministic Code for Scoring & Verification:** A zero-hallucination TypeScript mathematical engine handles synonym normalization, parenthetical unpacking, adjacent skill credit, seniority banding, production depth verification, and dealbreaker constraint gating.
* **Resilient Cascade Fallback:** If all external AI APIs fail or are unconfigured, local deterministic regex and structural extractors execute in `0ms` offline, guaranteeing **zero downtime**.

```mermaid
flowchart LR
    A["Raw Resume (PDF/DOCX) + Job Description"] --> B["Tiered AI Extraction Harness<br/>(Groq LPU -> Gemini Flash -> Local Regex)"]
    B --> C["Structured JSON Schema<br/>(Skills, Experience, Requirements)"]
    C --> D["Deterministic 5-Dimension Scoring Engine<br/>(Normalizer, Clusters, Production Depth, Gate)"]
    D --> E["Auditable Match Report & Quoted Evidence"]
```

---

## 2. High-Level Design (HLD)

### 2.1 System Architecture

The following diagram illustrates the end-to-end architecture from the client browser through Next.js 16 server-side route handlers, parsing subsystems, resilient AI extractors, and the scoring pipeline:

```mermaid
graph TD
    subgraph ClientLayer ["Client Layer (Browser)"]
        UI["Next.js 16 / React 19 Frontend UI"]
        Ctx["AnalysisContext (SessionStorage Hydration)"]
        UI --> Ctx
    end

    subgraph IngestionLayer ["API Ingestion & Validation Layer"]
        API["POST /api/analyze"]
        MIMEValidator["MIME & Magic Header Validator (%PDF-, DOCX)"]
        PayloadCheck["Payload Size & Empty Check (<= 5MB)"]
        API --> MIMEValidator --> PayloadCheck
    end

    subgraph TextExtraction ["Text Extraction Subsystem (In-Memory)"]
        PDFParser["parsePDF() via pdf-parse"]
        DOCXParser["mammoth.extractRawText()"]
        PayloadCheck -->|PDF| PDFParser
        PayloadCheck -->|DOCX| DOCXParser
    end

    subgraph AIHarness ["Multi-Tier Resilient AI Extraction Harness"]
        direction TB
        Tier1["Tier 1: Groq Cloud LPU<br/>(qwen/qwen3.8-27b ~200ms)"]
        Tier2["Tier 2: Google Gemini<br/>(gemini-2.5-flash / 2.0-flash ~800ms)"]
        Tier3["Tier 3: Local Regex Structurer<br/>(Structural Section Extractor + Vocabulary 0ms)"]
        
        Tier1 -->|Timeout / RateLimit| Tier2
        Tier2 -->|Failure / Offline| Tier3
    end

    subgraph ScoringEngine ["5-Dimension Deterministic Scoring Engine"]
        Dim1["Dim 1: Semantic Normalization & Parenthetical Unpacking"]
        Dim2["Dim 2: Adjacent Skill Clustering (0.5 Partial Credit)"]
        Dim3["Dim 3: Seniority Banding (Aligned / Stretch Penalty)"]
        Dim4["Dim 4: Production Depth Multiplier (1.2x + Quoted Bullets)"]
        Dim5["Dim 5: Dynamic Weight Redistribution & Dealbreaker Gate"]
        
        Dim1 --> Dim2 --> Dim3 --> Dim4 --> Dim5
    end

    subgraph ResponseLayer ["Response & Reporting Layer"]
        JSONResp["JSON Response: ScoreAnalysisResult + StructuredData"]
        ResultUI["Results View: Match Badges, Quoted Evidence, Actionable Tips"]
    end

    ClientLayer -->|Multipart FormData| IngestionLayer
    TextExtraction -->|Clean Extracted Text| AIHarness
    AIHarness -->|Structured JSON Objects| ScoringEngine
    ScoringEngine --> JSONResp
    JSONResp --> Ctx
    Ctx --> ResultUI
```

---

### 2.2 Key Architectural Components

| Component | Responsibility | Technology Stack |
|---|---|---|
| **Client Frontend** | Interactive file upload, drag-and-drop, state preservation, radar/badge visualization, evidence review | Next.js 16 (App Router), React 19, Vanilla CSS & TailwindCSS v4 |
| **API Route Handler** | Multipart form processing, magic header validation, size gating, parallel execution orchestration | [src/app/api/analyze/route.ts](file:///c:/Users/pratham%20verma/OneDrive/Desktop/FULLSTACK/PROJECTS/Resume%20vs%20JD/resume-vs-jd/src/app/api/analyze/route.ts) |
| **Document Parsers** | In-memory binary buffer decoding, magic header signature verification (`%PDF-`), XML parsing for Word docx | `pdf-parse`, `mammoth` |
| **Extraction Harness** | 3-tier cascade fallback mechanism with strict 4000ms timeout race and JSON schema sanitization | [src/lib/ai/extraction-harness.ts](file:///c:/Users/pratham%20verma/OneDrive/Desktop/FULLSTACK/PROJECTS/Resume%20vs%20JD/resume-vs-jd/src/lib/ai/extraction-harness.ts) |
| **AI Providers** | Ultra-low latency LLM inference with structured JSON formatting mode | Groq Cloud SDK (`groq-sdk`), Google GenAI SDK (`@google/genai`) |
| **Local Deterministic Fallback** | Header regex tokenizers, section boundary extractors, 400+ technology vocabulary dictionary | [src/lib/parser/jd-parser.ts](file:///c:/Users/pratham%20verma/OneDrive/Desktop/FULLSTACK/PROJECTS/Resume%20vs%20JD/resume-vs-jd/src/lib/parser/jd-parser.ts), [src/lib/parser/resume-structurer.ts](file:///c:/Users/pratham%20verma/OneDrive/Desktop/FULLSTACK/PROJECTS/Resume%20vs%20JD/resume-vs-jd/src/lib/parser/resume-structurer.ts) |
| **Scoring & Match Engine** | Normalization, Jaro-Winkler similarity, skill taxonomy tiers, adjacent credit, seniority penalty, dealbreaker gates | [src/lib/scoring/score-engine.ts](file:///c:/Users/pratham%20verma/OneDrive/Desktop/FULLSTACK/PROJECTS/Resume%20vs%20JD/resume-vs-jd/src/lib/scoring/score-engine.ts) |

---

### 2.3 Non-Functional Requirements (NFRs)

1. **Deterministic Repeatability:** The scoring engine given identical extracted inputs will compute the exact same overall match score, breakdown, and evidence quotes 100% of the time ($P = 1.0$).
2. **High Availability (Zero Downtime):** External API rate-limits, revoked keys, or provider outages trigger instantaneous fallback to Tier 3 local parsers without returning 500 errors to the client.
3. **Execution Latency:**
   - Groq inference: $\approx 180\text{ms} - 350\text{ms}$
   - Gemini Flash inference: $\approx 600\text{ms} - 1200\text{ms}$
   - Local fallback: $\le 15\text{ms}$
   - Total request cycle: $\le 1.5\text{s}$ under typical network conditions.
4. **Data Privacy & Zero Persistence:** Resumes and JDs are processed purely in-memory (`Buffer`). No candidate data, PII, or uploaded documents are ever persisted to disk or external databases.

---

## 3. Low-Level Design (LLD)

### 3.1 Data Models & Schemas

The system enforces strict type contracts across the backend and frontend defined in [src/types/analysis.ts](file:///c:/Users/pratham%20verma/OneDrive/Desktop/FULLSTACK/PROJECTS/Resume%20vs%20JD/resume-vs-jd/src/types/analysis.ts):

```mermaid
classDiagram
    class StructuredResume {
        +string[] skills
        +number yearsOfExperience
        +string email
        +string phone
        +string rawText
    }

    class JDExtractedData {
        +string role
        +string[] responsibilities
        +string[] technical_req
        +string[] preferred_skills
        +string[] education
        +number minYearsExperience
    }

    class AdjacentSkillMatch {
        +string requiredSkill
        +string matchedCandidateSkill
        +string family
        +number partialCredit
    }

    class SkillEvidenceDetail {
        +string skill
        +boolean isMatched
        +boolean isAdjacent
        +string evidenceQuote
        +boolean isProductionDepth
        +string weightTier
        +number weightMultiplier
    }

    class ScoringBreakdown {
        +number coreWeight
        +number preferredWeight
        +number adjacentWeight
        +number seniorityWeight
        +number coreRequiredScore
        +number preferredScore
        +number adjacentScore
        +number seniorityScore
        +number evidenceDepthBonus
        +boolean isPreferredRedistributed
        +boolean dealbreakerCapApplied
        +string capReason
    }

    class ScoreAnalysisResult {
        +number overallScore
        +string matchLevel
        +number technicalMatchScore
        +number preferredMatchScore
        +string[] matchingSkills
        +string[] missingRequiredSkills
        +string[] missingPreferredSkills
        +AdjacentSkillMatch[] adjacentMatches
        +SkillEvidenceDetail[] evidenceDetails
        +string[] recommendations
        +SeniorityMatch seniorityMatch
        +ScoringBreakdown scoringBreakdown
    }

    ScoreAnalysisResult *-- AdjacentSkillMatch
    ScoreAnalysisResult *-- SkillEvidenceDetail
    ScoreAnalysisResult *-- ScoringBreakdown
```

---

### 3.2 End-to-End Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as User / Browser
    participant API as POST /api/analyze
    participant Parser as In-Memory Document Parser
    participant Harness as AI Extraction Harness
    participant Provider as Groq / Gemini APIs
    participant Engine as Deterministic Scoring Engine
    participant Session as Client SessionStorage

    Candidate->>API: Upload Resume (.pdf/.docx) + Job Description
    API->>API: Validate file size (<=5MB) & magic bytes (%PDF-)
    alt Invalid format or empty
        API-->>Candidate: 400 / 415 / 422 JSON Error
    end

    API->>Parser: parsePDF(buffer) or mammoth.extractRawText(buffer)
    Parser-->>API: cleanResumeText, pageCount

    par Parallel AI Extraction
        API->>Harness: extractResumeWithHarness(cleanResumeText)
        API->>Harness: extractJobDescriptionWithHarness(cleanJDText)
        Harness->>Provider: Request JSON Extraction (4000ms timeout)
        alt Provider Failure / Timeout
            Harness->>Harness: Fallback to local regex structurer (0ms)
        end
        Provider-->>Harness: Structured JSON
        Harness-->>API: StructuredResume, JDExtractedData
    end

    API->>Engine: calculateScore(structuredResume, parsedJD)
    Note over Engine: Unpack parens -> Cluster match -> Seniority band -> Production depth -> Gate check
    Engine-->>API: ScoreAnalysisResult
    API-->>Candidate: 200 OK (AnalyzeApiResponse)
    Candidate->>Session: queueMicrotask(save to sessionStorage)
    Candidate->>Candidate: Render Interactive Score Dashboard
```

---

## 4. Algorithms & Mathematical Specifications

### 4.1 Dimension 1: Semantic Normalization & Parenthetical Unpacking

Candidate resumes frequently group technologies using parenthetical notations (e.g., `"AWS (S3, Lambda, EC2)"` or `"Apache Airflow (DAGs, ETL)"`). Standard keyword matchers fail on these strings.

**The Solution:** [extractParentheticalSkills()](file:///c:/Users/pratham%20verma/OneDrive/Desktop/FULLSTACK/PROJECTS/Resume%20vs%20JD/resume-vs-jd/src/lib/skills/normalizer.ts#L106):
1. Detects parenthetical groups: `/([a-zA-Z0-9\s.+#/-]+)\s*\(([^)]+)\)/g`.
2. Emits both the root technology (`"AWS"`, `"Airflow"`) and the nested items (`"S3"`, `"Lambda"`, `"EC2"`, `"Airflow DAGs"`).
3. Canonicalizes strings via [normalizeSkill()](file:///c:/Users/pratham%20verma/OneDrive/Desktop/FULLSTACK/PROJECTS/Resume%20vs%20JD/resume-vs-jd/src/lib/skills/normalizer.ts#L43):
   * Strips non-alphanumeric punctuation (except `+` and `#` to preserve `C++` and `C#`).
   * Resolves common synonyms and abbreviations (`k8s` $\rightarrow$ `kubernetes`, `postgres` $\rightarrow$ `postgresql`, `aws` $\rightarrow$ `amazon web services`).
   * Applies Jaro-Winkler similarity ($threshold \ge 0.88$) for typo tolerance.

---

### 4.2 Dimension 2: Cross-Family Adjacent Skill Clustering

A candidate missing an exact required tool (e.g., Kafka) who has extensive experience in an equivalent tool from the exact same architectural cluster (e.g., RabbitMQ) is awarded **50% partial credit** ($0.5$).

The clusters are defined in [src/lib/skills/skill-clusters.ts](file:///c:/Users/pratham%20verma/OneDrive/Desktop/FULLSTACK/PROJECTS/Resume%20vs%20JD/resume-vs-jd/src/lib/skills/skill-clusters.ts):

| Family | Clustered Technologies |
|---|---|
| **Message Brokers / Event Streaming** | Kafka, RabbitMQ, ActiveMQ, Pulsar, SQS, SNS, NATS |
| **Relational SQL Databases** | PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, SQLite |
| **NoSQL / Document Stores** | MongoDB, CouchDB, DynamoDB, Cassandra, Firestore, DocumentDB |
| **In-Memory Caches** | Redis, Memcached, Hazelcast, Dragonfly |
| **Container Orchestration** | Kubernetes, Nomad, Docker Swarm, OpenShift, ECS |
| **CI/CD Automation** | GitHub Actions, GitLab CI, Jenkins, CircleCI, ArgoCD, Tekton |
| **Infrastructure as Code** | Terraform, CloudFormation, Pulumi, Ansible |
| **Vector Databases** | Pinecone, Weaviate, Qdrant, Chroma, Milvus, pgvector |
| **Observability / Telemetry** | Prometheus, Grafana, Datadog, New Relic, Jaeger, OpenTelemetry |

**Mathematical Formulation:**
For any missing required skill $R_i$, if candidate possesses $C_j \in \text{Family}(R_i)$, then:
$$\text{MatchedWeight}(R_i) = \text{TierWeight}(R_i) \times 0.5$$

---

### 4.3 Dimension 3: Seniority & Experience Banding

Rather than applying a binary fail/pass for years of experience, MatchEngine evaluates the ratio:
$$\rho = \frac{\text{Candidate Years}}{\text{Required Years}}$$

```mermaid
graph LR
    A["Experience Ratio (ρ)"] -->|ρ >= 1.0| B["Aligned (100% Score)"]
    A -->|0.75 <= ρ < 1.0| C["Borderline (80% Score)"]
    A -->|0.50 <= ρ < 0.75| D["Stretch (50% Score)"]
    A -->|ρ < 0.50| E["Significant Stretch (20% Score)"]
```

* **Candidate Claim Cap:** To prevent resume spam from breaking calculations, self-claimed experience is clamped to $\le 40$ years:
$$\text{Years} = \min(40, \text{ExtractedYears})$$

---

### 4.4 Dimension 4: Production Depth Multiplier & Quoted Proof

If a matched skill is evidenced by action verbs and production metrics in the candidate's resume bullet points, the skill receives a **1.2x weighted boost**, and the exact sentence is extracted as verified proof for the recruiter.

**Detection Rules** ([detectProductionDepth](file:///c:/Users/pratham%20verma/OneDrive/Desktop/FULLSTACK/PROJECTS/Resume%20vs%20JD/resume-vs-jd/src/lib/scoring/score-engine.ts#L66)):
1. Bullet contains the normalized skill token.
2. Bullet contains at least one **Production Action Indicator**:
   * *Architecture verbs:* `architected`, `engineered`, `scaled`, `optimized`, `deployed`, `refactored`, `orchestrated`, `migrated`.
   * *Production nouns:* `production`, `high availability`, `low latency`, `ci/cd`, `microservices`, `fault tolerant`, `distributed`.
   * *Scale metrics:* Quantifiable numbers (`100k`, `10M`, `99.9%`, `200ms`, `5x`, `reduced latency by`).
3. Sentence is trimmed and cited in `evidenceDetails.evidenceQuote`.

---

### 4.5 Dimension 5: Dynamic Weight Redistribution & Dealbreaker Gate

#### 1. Dynamic Weight Redistribution (Solving the Sofia Dilution Bug)
When a Job Description contains no preferred/nice-to-have qualifications, treating the preferred section as 0% causes artificial score dilution.
* **Standard Case (JD has Preferred Skills):**
  * Core Required Skills: $60\%$
  * Preferred Skills: $15\%$
  * Seniority Band: $15\%$
  * Evidence Depth Bonus: Up to $+10\%$
* **Redistributed Case (JD has No Preferred Skills):**
  * Preferred weight dynamically collapses to $0\%$.
  * Core Required Skills expands to $75\%$.
  * Seniority Band expands to $25\%$.
  * Result: Scores are mathematically honest without artificial penalty.

#### 2. Dealbreaker Constraint Gate
If a role requires primary backend or systems programming languages (e.g., Python, Go, Java, TypeScript, C++, Rust), and the candidate has **none of them**:
$$\text{OverallScore} = \min(\text{ComputedScore}, 55\%)$$
A warning banner is attached to the report:
> *"Candidate lacks all required primary programming languages. Match score is capped at 55%."*

---

## 5. Failure Modes & Fault Tolerance Matrix

| Failure Scenario | Detection Mechanism | Mitigation Strategy | Output Guarantee |
|---|---|---|---|
| **Empty File Upload** | `resume.size === 0` | Immediate HTTP 400 rejection with explicit guidance | Safe rejection |
| **Oversized Upload** | `resume.size > 5MB` | HTTP 413 rejection before buffer allocation | Memory denial protection |
| **Corrupted PDF** | Missing `%PDF-` header signature | Fast-fail header inspection before calling parser | HTTP 422 with actionable message |
| **Scanned / Image PDF** | Extracted text length $< 20$ chars | Readability check detects image scan without OCR | HTTP 422 prompting selectable text |
| **Groq API Rate-Limit (429)** | SDK exception / HTTP 429 response | Seamless cascade to Tier 2 (Google Gemini Flash) | Zero user-visible error |
| **Gemini Outage / Timeout** | 4000ms `Promise.race` timeout | Cascades to Tier 3 (Deterministic Regex Structurer) | Guaranteed response within 4s |
| **Malformed LLM JSON Output** | `JSON.parse` exception | `sanitizeJsonString()` strips markdown fence blocks; falls back to Tier 3 on parse error | Clean JSON output guaranteed |
| **Browser Reload on Results** | Active memory state loss | `AnalysisContext` session hydration from `sessionStorage` | Report preserved without re-upload |

---

## 6. Directory Structure & File Map

```
resume-vs-jd/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       └── route.ts            # Next.js API Route Handler (Ingestion & Pipeline)
│   │   ├── page.tsx                    # Landing & File Upload UI
│   │   ├── results/
│   │   │   └── page.tsx                # Results Dashboard
│   │   └── layout.tsx                  # Global Root Layout
│   ├── components/
│   │   ├── AnalysisResult.tsx          # Match Score Dashboard & Evidence Badges
│   │   ├── FileUpload.tsx              # Drag-and-drop File Upload
│   │   └── JobDescriptionInput.tsx     # Text area & File toggle for JD
│   ├── context/
│   │   └── AnalysisContext.tsx         # Global Context with Session Storage Hydration
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── extraction-harness.ts   # 3-Tier Resilient AI Extraction Harness
│   │   │   ├── groq-client.ts          # Groq Cloud SDK Client (Tier 1)
│   │   │   ├── gemini-client.ts        # Google Gemini SDK Client (Tier 2)
│   │   │   └── prompts.ts              # System Prompts & JSON Schema Contracts
│   │   ├── parser/
│   │   │   ├── pdf-parser.ts           # In-Memory Buffer PDF Parser
│   │   │   ├── jd-parser.ts            # Local Deterministic JD Regex Parser (Tier 3)
│   │   │   ├── resume-structurer.ts    # Local Deterministic Resume Structurer (Tier 3)
│   │   │   └── structural-extractor.ts # Header & Bullet Segmentation Engine
│   │   ├── scoring/
│   │   │   └── score-engine.ts         # 5-Dimension Deterministic Scoring Engine
│   │   └── skills/
│   │       ├── normalizer.ts           # Jaro-Winkler, Punctuation & Synonym Normalizer
│   │       ├── skill-clusters.ts       # Adjacent Skill Families & Partial Credit
│   │       └── skills-dictionary.ts    # 400+ Technology Vocabulary Corpus
│   └── types/
│       └── analysis.ts                 # Unified TypeScript Interfaces & Type Contracts
├── scripts/
│   └── verify-smart-parsing.ts         # Automated 21-Scenario Verification Suite
└── docs/
    └── architecture/
        └── HLD_LLD_SYSTEM_DESIGN.md    # This Document
```

---

## 7. Verification & Compliance Suite

To verify that the implementation adheres to the HLD and LLD specifications, the project includes an automated test harness ([scripts/verify-smart-parsing.ts](file:///c:/Users/pratham%20verma/OneDrive/Desktop/FULLSTACK/PROJECTS/Resume%20vs%20JD/resume-vs-jd/scripts/verify-smart-parsing.ts)) that tests:
1. **Acronym Resolution:** `AWS` $\leftrightarrow$ `Amazon Web Services` ($100\%$ match).
2. **Punctuation Stripping:** `Node.js` $\leftrightarrow$ `NodeJS` ($100\%$ match).
3. **Unlisted Emerging Skills:** `Pinecone`, `Supabase` dynamic header extraction ($100\%$ match).
4. **Synonym Equivalence:** `Containerization experience` $\leftrightarrow$ `Docker` ($100\%$ match).
5. **Typo Tolerance:** `PostgreSql` $\leftrightarrow$ `Postgres` ($100\%$ match).
6. **Complex Layout Extraction:** Sub-headers, nested bullets, multi-category groupings ($100\%$ match).
7. **Adversarial / Corrupted Input:** Random strings, zero requirements ($0\%$ match).
8. **Adjacent Clustering:** `RabbitMQ` fulfills `Kafka` requirement ($90\%$ score with $0.5$ credit).
9. **Parenthetical Unpacking:** `Airflow (DAGs, ETL)` unpacked into separate atomic skills ($100\%$ match).
10. **Dealbreaker Gate:** Candidate lacking primary programming languages capped at $\le 55\%$.

*All 21 test scenarios execute via `npm test` and pass with 0 failures.*
