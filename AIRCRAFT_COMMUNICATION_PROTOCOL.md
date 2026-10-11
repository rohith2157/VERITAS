# Aircraft-Grade Inter-Agent Communication Protocol (`AIRCRAFT_COMMUNICATION_PROTOCOL.md`)
## DO-178C & ARINC 653 Compliant Multi-Agent Protocol

This document governs autonomous communication and data sharing between engineering agents on the Veritas Platform.

---

## 1. Core Operating Principles
1. **Space & Time Partitioning (ARINC 653)**: Subagents execute within bounded workspaces with isolated resources.
2. **Deterministic Disk Handoffs**: Subagents pass all structured data through version-controlled files on disk (`RESEARCH_REPORT.md`, `TASK_SPEC.md`, `VERIFICATION_REPORT.md`). Agents never rely on volatile conversational memory.
3. **Structured JSON Envelopes**: All messages sent via `send_message` must adhere to the standard envelope below.
4. **ASD-STE100 Language Standard**: Instructions and handoff summaries must use active voice and maximum 20 words per sentence.

---

## 2. Standard Message Envelope Schema
All inter-agent messages must use this JSON structure:

```json
{
  "sender_role": "researcher | spec_architect | loop_coder | evidence_auditor",
  "recipient_role": "spec_architect | loop_coder | evidence_auditor | orchestrator",
  "task_id": "TASK-002",
  "message_type": "HANDOFF | REJECT | ESCALATE | APPROVAL_REQUEST | COMPLETE",
  "shared_artifacts": [
    "RESEARCH_REPORT.md",
    "TASK_SPEC.md",
    "VERIFICATION_REPORT.md"
  ],
  "verification_evidence": {
    "command": "npm run build",
    "exit_code": 0,
    "status": "PASSED"
  },
  "summary": "Direct ASD-STE100 summary of the verified state."
}
```

---

## 3. Data Flow Pipeline

```
┌────────────────────┐
│   Researcher       │ ── Writes ──► RESEARCH_REPORT.md
└────────────────────┘                      │
                                            ▼
┌────────────────────┐               Reads by Spec Architect
│   Spec Architect   │ ── Writes ──► TASK_SPEC.md & .gnhf/graph.json
└────────────────────┘                      │
                                            ▼
┌────────────────────┐               Reads by Loop Coder
│   Loop Coder       │ ── Writes ──► Surgical Git Commits
└────────────────────┘                      │
                                            ▼
┌────────────────────┐               Verified by Evidence Auditor
│   Evidence Auditor │ ── Writes ──► VERIFICATION_REPORT.md
└────────────────────┘
```

---

## 4. Barrier Synchronization & Micro-Commits
- Prerequisite tasks must complete with exit code 0 before dependent tasks start.
- Every minor verified change is committed immediately to Git.
- Commit SHAs are logged deterministically in `VERIFICATION_REPORT.md`.

