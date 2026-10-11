# Task Specification: TASK-AI-002
## ASD-STE100 AI Forensics Core Implementation

---

## Task Metadata
- **Task ID**: `TASK-AI-002`
- **Feature / Area**: `Forensic NLP & Vector Search Engine`
- **Assigned Role**: `Algorithmic Forensics & AST Engine Specialist`
- **Target Branch**: `gnhf/ai-forensics-core`
- **Max Iterations**: `2`
- **Language / Standard**: `ASD-STE100 Simplified Technical English`

---

## 1. Objective
Implement SBERT 384-D semantic vectors, FAISS SDMA indexing, and Stylometric Writeprint analysis in the AI engine.

---

## 2. In-Scope & Out-of-Scope
- **In-Scope Files**:
  - `ai-engine/core/semantic_vector.py`
  - `ai-engine/core/vector_index.py`
  - `ai-engine/core/stylometry.py`
  - `ai-engine/core/ocr_capture.py`
  - `ai-engine/core/compliance_ugc.py`
  - `ai-engine/core/compliance_dpdp.py`
  - `ai-engine/routers/enterprise_architecture.py`
  - `ai-engine/tests/test_enterprise_architecture.py`
- **Strictly Out-of-Scope**:
  - Spring Boot backend services
  - Frontend client components

---

## 3. ASD-STE100 Detailed Requirements
1. Generate 384-dimensional dense vectors using mean-pooled attention.
2. Calculate cosine similarity between document vectors.
3. Partition vectors into Voronoi centroid clusters.
4. Implement chained slab memory blocks with 64 vectors per slab.
5. Implement O(1) bitmap tombstone deletions.
6. Calculate Yule's Characteristic K and Type-Token Ratio for stylometric analysis.
7. Flag contract cheating anomalies when Z-score is greater than 2.5.
8. Enforce DPDP Act 2023 minor age-gating for users under 18 years.

---

## 4. Acceptance Criteria
- [x] SBERT semantic cosine similarity returns between 0 and 100 percent.
- [x] SDMA bitmap deletion operates in O(1) time without memory shift penalty.
- [x] Stylometry Writeprint detects contract ghostwriting anomalies.
- [x] DPDP age-gating rejects minors without parental consent tokens.
- [x] All 7 unit tests in `test_enterprise_architecture.py` pass green.

---

## 5. Verification Commands (Executable)
```powershell
.\venv\Scripts\python.exe -m pytest tests/test_enterprise_architecture.py
```

---

## 6. Expected Completion Contract
```json
{
  "success": true,
  "summary": "Implemented SBERT vectors, FAISS SDMA indexing, and stylometric Writeprints",
  "key_changes_made": [
    "ai-engine/core/semantic_vector.py: Added SBERT 384-D vectorization and cosine similarity",
    "ai-engine/core/vector_index.py: Built FAISS IVF-Flat with SDMA O(1) bitmap memory manager",
    "ai-engine/core/stylometry.py: Added Writeprint extraction and ghostwriter anomaly detector",
    "ai-engine/routers/enterprise_architecture.py: Registered enterprise REST endpoints"
  ],
  "key_learnings": [
    "SDMA slab chaining prevents contiguous GPU reallocation during high-velocity updates"
  ]
}
```
