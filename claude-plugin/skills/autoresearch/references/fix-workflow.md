# Fix Workflow — Iterative Error Repair

One fix per iteration. Automatic rollback on regression. Stops when zero errors remain.

## Argument Parsing

Extract from $ARGUMENTS:

- `Verify:` — command that counts errors (REQUIRED). Must output a number.
- `Guard:` — command that must always pass (optional)
- `Scope:` — file globs to fix within (optional, defaults to all tracked files)
- `Iterations:` — max iterations (default: 50)
- `Duration:` — max wall-clock time (optional)
- `--from-debug` — read findings from `autoresearch-debug-findings.md`

If Verify is missing, FAIL with: "ERROR: Missing Verify command. Usage: /autoresearch:fix Verify: <cmd>"

## The Fix Loop

Uses the core loop engine from SKILL.md with these specializations:

### Phase 0: Preconditions (additions)

- Run Verify command to get initial error count = baseline
- Direction is ALWAYS `minimize` (goal: zero errors)
- If `--from-debug`: read `autoresearch-debug-findings.md` and prioritize those fixes
- Track `rework_count` per fix (max 3 attempts)

### Phase 2: Ideate (specialization)

Priority order:

1. Critical bugs from debug findings (if `--from-debug`)
2. Test failures
3. Type errors
4. Build errors
5. Lint errors

For each: identify root cause, not just symptom. Fix the cause.

### Phase 6: Decide (additions)

- If guard fails after a fix: increment `rework_count` for this fix
- If `rework_count >= 3`: skip this fix, move to next error, log as `skip-rework-limit`
- NEVER modify test files to make tests pass — fix the source code

### Stop Conditions (additions)

- Error count = 0 → STOP (reason: "all errors fixed")
- All remaining errors have hit rework limit → STOP (reason: "remaining errors require manual intervention")

### End of Run

Terminal summary includes:

```
═══ autoresearch:fix complete ═══
Errors:     <initial> → <final> (-<N>)
Fixed:      <count>
Skipped:    <count> (hit rework limit)
Remaining:  <count>
═══════════════════════════════════
```

Discord: `autoresearch:fix complete: <initial>→<final> errors (-<N>). <fixed> fixed, <remaining> remaining.`
