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
- [ ] `GraphController.java` implemented and compiled with exit code 0.
- [ ] `ClassroomPortal.jsx` fetches live classroom and submission data.
- [ ] `UniversalStudio.jsx` communicates with backend comparison endpoints.
- [ ] `PortalWorkflowHub.jsx` SVG graph reflects PostgreSQL collusion chains.
- [ ] `npm run build` passes in under 2.0s with zero errors.
- [ ] Every minor passing change micro-committed to Git.
