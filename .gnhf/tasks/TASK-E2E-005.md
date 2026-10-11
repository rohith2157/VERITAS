# Task Specification: TASK-E2E-005
## ASD-STE100 Live Microservice E2E Certification

---

## Task Metadata
- **Task ID**: `TASK-E2E-005`
- **Feature / Area**: `System Integration & Production Certification`
- **Assigned Role**: `Systems QA Benchmarker`
- **Target Branch**: `gnhf/e2e-enterprise-certification`
- **Max Iterations**: `2`
- **Language / Standard**: `ASD-STE100 Simplified Technical English`

---

## 1. Objective
Certify that all 8 enterprise microservice endpoints pass live E2E tests and produce immutable verification evidence.

---

## 2. In-Scope & Out-of-Scope
- **In-Scope Files**:
  - `scripts/verify_all_live_endpoints.cjs`
  - `VERIFICATION_REPORT.md`
- **Strictly Out-of-Scope**:
  - Unrelated documentation files
  - New dependency additions

---

## 3. ASD-STE100 Detailed Requirements
1. Start Spring Boot backend on port 8080.
2. Start FastAPI AI engine on port 8000.
3. Execute the automated verification script against live ports.
4. Test Merkle tree generation and verify that leaf count is 4.
5. Test Merkle proof verification and verify that isProofValid is true.
6. Test UGC 2018 evaluation and verify Level 2 classification.
7. Test SBERT semantic comparison and verify cosine similarity.
8. Test FAISS SDMA vector search and verify scanned Voronoi cells.
9. Test Stylometry Writeprint and verify ghostwriter anomaly verdict.
10. Test DPDP Act 2023 age-gating and verify minor protection.

---

## 4. Acceptance Criteria
- [x] All 8 microservice endpoints return HTTP 200.
- [x] Merkle proof verification validates in O(log N) steps.
- [x] Script prints 8/8 PASSED with exit code 0.
- [x] Verification report records exact timestamps and terminal outputs.

---

## 5. Verification Commands (Executable)
```powershell
node scripts/verify_all_live_endpoints.cjs
```

---

## 6. Expected Completion Contract
```json
{
  "success": true,
  "summary": "Certified all 8 enterprise microservice endpoints with 100% pass rate",
  "key_changes_made": [
    "scripts/verify_all_live_endpoints.cjs: Built and executed automated 8-endpoint live test harness",
    "VERIFICATION_REPORT.md: Generated immutable evidence ledger"
  ],
  "key_learnings": [
    "Both Spring Boot (:8080) and FastAPI (:8000) respond within 50ms under local orchestration"
  ]
}
```
