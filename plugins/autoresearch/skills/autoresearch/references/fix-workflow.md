# Fix Workflow

Autonomous error repair loop. One fix per iteration, atomic, auto-reverted on failure.

## Phase 1: Detect Errors
- Run the Target/Verify command to capture current errors
- Parse output for: test failures, type errors, lint errors, build errors
- If `--category` is set, filter to only that category (test, type, lint, build)
- If `--skip-lint` is set, exclude lint errors
- If `--from-debug` is set, read `autoresearch-debug-findings.md` for pre-identified bugs
- Count total errors — this is the metric to minimize

## Phase 2: Prioritize
- Order errors by: build errors first (block everything), then type errors, then test failures, then lint
- Pick the ONE error most likely to unblock others (cascading fixes)

## Phase 3: Analyze
- Read the failing code and understand the root cause
- Read surrounding context (tests, types, imports)
- Plan the minimal fix — one change, one file if possible

## Phase 4: Fix
- Apply exactly ONE fix
- The fix must be minimal — do not refactor, do not clean up nearby code

## Phase 5: Commit
- `git add` changed files
- Commit: `autoresearch-fix: <description of fix>`
- Commit BEFORE re-running verification

## Phase 6: Verify
- Re-run the Target/Verify command
- Count remaining errors
- Run Guard command if configured

## Phase 7: Decide
- **Keep:** error count decreased AND guard passed → reset rework counter for this error
- **Discard:** error count same or increased OR guard failed → `git reset --hard HEAD~1` → increment rework counter
- **Max rework:** if the same error has been attempted 3 times, skip it and move to the next error

## Phase 8: Continue or Stop
- STOP if: error count = 0 (success!)
- STOP if: iteration limit reached
- STOP if: duration limit reached
- STOP if: all remaining errors have been skipped (max rework reached for each)
- Otherwise: go to Phase 1

## Output
- Terminal summary: started with N errors, ended with M errors, fixed K
- Discord notification on completion with errors remaining
- Updates `autoresearch-results.tsv` with each iteration
