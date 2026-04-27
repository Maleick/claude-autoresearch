# Fix Workflow

Use this when the user wants autoresearch to repair a concrete failing command or breakage pattern.

## Goal

Reduce the count of known failures to zero or to the best verified lower value.

## Loop

1. Run the target command to capture the current failures.
2. Pick one error cluster to address.
3. Read only the relevant files for that cluster before editing.
4. Make one focused fix.
5. Run the target command again.
6. Run the guard command if configured.
7. Keep the change only if the error count strictly improves and the guard passes.
8. Record the result before the next attempt.

## Rules

- Prefer one-file or one-concern fixes.
- Do not mix cleanup with repair.
- If the same error path fails repeatedly, change strategy instead of retrying the same idea.
- Stop when the failures hit zero, the iteration cap is reached, or the run needs human input.
