# Task Specification: TASK-JAVA-003
## ASD-STE100 Cryptographic Merkle Ledger & UGC 2018 Engine

---

## Task Metadata
- **Task ID**: `TASK-JAVA-003`
- **Feature / Area**: `Enterprise Cryptographic Ledger & Academic Rubric`
- **Assigned Role**: `Enterprise Core & Academic Ledger Architect`
- **Target Branch**: `gnhf/merkle-ledger-ugc2018`
- **Max Iterations**: `2`
- **Language / Standard**: `ASD-STE100 Simplified Technical English`

---

## 1. Objective
Implement the 4-leaf SHA-256 Binary Merkle Tree ledger and statutory UGC 2018 classification in the Spring Boot backend.

---

## 2. In-Scope & Out-of-Scope
- **In-Scope Files**:
  - `backend/src/main/java/com/veritas/backend/service/AuditLedgerService.java`
  - `backend/src/main/java/com/veritas/backend/service/RubricService.java`
  - `backend/src/main/java/com/veritas/backend/service/ClassroomService.java`
  - `backend/src/main/java/com/veritas/backend/controller/ClassroomController.java`
  - `backend/src/test/java/com/veritas/backend/service/AuditLedgerServiceTest.java`
  - `backend/src/test/java/com/veritas/backend/service/RubricServiceTest.java`
- **Strictly Out-of-Scope**:
  - Python AI engine algorithms
  - React frontend styling

---

## 3. ASD-STE100 Detailed Requirements
1. Construct 4 hierarchical leaves: Leaf 0 (Raw Text), Leaf 1 (AST Tokens), Leaf 2 (Stylometry), Leaf 3 (Telemetry).
2. Calculate intermediate parent nodes H01 and H23 with SHA-256 hashing.
3. Calculate apex Merkle Tree Root by hashing H01 and H23.
4. Verify Merkle Proofs in O(log N) steps using sibling paths.
5. Invalidate proof if any byte changes in the leaf or sibling.
6. Classify submissions into UGC 2018 statutory Levels 0, 1, 2, and 3.
7. Exclude references, quotes, and common equations before applying penalty tiers.

---

## 4. Acceptance Criteria
- [x] Merkle tree generates 4 valid SHA-256 leaves.
- [x] O(log N) proof verification returns true for valid leaves.
- [x] Proof verification returns false when a byte is altered.
- [x] Submissions above 40 percent to 60 percent similarity classify as Level 2.
- [x] All 18 Maven tests pass with BUILD SUCCESS.

---

## 5. Verification Commands (Executable)
```powershell
.\mvnw.cmd test
```

---

## 6. Expected Completion Contract
```json
{
  "success": true,
  "summary": "Implemented 4-leaf SHA-256 Merkle Tree ledger and UGC 2018 statutory evaluation",
  "key_changes_made": [
    "backend/src/main/java/com/veritas/backend/service/AuditLedgerService.java: Built Merkle Tree and O(log N) verifier",
    "backend/src/main/java/com/veritas/backend/service/RubricService.java: Implemented UGC 2018 statutory classification",
    "backend/src/main/java/com/veritas/backend/controller/ClassroomController.java: Added Merkle and UGC endpoints"
  ],
  "key_learnings": [
    "Hierarchical Merkle Trees enable independent forensic auditing of AST tokens without exposing student raw text"
  ]
}
```
