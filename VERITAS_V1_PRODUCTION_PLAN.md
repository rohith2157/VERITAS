# VERITAS ENTERPRISE INTEGRITY PLATFORM
## Master Execution Plan: From 95% Implementation to Production-Ready v1.0

**Document Classification:** Production Execution Plan & 7-Agent Synchronization Protocol  
**Repository:** https://github.com/rohith2157/VERITAS  
**Protocols:** `/agentic-engineering` (DO-178C / ASD-STE100) | `/ars-plan` | `/plan-eng-review` | `/design-review` | `/pair-agent`  
**Target Release:** VERITAS v1.0 (Production Deployed, Tested, Documented & Demonstrable)  

---

## 1. Executive Mission & 7-Agent Division of Work

To transition Veritas from 95% prototype to 100% production-ready v1.0, the engineering tasks are partitioned across seven specialized autonomous roles synchronized via the `AIRCRAFT_COMMUNICATION_PROTOCOL.md` barrier protocol:

```
┌────────────────────────────────────────────────────────────────────────┐
│             Root Agent / Orchestrator (Antigravity ACP)                │
└──────┬────────────┬────────────┬───────────┬───────────┬───────────┬───┘
       │            │            │           │           │           │
       ▼            ▼            ▼           ▼           ▼           ▼
   [Agent 1]    [Agent 2]    [Agent 3]   [Agent 4]   [Agent 5]   [Agent 6 & 7]
   Core & DB    Forensics     Void UI     Studio     Telemetry   QA & Deploy
   Spring Boot  SBERT/FAISS   React 19    6 Views    Bridge      Render/Docs
```

### Agent Roles & Work Breakdown

| Agent # | Role Title | Core Responsibilities & Deliverables | Barrier Synchronization Checkpoint |
| :--- | :--- | :--- | :--- |
| **Agent 1** | **Enterprise Core & Database Architect** | Spring Boot 3, persistent PostgreSQL (disable silent H2 in prod), RBAC user auth & tenant isolation, Merkle ledger persistence. | `GATE-CORE-PERSISTENCE`: PostgreSQL connects, H2 used strictly for dev/test fallback, user auth APIs active. |
| **Agent 2** | **Algorithmic Forensics & AST Specialist** | Python FastAPI, real SBERT model pipeline with caching, real CPU `faiss` indexing & persistence, genuine `javalang` AST parser. | `GATE-AI-REAL-MODELS`: SBERT returns 384-d vectors, FAISS queries index files, `javalang` normalizes Java AST. |
| **Agent 3** | **Void UI & Dashboard Shell Engineer** | React 19 UI shell, responsive design polish, auth state handling, role-based view routing, accessible form workflows. | `GATE-UI-SHELL`: Clean production build under 1.0s, dark/light theme persistence, auth role gating. |
| **Agent 4** | **Universal Studio & Diff Inspector** | Universal Studio 6 forensic tabs, real backend data binding, eliminate decorative-only charts, live diff line offset highlighting. | `GATE-STUDIO-ENDPOINTS`: All 6 tabs consume live FastAPI and Spring Boot endpoints with zero simulated values. |
| **Agent 5** | **Developer Workstation & Telemetry Bridge** | Live wire playground, cURL generator, cluster health telemetry (:8000, :8080, :5173), microservice latency benchmarking. | `GATE-TELEMETRY`: Round-trip pings verify cluster health with accurate latency metrics. |
| **Agent 6** | **Compliance & Statutory Validator** | UGC 2018 statutory classifications (Levels 0–3), Section 7 exclusions, DPDP Act 2023 minor age-gating & parental consent. | `GATE-COMPLIANCE`: Statutory penalties and privacy workflows validated against statutory checklists. |
| **Agent 7** | **Systems QA & Release Engineer** | End-to-end verification suite, `render.yaml` cloud blueprint with exact CORS allowlist, publication-grade resume-ready `README.md`. | `GATE-V1-RELEASE`: All test suites green, cloud config certified, portfolio documentation complete. |

---

## 2. Six Non-Negotiable Technical Corrections

### Correction A: Real SBERT Embedding Pipeline
* **Issue:** Simulated hash-based projection was used with hardcoded concept taxonomy.
* **Resolution:** In `ai-engine/core/semantic_vector.py`, implement an actual Sentence Transformer / ONNX vector embedding engine. Provide explicit model loading status, embedding caching, batch vector generation, and an explicit, unmasked fallback mode that is documented and never labeled as fake SBERT.

### Correction B: Real CPU FAISS Vector Index
* **Issue:** Vector search used an emulated Python `IVFFlatIndexSDMA` class.
* **Resolution:** In `ai-engine/core/vector_index.py`, bind directly to the installed `faiss-cpu` 1.16.0 library. Implement `faiss.IndexFlatIP` (inner product / cosine similarity), vector insertion, persistence to disk via `faiss.write_index`, index loading via `faiss.read_index`, metadata mapping, and tenant index partitioning.

### Correction C: Genuine Java AST Normalization
* **Issue:** Java code normalization relied on regular expressions rather than an AST parser.
* **Resolution:** In `ai-engine/core/ast_code.py`, utilize the installed `javalang` 0.13.0 package to parse genuine Java Abstract Syntax Trees. Walk compilation units, extract class declarations, method declarations, formal parameters, and local variables, and replace user identifiers with canonical tokens (`JAVA_VAR_1`, `JAVA_METHOD_1`).

### Correction D: Persistent PostgreSQL Production Architecture
* **Issue:** Database silently fell back to an in-memory H2 database whenever PostgreSQL was absent.
* **Resolution:** In `backend/src/main/java/com/veritas/backend/config/DataSourceConfig.java`, enforce persistent PostgreSQL when `SPRING_PROFILES_ACTIVE=prod`. If PostgreSQL is offline in production, throw an explicit configuration error rather than losing records in an ephemeral in-memory database. Keep H2 strictly for test and local dev profiles.

### Correction E: Institutional Compliance Engine & Statutory Evidence
* **Issue:** Statutory classification was hardcoded without reviewable policy workflows.
* **Resolution:** Add reviewable DAIP/IAIP institutional decision workflows in `RubricService.java` and expose statutory checklists in `compliance_ugc.py` and `compliance_dpdp.py`.

### Correction F: Cloud Deployment Hardening & Resume-Ready Portfolio README
* **Issue:** `render.yaml` contained wildcard CORS (`*`), and `README.md` was oriented toward local eclipse setup.
* **Resolution:** Update `render.yaml` with exact origin routing. Rewrite `README.md` into an executive, publication-grade showcase complete with architectural ASCII diagrams, live cloud deployment instructions, API contracts, and video demonstration links.

---

## 3. Seven-Phase Implementation Roadmap

### Phase 0: Baseline Environment & Dependency Alignment
* Verify Python 3.13 / 3.11 compatibility and package dependencies (`faiss-cpu`, `javalang`, `numpy`, `fastapi`).
* Verify Spring Boot Maven compiler and Java 21 LTS runtime.
* Ensure Git working tree is clean.

### Phase 1: Real AI Forensics (SBERT, FAISS, Java AST)
* Update `semantic_vector.py` with dense embeddings, batch inference, and caching.
* Update `vector_index.py` with genuine `faiss-cpu` index persistence and querying.
* Update `ast_code.py` with `javalang` genuine Java AST normalizer.
* Run `pytest` and verify 100% pass rate.

### Phase 2: Enterprise Backend Hardening (PostgreSQL, Auth & Ledger)
* Update `DataSourceConfig.java` to enforce PostgreSQL in production.
* Add authenticated user state and role verification (`STUDENT`, `INSTRUCTOR`, `AUDITOR`, `ADMIN`).
* Ensure Merkle ledger proof verification is strictly persistent.
* Run `.\mvnw.cmd test` and verify 100% pass rate.

### Phase 3: Void UI Shell & Universal Studio Real-Data Wiring
* Bind all 6 tabs in `UniversalStudio.jsx` to live endpoints.
* Eliminate any decorative placeholder values.
* Integrate auth role switcher and persistent user sessions in `AuthContext.jsx`.
* Run `npm run build` and verify sub-second build SLA.

### Phase 4: Compliance & Statutory Governance
* Formalize UGC 2018 Statutory Regulations (Levels 0–3) with Section 7 exclusions.
* Validate DPDP Act 2023 minor age-gating and parental consent endpoints.

### Phase 5: Cloud Deployment Blueprint (`render.yaml`)
* Restrict CORS origins to official Render domains and localhost.
* Validate health checks: `/health` for FastAPI, `/api/studio/health` for Spring Boot.

### Phase 6: End-to-End System Certification
* Execute `scripts/verify_all_live_endpoints.cjs` across all running microservices.
* Record exit codes, timestamps, and commit hashes in `VERIFICATION_REPORT.md`.

### Phase 7: Resume-Ready Documentation (`README.md`)
* Overhaul `README.md` into an institutional, recruiter-ready showcase.
* Add system architecture diagrams, API curl examples, sample test files, and technology breakdown.

---

**Approval:** Antigravity Autonomous Agentic Engineering Orchestrator  
**Status:** ACTIVE | EXECUTING NOW
