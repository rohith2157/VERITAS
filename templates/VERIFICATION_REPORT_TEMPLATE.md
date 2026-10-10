# Verification Report (`VERIFICATION_REPORT.md`)

Use this document to record executable evidence from an autonomous task run.

## 1. Run Metadata
- Task ID: `TASK-001`
- Run Timestamp: `YYYY-MM-DD HH:MM:SS`
- Git Commit: `[Commit SHA]`
- Branch Name: `gnhf/[task-slug]`
- Total Iterations: `[Number]`

## 2. Changes Implemented
- Summary of change: One short sentence explaining the change.
- Modified files:
  - `path/to/file1.ts` (+12 lines, -3 lines)
  - `path/to/file2.ts` (+5 lines, -0 lines)

## 3. Verification Evidence
Record each test command and its actual exit code.

| Verification Check | Executable Command | Exit Code | Result Status |
| :--- | :--- | :--- | :--- |
| Unit Test Suite | `npm test -- tests/validator.test.ts` | `0` | **PASSED** |
| TypeScript Typecheck | `npm run typecheck` | `0` | **PASSED** |
| Linter Audit | `npm run lint` | `0` | **PASSED** |
| Integration Check | `npm run test:e2e` | `N/A` | **SKIPPED** |

> Note: Status values must be `PASSED`, `FAILED`, `SKIPPED`, or `UNVERIFIED`.
> Never mark a skipped check as passed.

## 4. Verification Output Log
Include the exact test runner output below:
```
PASS tests/validator.test.ts
  √ accepts valid email address (12 ms)
  √ rejects missing domain (4 ms)
  √ rejects empty string (2 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        1.245 s
```

## 5. Known Limitations and Remaining Items
- State any known ceiling or deferred edge cases here.
- Unresolved issues: List none or describe the exact failure.
