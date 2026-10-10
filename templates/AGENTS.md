# Operating Instructions for Coding Agents (`AGENTS.md`)

This document defines rules for autonomous coding agents.
Read these rules before you change any file.

## 1. Operating Rules
- Make only the requested changes.
- Do not add features that the prompt does not request.
- Keep your changes small and surgical.
- Follow the existing code style.
- Preserve all existing comments and documentation.

## 2. Evidence-Based Verification
- A text claim is not proof of success.
- You must execute real verification commands.
- Run the project test suite after you make changes.
- If a test fails, inspect the error and fix the root cause.
- Do not weaken tests to make them pass.
- Do not delete failing tests.

## 3. Workflow Steps
Follow these steps in each iteration:
1. Read the task specification.
2. Inspect the target files.
3. Plan the smallest change that satisfies the goal.
4. Edit the target files.
5. Execute the test command.
6. Verify that the output shows zero failures.
7. Return the final structured output contract.

## 4. Final Output Contract
When the iteration finishes, return only this JSON object:
```json
{
  "success": true,
  "summary": "Short explanation of the verified change",
  "key_changes_made": [
    "path/to/file: Description of the exact edit"
  ],
  "key_learnings": [
    "Important facts or constraints discovered during verification"
  ]
}
```

## 5. Safety and Security Constraints
- Never commit `.env` files or API secrets.
- Never delete git branches.
- Never force push to remote branches.
- Do not edit files outside the task scope.
- If an ambiguous choice arises, stop and document the question.
