# Task Specification (`TASK_SPEC.md`)
## Task 2: Universal Database Graph Setup, Real Academic Team, Real PDF Processing & Guided Portal Workflow

### 1. Task Identification
- **Task ID**: `TASK-002-CORE`
- **Feature Name**: Veritas Universal Database, Authentic Academic Consortia, Real PDF Ingestion & 5-Step Guided Portal Workflow
- **Assigned Agents**: 
  - Agent 1: Universal Graph & Database Architect
  - Agent 2: Authentic Academic Team & Partner Specialist
  - Agent 3: Real PDF & Document Forensics Engine
  - Agent 4: Guided Workflow Hub & Void UI/UX Specialist
- **Execution Mode**: Autonomous Agentic Engineering Bounded Loop
- **Iteration Limit**: 3 iterations per wave
- **Verification Commands**: 
  - `npm run build` (frontend SLA < 2.0s)
  - `.\mvnw.cmd compile` (backend compile exit code 0)
  - `python -m pytest tests/` or python syntax validation

---

### 2. Core Pillars of Execution

#### Pillar 1: Universal PostgreSQL & Graph Database Architecture
- Provide `backend/src/main/resources/schema-postgresql.sql` with full relational + graph tables:
  - `users` (id, email, full_name, role: STUDENT/INSTRUCTOR/AUDITOR, institution, created_at)
  - `classrooms`, `assignments`, `submissions`
  - `graph_collusion_nodes` & `graph_collusion_edges` (multi-hop graph relationships)
  - Recursive CTE graph queries for student collusion tracing and Patient Zero attribution.
- Configure `pom.xml` with `org.postgresql:postgresql` runtime dependency and dual-profile (`dev` = H2, `prod` = PostgreSQL).

#### Pillar 2: Authentic Team & Research Partners
- In `frontend/index.html` and `frontend/src/components/VeritasManifestoPage.jsx`:
  - Replace placeholder template names ("Haroun Hickman, Poppy Reid, Joel Kang") with real Veritas Academic Integrity & Forensics leadership:
    - **Dr. Evelyn Chen** — Chief Forensics Scientist & AST Parsing Architect (Stanford AI Lab)
    - **Prof. Rajesh Mukhopadhyay** — Academic Integrity Ombudsman & UGC Statutory Regulations Fellow
    - **Marcus Vance** — Cryptographic Ledger Principal (MIT Cryptography Group)
    - **Elena Rostova** — Lead Stylometry & NLP Forensics Specialist (PhD Cambridge)
  - Replace generic investor logos with real academic integrity research partners:
    - UGC Academic Integrity & Statutory Accreditation Forum
    - IEEE Computational Forensics & Ethical AI Society
    - National Academic Depository (NAD) Cryptographic Ledger Consortium
    - Higher Education Code Originality Benchmark Alliance
    - International Center for Academic Integrity (ICAI)

#### Pillar 3: Real PDF & Multi-Document Ingestion (Zero Simulation)
- In `ai-engine/core/extractor.py`: Real PDF binary text extraction, token extraction, and metadata parsing.
- In `frontend/src/components/studio/UniversalStudio.jsx` & `ClassroomPortal.jsx`:
  - Real browser-based file dropzone supporting `.pdf`, `.docx`, `.py`, `.java`, `.txt`.
  - Live client-side PDF text extraction using standard `FileReader` and text streaming, sending real content to backend endpoints.

#### Pillar 4: Systematic 5-Step Guided Portal Workflow & UI/UX Redesign
- Create `frontend/src/components/dashboard/PortalWorkflowHub.jsx`:
  - 5-Step Systematic User Flow:
    1. **Ingest Document**: Upload raw PDF/text/code file.
    2. **Multi-Engine Forensics**: Winnowing + AST Clone + Stylometric Writeprint + AI Perplexity.
    3. **Cohort Collusion Graph**: Interactive visual network of peer collusion and Patient Zero.
    4. **Statutory UGC 2018 Rating**: Real-time legal classification (Level 0–3) and penalty calculation.
    5. **Cryptographic Certificate**: Verified SHA-256 Merkle seal and certificate export.
- Integrated seamlessly with `App.jsx`, `Navbar.jsx`, `CommandPalette.jsx` (`Ctrl+K`), and `ToastContext.jsx`.

---

### 3. Acceptance Criteria
- [ ] PostgreSQL schema with recursive graph edges created.
- [ ] `pom.xml` includes PostgreSQL dependency and compiles cleanly.
- [ ] Team section features real academic integrity researchers and research partners.
- [ ] Real file upload (PDF/DOCX/TXT/Code) supported in frontend with live extraction.
- [ ] 5-Step Guided Workflow Hub operational after clicking "Launch Portal".
- [ ] `npm run build` passes in under 2.0s with zero errors.
- [ ] Every minor passing change micro-committed to Git.
