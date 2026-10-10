# Bounded Loop Policy (`BOUNDED_LOOP_POLICY.md`)

This policy enforces measured coding iterations based on Karpathy's autoresearch methodology.
Every iteration must test a discrete hypothesis and record a deterministic keep-or-reject decision.

## 1. The Eight-Step Iteration Cycle
Every autonomous iteration must execute these steps in order:
1. **Inspect**: Read the current codebase and previous iteration notes.
2. **Select**: Choose one small, justified change.
3. **Implement**: Apply the minimal code edit.
4. **Execute**: Run the specified verification command.
5. **Compare**: Check test output against the acceptance criteria.
6. **Keep**: Commit the change to Git if all tests pass.
7. **Recover**: Discard unverified edits if tests fail.
8. **Record**: Log the decision, diff, and test output in the run ledger.

## 2. Decision Rules (Keep or Reject)
- **KEEP Criteria**:
  - The verification command exits with code `0`.
  - All declared acceptance criteria pass.
  - No existing tests break.
- **REJECT Criteria**:
  - The test command fails or times out.
  - New errors appear in stdout or stderr.
  - The working tree contains unverified changes.

## 3. Strict Prohibitions
- Do not edit tests to make failing code appear successful.
- Do not remove assertions from existing test suites.
- Do not ignore linter or type-checker warnings.
- Do not accept natural-language statements as proof of completion.

## 4. Execution Limits
- Maximum iterations per task: `3`.
- Maximum token budget per task: `60000`.
- Maximum retry count after failure: `1`.
- If limits are reached without success, stop and report the failure.

## 5. Human Sign-Off Requirement
Autonomous agents must not deploy code or execute destructive operations.
A human engineer must review and approve all production merges.
