# Task Specification: TASK-UI-004
## ASD-STE100 Void Client Studio & Classroom Integration

---

## Task Metadata
- **Task ID**: `TASK-UI-004`
- **Feature / Area**: `Frontend Studio & Classroom User Interface`
- **Assigned Role**: `Interactive Verification Studio & Diff Inspector Specialist`
- **Target Branch**: `gnhf/ui-studio-merkle-ugc`
- **Max Iterations**: `2`
- **Language / Standard**: `ASD-STE100 Simplified Technical English`

---

## 1. Objective
Integrate Stylometric Writeprint analysis, Merkle Ledger explorer, and statutory UGC 2018 badges into the React 19 interface.

---

## 2. In-Scope & Out-of-Scope
- **In-Scope Files**:
  - `frontend/src/components/studio/UniversalStudio.jsx`
  - `frontend/src/components/classroom/ClassroomPortal.jsx`
  - `frontend/src/components/dev/DeveloperWorkstation.jsx`
- **Strictly Out-of-Scope**:
  - Python engine algorithms
  - Java backend schemas

---

## 3. ASD-STE100 Detailed Requirements
1. Add Sub-Tab 5 for Stylometric Writeprint analysis in Universal Studio.
2. Show Yule's K gauge, Type-Token Ratio, and contract ghostwriter anomaly warnings.
3. Add Sub-Tab 6 for Cryptographic Merkle Tree Ledger in Universal Studio.
4. Show the 4 hierarchical leaves and the apex Merkle root.
5. Provide an interactive O(log N) Merkle proof verification button.
6. Add UGC 2018 statutory classification badges to student submission rows in Classroom Portal.
7. Maintain Void design tokens: Void black, Bone white, Electric Iris, and Saffron Spark.

---

## 4. Acceptance Criteria
- [x] Sub-Tab 5 displays Yule's K and ghostwriter anomaly indicators.
- [x] Sub-Tab 6 verifies Merkle proofs with green checkmark.
- [x] Classroom portal shows Level 0, Level 1, Level 2, and Level 3 badges.
- [x] Developer workstation executes all 8 live API wire presets.
- [x] Production build finishes in under 2 seconds with zero errors.

---

## 5. Verification Commands (Executable)
```powershell
npm run build
```

---

## 6. Expected Completion Contract
```json
{
  "success": true,
  "summary": "Integrated Stylometry Writeprints, Merkle Tree explorer, and UGC 2018 badges in React 19",
  "key_changes_made": [
    "frontend/src/components/studio/UniversalStudio.jsx: Added Sub-Tabs 5 (Stylometry) and 6 (Merkle Ledger)",
    "frontend/src/components/classroom/ClassroomPortal.jsx: Added statutory UGC badges and Merkle modal",
    "frontend/src/components/dev/DeveloperWorkstation.jsx: Configured 8 wire playground presets"
  ],
  "key_learnings": [
    "Vite transforms 85 modules in 1.06 seconds, exceeding the 2.0 second SLA"
  ]
}
```
