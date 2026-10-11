# Task Specification (`TASK_SPEC.md`)
## Task 2: Enterprise Backend & Frontend Super-Upgrade

### 1. Task Identification
- **Task ID**: `TASK-002`
- **Feature Name**: Enterprise Backend Resilience & Frontend UX Super-Upgrade
- **Assigned Agent**: `acp:antigravity`
- **Execution Mode**: Autonomous Agentic Engineering Bounded Loop
- **Maximum Iterations**: `5`
- **Commit Target**: Continuous Micro-Commits for each passing wave

---

### 2. Objective
Upgrade Veritas backend resilience with RFC 7807 problem details and empower frontend with a global command palette, toast notifications, and cryptographic forensic certificate inspection.

---

### 3. Scope Boundaries
#### In-Scope Files
- `backend/src/main/resources/application.properties`
- `backend/src/main/java/com/veritas/backend/exception/GlobalExceptionHandler.java`
- `backend/src/main/java/com/veritas/backend/controller/ClassroomController.java`
- `backend/src/main/java/com/veritas/backend/controller/StudioController.java`
- `backend/src/main/java/com/veritas/backend/service/ClassroomService.java`
- `frontend/src/context/ToastContext.jsx`
- `frontend/src/components/CommandPalette.jsx`
- `frontend/src/components/Navbar.jsx`
- `frontend/src/components/classroom/ClassroomPortal.jsx`
- `frontend/src/components/classroom/ForensicCertificateModal.jsx`
- `frontend/src/App.jsx`
- `frontend/src/App.css`

#### Out-of-Scope Files
- `data/` corpora
- `archive/`

---

### 4. Required Inputs
- Existing Spring Boot 3 controllers and services in `backend/src/main/java/com/veritas/backend/`.
- Existing React 19 client components in `frontend/src/`.
- Dala Design System tokens (`#000000`, `#ffffff`, `#8052ff`, `#ffb829`, `#15846e`, `PPNeueMontreal`).

---

### 5. Expected Outputs
1. **RFC 7807 Global Exception Architecture**:
   - `GlobalExceptionHandler.java` returns structured `ProblemDetail` JSON on exceptions.
   - `spring.mvc.problemdetails.enabled=true` active in Spring Boot properties.
2. **Forensic Certificate Generation**:
   - Endpoint `/api/classrooms/assignments/{assignmentId}/submissions/{submissionId}/certificate` produces immutable SHA-256 Merkle certificate.
3. **Global Command Palette (`Ctrl+K`)**:
   - Keyboard-accessible modal (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`) to jump between views and trigger forensic actions.
4. **Toast Notification System**:
   - Sleek, accessible notification banners with automatic dismissal and pause on hover.
5. **Interactive Forensic Certificate Modal**:
   - Interactive viewer showing student attribution, UGC 2018 level, penalty rubric, and Merkle root hash.

---

### 6. Acceptance Criteria
- [ ] Spring Boot backend compiles and runs cleanly.
- [ ] `npm run build` in `frontend` completes in under 2.0s with zero bundle errors.
- [ ] Command Palette opens on `Ctrl+K` and closes on `Escape`.
- [ ] Clicking on any student submission's Merkle seal opens the Forensic Certificate modal.
- [ ] All changes are micro-committed to Git and pushed to GitHub.

---

### 7. Verification Commands
```powershell
# Wave 1 (Backend Verification):
# Verify Java source files and Spring Boot properties

# Wave 2 (Frontend Verification):
cd frontend; npm run build
```

