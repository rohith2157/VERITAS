# Task Specification Template (`TASK_TEMPLATE.md`)

Use this template to define discrete, verifiable objectives for GNHF + AGY autonomous execution.

---

## Task Metadata
- **Task ID**: `TASK-YYYYMMDD-001`
- **Feature / Area**: `[Module / Subsystem]`
- **Target Branch**: `gnhf/[task-slug]`
- **Max Iterations**: `2`
- **Max Token Budget**: `50000`

---

## 1. Objective
A 1–2 sentence description of the desired outcome.

> *Example: Implement input validation on user authentication payloads to prevent malformed email addresses from reaching the database.*

---

## 2. In-Scope & Out-of-Scope
- **In-Scope Files**:
  - `src/auth/validator.ts`
  - `tests/auth/validator.test.ts`
- **Strictly Out-of-Scope**:
  - Database schema migrations
  - UI frontend forms

---

## 3. Detailed Requirements
1. Validate email structure using standard RFC regex or lightweight validator.
2. Return HTTP 400 with `{ "error": "Invalid email format" }` when invalid.
3. Preserve existing error response structures.

---

## 4. Acceptance Criteria
- [ ] Valid emails pass through without error.
- [ ] Invalid emails return HTTP 400.
- [ ] All unit tests in `tests/auth/validator.test.ts` pass green.
- [ ] Zero lint/typecheck errors (`npm run typecheck`).

---

## 5. Verification Commands (Executable)
The agent must execute these commands before finishing:
```powershell
npm test -- tests/auth/validator.test.ts
npm run typecheck
```

---

## 6. Constraints & Safety
- Do not add new external dependencies to `package.json`.
- Do not modify existing database connections.
- Keep diff minimal and surgical.

---

## 7. Expected Completion Contract
Output a single valid JSON block upon test pass:
```json
{
  "success": true,
  "summary": "Added email format validation with unit tests",
  "key_changes_made": [
    "src/auth/validator.ts: Added regex email validation guard",
    "tests/auth/validator.test.ts: Added 4 test cases for malformed email rejection"
  ],
  "key_learnings": [
    "Existing validator pipeline catches nulls earlier; only regex check was missing"
  ]
}
```
