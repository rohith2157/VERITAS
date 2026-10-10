# Task Completion Summary (`SUMMARY.md`)

Use this document to summarize the final state of an engineering task.

## 1. Executive Summary
- **Task ID**: `TASK-001`
- **Objective**: Direct description of the original goal.
- **Agent and Adapter**: `Google Antigravity CLI (agy)` via `google-antigravity-acp`.
- **Final Status**: `COMPLETED` (Options: `COMPLETED`, `FAILED`, `ESCALATED`).

## 2. Execution Metrics
- Total Iterations: `[N] completed of [M] max`.
- Input Tokens: `[Count]`.
- Output Tokens: `[Count]`.
- Runtime Duration: `[MM:SS]`.

## 3. Changes and Version Control
- **Git Branch**: `gnhf/[task-slug]`
- **Merge Target**: `main`
- **Commits Created**:
  - `[SHA]`: `[Commit Message]`
- **Changed Files**:
  - `path/to/file1`
  - `path/to/file2`

## 4. Test and Quality Results
- Executable checks passed: `[N] of [N]`.
- Regressions detected: `None`.
- Full test command output recorded in `VERIFICATION_REPORT.md`.

## 5. Next Steps for Human Engineer
1. Inspect the branch in Antigravity IDE:
   `git diff main..gnhf/[task-slug]`
2. Run manual verification if necessary.
3. Merge branch into `main` or reject changes.
