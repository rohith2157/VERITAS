# Task Graph Specification (`GRAPH_SPEC.md`)
## Task 3: 5-Agent Autonomous Collaboration Graph

```mermaid
flowchart TD
    subgraph Wave1["Wave 1: Core Backend & Data Services"]
        A1["Agent 1: Graph Engine Architect<br/>GraphController.java & PostgreSQL REST"]
    end

    subgraph Wave2["Wave 2: Frontend Data Binding & Forensics Integration"]
        A2["Agent 2: Classroom Gateway<br/>ClassroomPortal.jsx live REST binding"]
        A3["Agent 3: Forensics Studio Bridge<br/>UniversalStudio.jsx live API comparison"]
        A4["Agent 4: Interactive Graph Visualizer<br/>PortalWorkflowHub.jsx dynamic CTE visualizer"]
    end

    subgraph Wave3["Wave 3: Deterministic E2E Verification"]
        A5["Agent 5: Systems QA & Verification Auditor<br/>mvn compile + npm build + DB verify"]
    end

    A1 --> A4
    A1 --> A2
    A1 --> A3
    A2 --> A5
    A3 --> A5
    A4 --> A5
    A5 --> GATE{"DO-178C Verification Gate"}
    GATE -->|Exit Code 0| SHIP["Production Commit & Deploy"]
```

---

## 1. 5-Agent Allocation Matrix

| Agent | Role | Domain | Primary Deliverables | Verification Target |
| :---: | :--- | :--- | :--- | :--- |
| **Agent 1** | Graph Engine Architect | Spring Boot & PostgreSQL | `GraphController.java` (`/api/graph/collusion-chains`, `/api/graph/nodes`) | `.\mvnw.cmd compile` |
| **Agent 2** | Classroom Gateway Specialist | React & Spring Boot REST | Dynamic classroom/assignment/submission state in `ClassroomPortal.jsx` | `npm run build` |
| **Agent 3** | Forensics Studio Bridge | React & FastAPI Forensics | Live 1-to-1 diff & AI forensics hook in `UniversalStudio.jsx` | `npm run build` |
| **Agent 4** | Interactive Graph Visualizer | React & SVG Topology | Dynamic CTE graph rendering & node selection in `PortalWorkflowHub.jsx` | `npm run build` |
| **Agent 5** | Systems QA Auditor | Cross-Stack QA | Comprehensive verification report & Git micro-commits | Exit code 0 across all gates |
