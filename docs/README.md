# 📚 MatchEngine Documentation Hub

> Complete architectural blueprints, implementation reports, and engineering guides for MatchEngine.

---

## 📁 Documentation Map

### 1. Implementation Guides & Reports (`docs/implementation/`)
* [**`ADVANCED_SCORING_AND_SEMANTIC_MATCHING_REPORT.md`**](./implementation/ADVANCED_SCORING_AND_SEMANTIC_MATCHING_REPORT.md)  
  *Execution report of the 5-Dimension Scoring Engine: adjacent/transferable skills (0.5 credit), parenthetical unpacking, banded seniority fit, evidence depth quotes (+1.2x boost), dynamic weight redistribution ($N/A \neq 0$), and dealbreaker gates.*
* [**`AI_EXTRACTION_HARNESS_IMPLEMENTATION_REPORT.md`**](./implementation/AI_EXTRACTION_HARNESS_IMPLEMENTATION_REPORT.md)  
  *Execution report of the AI Extraction Harness: architecture review, Groq LPU client, prompt engineering, zero-downtime fallback, test suite verification, and build validation.*
* [**`AI_EXTRACTION_HARNESS_IMPLEMENTATION_GUIDE.md`**](./implementation/AI_EXTRACTION_HARNESS_IMPLEMENTATION_GUIDE.md)  
  *The architectural guide for implementing the AI Extraction Harness (AI as the Sensor + Code as the Governor), including Gemini 1.5 Flash integration, JSON schemas, environment setup, and zero-downtime regex fallbacks.*
* [**`BACKEND_IMPLEMENTATION_REPORT.md`**](./implementation/BACKEND_IMPLEMENTATION_REPORT.md)  
  *Detailed implementation log of Phase 1 (Anti-collision & 500+ tech taxonomy), Phase 2 (3-tier skill weighting), and Phase 3 (Seniority timeline merging & `.docx` Word parser).*
* [**`SMART_PARSING_IMPLEMENTATION_GUIDE.md`**](./implementation/SMART_PARSING_IMPLEMENTATION_GUIDE.md)  
  *Reference guide for local structural and semantic fallback parsing mechanisms.*

---

### 2. Architecture & Roadmaps (`docs/architecture/`)
* [**`HLD_LLD_SYSTEM_DESIGN.md`**](./architecture/HLD_LLD_SYSTEM_DESIGN.md)  
  *Comprehensive High-Level Design (HLD) and Low-Level Design (LLD) system specification, sequence diagrams, class models, mathematical formulas, fault tolerance matrix, and directory map.*
* [**`HYBRID_AI_ARCHITECTURE_AND_HARNESS_GUIDE.md`**](./architecture/HYBRID_AI_ARCHITECTURE_AND_HARNESS_GUIDE.md)  
  *System design overview of the 3-Tier Layered Architecture: Sensor (Extraction) $\rightarrow$ Governor (Scoring) $\rightarrow$ Copilot (Results & Guidance).*
* [**`BACKEND_FLAWS_AND_FIXES_ROADMAP.md`**](./architecture/BACKEND_FLAWS_AND_FIXES_ROADMAP.md)  
  *The technical audit cataloging the edge-case flaws, collision traps, and resolution roadmaps.*
