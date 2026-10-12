# Task Specification (`TASK_SPEC.md`)
## Task 3: Enterprise Graph REST Gateway, Live Classroom-Studio Binding, Dynamic Collusion Visualizer & Full E2E Verification

### 1. Task Identification
- **Task ID**: `TASK-003-ENTERPRISE-INTEGRATION`
- **Feature Name**: Full-Stack Dynamic Data Binding, PostgreSQL Graph REST API, Universal Studio Live Forensics, and E2E Verification
- **Assigned 5 Agents**:
  - **Agent 1: Graph Engine & Database Architect** (`com.veritas.backend.controller.GraphController`)
  - **Agent 2: Classroom & Submission Gateway Specialist** (`ClassroomPortal.jsx` dynamic API binding)
  - **Agent 3: Forensics Studio & AI Bridge Engineer** (`UniversalStudio.jsx` live API comparison)
  - **Agent 4: Interactive Workflow & Dynamic Graph Visualizer** (`PortalWorkflowHub.jsx` live CTE graph)
  - **Agent 5: Systems QA & Verification Auditor** (`verify_full_system.ps1` & `VERIFICATION_REPORT.md`)
- **Execution Mode**: Autonomous Agentic Engineering Bounded Loop (`/agentic-engineering`)
- **Iteration Limit**: 3 iterations per wave
- **Verification Commands**:
  - `.\mvnw.cmd compile` (Spring Boot exit code 0)
  - `npm run build` (Vite build SLA < 2.0s)
  - `python -m pytest tests/` (FastAPI test suite exit code 0)
  - `psql` query on `view_collusion_chains`

---

### 2. Five Engineering Roles & Scopes

#### Agent 1: Graph Engine & Database Architect
- Create `backend/src/main/java/com/veritas/backend/controller/GraphController.java`.
- Expose REST endpoints:
  - `GET /api/graph/collusion-chains`: Queries PostgreSQL `view_collusion_chains` and returns multi-hop chains with patient zero, hops, similarity, and time delta.
  - `GET /api/graph/nodes`: Queries `graph_nodes` and `graph_edges` returning nodes and relationships for visual topology.
- Compile cleanly via `./mvnw.cmd compile`.

#### Agent 2: Classroom & Submission Gateway Specialist
- Inspect `frontend/src/components/classroom/ClassroomPortal.jsx`.
- Wire live `useEffect` to fetch classrooms from `/api/classrooms` and submissions from `/api/classrooms/assignments/1/submissions`.
- Ensure new submission form posts to `/api/classrooms/assignments/1/submit`.
- Keep graceful fallback so if the backend is booting, UI renders domain data without crashing.

#### Agent 3: Forensics Studio & AI Bridge Engineer
- Inspect `frontend/src/components/studio/UniversalStudio.jsx`.
- Connect the primary "Run Comparison" button to call `POST /api/studio/compare-1to1` (or `/api/v1/compare/one-to-one`).
- Connect AI Forensics tab to `POST /api/studio/ai-forensics`.
- Ensure client-side winnowing fallback remains seamless when offline.

#### Agent 4: Interactive Workflow & Dynamic Graph Visualizer
- Inspect `frontend/src/components/dashboard/PortalWorkflowHub.jsx`.
- In Step 3 (Collusion Graph), add live data hook fetching `/api/graph/collusion-chains`.
- Render the SVG topology dynamically from the fetched graph data with interactive node selection.

#### Agent 5: Systems QA & Verification Auditor
- Run comprehensive build and test verification:
  - Spring Boot compile: `.\mvnw.cmd compile`
  - React frontend build: `npm run build` (verify SLA < 2.0s)
  - Database connectivity test: verify port 2157
- Log exact timestamped commands, exit codes, and commit hashes in `VERIFICATION_REPORT.md` and `SUMMARY.md`.

---

### 3. Acceptance Criteria
- [x] `GraphController.java` implemented and compiled with exit code 0.
- [x] `ClassroomPortal.jsx` fetches live classroom and submission data.
- [x] `UniversalStudio.jsx` communicates with backend comparison endpoints.
- [x] `PortalWorkflowHub.jsx` SVG graph reflects PostgreSQL collusion chains.
- [x] `npm run build` passes in under 2.0s with zero errors.
- [x] Every minor passing change micro-committed to Git.

---

## Task 4: Dynamic Operations Dashboard & Zero Simulated Telemetry
### 1. Task Identification
- **Task ID**: `TASK-004-DASHBOARD-ZERO-SIMULATION`
- **Feature Name**: Eliminate static mock metrics and replace with live database KPIs and dynamic Merkle ledger blocks.
- **Scope**:
  - `OperationsDashboard.jsx`: Eliminate static 14,892, 91.6%, 47, 128 KPI numbers. Compute live statistics from database submissions.
  - `OperationsDashboard.jsx`: Fetch real SHA-256 Merkle ledger blocks from `/api/classrooms/ledger/blocks`.
  - `DeveloperWorkstation.jsx`: Replace `SIMULATED` status badges with `STANDALONE BENCHMARK` and `LIVE WIRE`.
  - `ClassroomService.java`: Return real cryptographic blocks constructed from database submissions in `getLedgerBlocks()`.
- **Acceptance Criteria**:
  - [x] Hardcoded KPI metrics replaced with dynamic formulas in `OperationsDashboard.jsx`.
  - [x] Real cryptographic ledger blocks rendered from database submissions.
  - [x] `DeveloperWorkstation.jsx` and `ClassroomPortal.jsx` simulation labels eliminated.
  - [x] `mvnw.cmd test` passes 18/18 tests with exit code 0.
  - [x] `npm run build` passes in < 2.0s with exit code 0.
