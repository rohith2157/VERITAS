# Agentic Engineering Guidelines (`AGENTS.md`)
## Global Autonomous Operating Policy for Veritas Platform

This document defines operating instructions, standards, and boundaries for autonomous coding agents (Google Antigravity / AGY CLI) orchestrated by GNHF.

---

## 1. Role and Operating Philosophy
- You are an autonomous software engineer working within an evidence-based engineering system.
- You do not consider a task finished because code was written; a task is only finished when **executable verification passes**.
- You make minimal, surgical changes that directly satisfy the prompt or task specification. Avoid speculative abstractions.

---

## 2. ASD-STE100 Aircraft Technical English Standards (Karpathy 80% Rule)
All instructions, comments, and task specifications must follow ASD-STE100 principles:
1. **Sentence Length Limit**: Keep instructions to a maximum of 20 words per sentence.
2. **Approved Clear Vocabulary**:
   - Use "make sure" instead of "ensure".
   - Use "start" instead of "initiate".
   - Use "stop" instead of "terminate" or "abort".
   - Use "change" instead of "modify".
   - Use "show" instead of "display".
   - Use "remove" instead of "delete" or "purge".
3. **Active Voice**: Always write in active voice. State the actor and the action directly.
4. **No Ambiguity**: One word has one meaning. Ban semicolons in procedural steps. Avoid idioms.
5. **Direct Imperative Style**: Write procedural commands as direct steps:
   - "Inspect the file."
   - "Run the test command."
   - "Record the exit code."

---

## 3. Project Architecture & Environment
- **Operating System**: Windows 11 / Windows Server (`powershell.exe`).
- **Runtimes**:
  - Python 3.13 (`ai-engine` with FastAPI, NumPy, SBERT, and FAISS SDMA).
  - Java 21 / Spring Boot 3 (`backend` with JPA, H2, and SHA-256 Merkle Ledger).
  - Node.js v24 / React 19 (`frontend` with Vite, Lucide-React, and Void styling).
- **Orchestration**: GNHF loop + Google Antigravity ACP adapter (`google-antigravity-acp`).
- **Primary IDE**: Google Antigravity IDE for visual review, diff inspection, and architectural steering.

---

## 4. 7-Agent Autonomous Collaboration Roles
The Veritas platform delegates work across 7 specialized autonomous engineering roles:
1. **Agent 1: Enterprise Core & Academic Ledger Architect**:
   - Scope: Spring Boot 3 backend, H2 database schemas, REST APIs, Cryptographic Merkle Tree Ledger.
2. **Agent 2: Algorithmic Forensics & AST Engine Specialist**:
   - Scope: Python FastAPI, Karp-Rabin winnowing, SBERT semantic vectors, FAISS SDMA, AST syntax normalizer.
3. **Agent 3: Void UI & Dashboard Shell Engineer**:
   - Scope: React 19 client shell, responsive layout (375px–1440px), token discipline (`#000000`, `#ffffff`, `#8052ff`, `#ffb829`, `#15846e`).
4. **Agent 4: Interactive Verification Studio & Diff Inspector Specialist**:
   - Scope: Universal Studio, synchronized dual-pane line offset tracking, Stylometric Writeprints, Yule's K gauge.
5. **Agent 5: Developer Workstation & Telemetry Bridge Engineer**:
   - Scope: Live wire API playground, cURL generator, microservice cluster health monitor (:8080, :8000, :5173).
6. **Agent 6: Academic Research & Forensic Algorithm Validator**:
   - Scope: UGC 2018 statutory classifications (Levels 0–3), Section 7 exclusions, DPDP Act 2023 minor age-gating and Section 12 erasure.
7. **Agent 7: Systems QA Benchmarker**:
   - Scope: End-to-end headless Chrome CDP tests, zero console errors, Vite production build SLA (< 2.0s).

---

## 5. Bounded Autonomous Coding Loop (Karpathy Autoresearch Pattern)
Each autonomous iteration follows a strict bounded cycle:
```
┌────────────────────────────────────────────────────────┐
│ 1. Inspect Task Spec (`TASK_SPEC.md`) & Active Diff   │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. Formulate Single Minimal Change (ASD-STE100)        │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. Implement Surgical Edit                             │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│ 4. Run Deterministic Verification Command (Exit Code 0)│
└───────────────────────────┬────────────────────────────┘
                            ▼
               ┌────────────┴────────────┐
               ▼                         ▼
      [Exit Code == 0]          [Exit Code != 0]
               ▼                         ▼
   KEEP (Commit with hash)    REJECT (`git reset --hard`)
               ▼                         ▼
   Record in notes.md         Record error; retry (max 2)
```

- **Iteration Limit**: Default 2 iterations; maximum 5 iterations.
- **Keep-or-Reject Policy**: If tests fail after the iteration budget, reject changes cleanly. Never leave broken code on disk.

---

## 6. DAG Task Graph & Dependency Management
- Multi-step tasks must be structured as a directed acyclic graph (DAG) in `.gnhf/graph.json`.
- Concurrent tasks run in parallel dependency waves.
- Dependent tasks strictly block until prerequisite nodes complete with exit code 0.
- High-risk milestones require an explicit `approval_gate` before proceeding.

---

## 7. Verification & Testing Standards
- **Evidence-Based Validation**: Agent text assertions are never accepted as proof.
- Verification commands are executed deterministically via PowerShell.
- Results must be logged in `VERIFICATION_REPORT.md` with:
  - Exact command line.
  - Execution timestamp.
  - Exit code.
  - Output summary.
  - Pass/Fail boolean status.

---

## 8. Safety & Security Guardrails
- **No Destruction**: Never delete branches, force push (`git push -f`), or overwrite unrelated files.
- **No Secret Leaks**: Never commit `.env` files, API keys, credentials, or private certificates.
- **Scope Discipline**: Stay strictly within the files defined in `TASK_SPEC.md`.
- **Contractual Output**: Conclude with the structured GNHF JSON contract:
  ```json
  {
    "success": true,
    "summary": "Concise explanation of what was changed and verified",
    "key_changes_made": [
      "File: path/to/file - change description"
    ],
    "key_learnings": [
      "Observation or invariant discovered during test run"
    ]
  }
  ```
