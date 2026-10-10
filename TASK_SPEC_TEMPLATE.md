# Task Specification (`TASK_SPEC.md`)

Use this document to define one bounded coding task.

## 1. Task Identification
- Task ID: `TASK-001`
- Feature Name: `[Feature Name]`
- Assigned Agent: `acp:antigravity`
- Target Branch: `gnhf/[task-slug]`
- Maximum Iterations: `2`
- Maximum Token Budget: `50000`

## 2. Objective
State the goal in one direct sentence.
> Example: Add input validation for email addresses in the user registration endpoint.

## 3. Scope Boundaries
### In-Scope Files
- `src/auth/validator.ts`
- `tests/auth/validator.test.ts`

### Out-of-Scope Files
- `src/database/schema.prisma`
- `src/ui/login.tsx`

## 4. Required Inputs
- Existing validation functions in `src/auth/validator.ts`.
- Existing test harness in `tests/auth/validator.test.ts`.

## 5. Expected Outputs
- Updated `src/auth/validator.ts` with validation logic.
- New test cases in `tests/auth/validator.test.ts`.
- Passing test results from the test runner.

## 6. Acceptance Criteria
- [ ] Valid input values return status `true`.
- [ ] Invalid input values return status `false`.
- [ ] All test cases in `tests/auth/validator.test.ts` pass without errors.
- [ ] The type checker reports zero errors.

## 7. Verification Commands
Run these commands in order:
```powershell
npm test -- tests/auth/validator.test.ts
npm run typecheck
```

## 8. Failure Behavior
- If tests fail, inspect the stack trace.
- Fix the failing logic in the target file.
- If the iteration limit is reached, stop execution.
- Record the error in the task summary.
- Do not modify test assertions to force a pass.

## 9. Safety Constraints
- Do not install new dependencies.
- Do not edit files outside the in-scope list.
- Keep the diff small and focused.
