---
name: autoresearch
description: Autonomous overnight iteration engine. Modify → Verify → Keep/Discard → Repeat. Runs unattended, compounds improvements, reports in the morning.
version: 1.0.0
---

# Autoresearch — Autonomous Overnight Iteration Engine

Inspired by Karpathy's autoresearch. Applies constraint-driven autonomous iteration to ANY work.

**Core idea:** You are an autonomous agent. Modify → Verify → Keep/Discard → Repeat.

## CRITICAL: Zero Interaction After Launch

This skill is designed for OVERNIGHT, UNATTENDED operation. After launch:

- **NEVER** use `AskUserQuestion` during the loop
- **NEVER** pause for confirmation
- If config is incomplete → FAIL IMMEDIATELY with a clear error message telling the user to run `/autoresearch:plan`
- If something is ambiguous → choose the safer option and log the decision

The ONLY command that asks questions is `/autoresearch:plan`.

## Argument Parsing (FIRST, before anything else)

Extract from $ARGUMENTS:

- `Goal:` — natural language description of what to achieve (REQUIRED)
- `Scope:` or `--scope <glob>` — file globs to modify (REQUIRED)
- `Metric:` — what the verify command measures (REQUIRED)
- `Verify:` — shell command that outputs a number (REQUIRED)
- `Guard:` — shell command that must exit 0 (optional)
- `Iterations:` or `--iterations N` — max iterations, default 50, soft cap 100 (optional)
- `Duration:` — max wall-clock time, e.g. `6h`, `90m` (optional)
- `Direction:` — `maximize` (default) or `minimize` (optional)
- `--no-limit` — override soft cap of 100 iterations (optional)

If ANY required field is missing:

```
ERROR: Missing required parameter(s): [list missing].
Run /autoresearch:plan to build your configuration interactively.
```

Then STOP. Do not proceed.

## The Loop Engine

### Phase 0: Preconditions

1. Confirm inside a git repo: `git rev-parse --is-inside-work-tree`
2. Confirm clean working tree: `git status --porcelain` must be empty
3. Dry-run Verify command — must exit 0 and output a parseable number
4. Dry-run Guard command (if provided) — must exit 0
5. Record baseline metric value as iteration 0
6. Record start timestamp
7. Initialize `autoresearch-results.tsv` if it doesn't exist:
   ```
   iteration\tcommit\tmetric\tdelta\tguard\tstatus\tdescription
   0\t<SHA>\t<baseline>\t-\tpass\tbaseline\tInitial state
   ```
8. Initialize counters: `current_iteration=0`, `consecutive_discards=0`, `best_metric=<baseline>`

If any precondition fails, print the error and STOP.

### Phase 1: Review

1. Read recent git history: `git log --oneline -20`
2. Read `autoresearch-results.tsv` — parse kept/discarded/crashed patterns
3. Identify:
   - What approaches have been tried
   - What's consistently improving
   - What keeps failing (avoid repeating)
   - Current consecutive discard count

### Phase 2: Ideate

1. Consider the Goal and current codebase state within Scope
2. Review what's been tried (from Phase 1) — do NOT repeat failed approaches
3. Pick ONE atomic change that:
   - Hasn't been tried before
   - Is likely to improve the metric
   - Stays within Scope
4. If `consecutive_discards >= 5`: STRATEGY SHIFT
   - Abandon current approach entirely
   - Target different files within Scope
   - Try a fundamentally different technique
   - Log: "Strategy shift after 5 consecutive discards"

### Phase 3: Modify

1. Read the target file(s) before modifying (ALWAYS)
2. Make exactly ONE atomic change
3. Stay strictly within Scope globs
4. Prefer minimal, focused changes over large rewrites

### Phase 4: Commit

1. Stage ONLY files within Scope: `git add <changed files>`
2. Commit with message: `autoresearch: <concise description of what changed and why>`
3. This commit happens BEFORE verification — rollback is always `git revert HEAD --no-edit`

### Phase 5: Verify

1. Run the Verify command
2. Parse the numeric output
3. Compare to `best_metric`:
   - If Direction is `maximize`: improvement = new > best
   - If Direction is `minimize`: improvement = new < best

### Phase 5.5: Guard

1. Skip if no Guard command configured
2. Run Guard command
3. Must exit 0 — any non-zero exit means the change is discarded regardless of metric

### Phase 6: Decide

**Keep** (metric improved or held steady with meaningful change AND guard passed):

- Reset `consecutive_discards = 0`
- Update `best_metric = new_metric`
- Log status: `keep`

**Discard** (metric worsened OR guard failed):

- Run `git revert HEAD --no-edit`
- Increment `consecutive_discards`
- Log status: `discard`

**Crash** (verify or guard command failed to execute):

- Run `git revert HEAD --no-edit`
- Log status: `crash`
- Continue to next iteration (crashes don't count toward consecutive discards)

### Phase 7: Log

Append a row to `autoresearch-results.tsv`:

```
<iteration>\t<commit_sha>\t<metric_value>\t<delta>\t<guard_status>\t<status>\t<description>
```

Delta format: `+N`, `-N`, or `0` relative to previous iteration's metric.

### Phase 8: Repeat or Stop

Check stop conditions in order:

1. `current_iteration >= max_iterations` → STOP (reason: "iterations exhausted")
2. Duration exceeded (if configured) → STOP (reason: "duration limit reached")
3. `consecutive_discards >= 10` → STOP (reason: "stuck") → Send Discord alert
4. Metric goal achieved (if determinable from Goal) → STOP (reason: "goal reached")

If none triggered: increment `current_iteration`, go to Phase 1.

### End of Run: Morning Report

Execute all three report channels:

**1. Write `autoresearch-report.md`:**

```markdown
# Autoresearch Report

## Summary

- **Goal:** <goal>
- **Started:** <timestamp>
- **Finished:** <timestamp>
- **Duration:** <wall clock>
- **Iterations:** <completed> / <max>
- **Stop reason:** <reason>

## Metric

- **Baseline:** <value>
- **Final:** <value>
- **Net change:** <delta> (<percentage>%)

## Kept Changes

| #   | Commit | Metric | Delta | Description |
| --- | ------ | ------ | ----- | ----------- |

<rows from results.tsv where status=keep>

## Discarded Changes

| #   | Description | Reason |
| --- | ----------- | ------ |

<rows from results.tsv where status=discard>

## Crashes

<if any>

## Stuck Episodes

<if any: what triggered, what strategy shift was attempted>

## Recommendations

<suggestions for next run based on patterns observed>
```

**2. Print terminal summary:**

```
═══ autoresearch complete ═══
Duration:   <time> (<iterations>/<max> iterations)
Metric:     <baseline> → <final> (<delta>%)
Kept:       <count> changes
Discarded:  <count> changes
Crashed:    <count>
Stop reason: <reason>
Report:     ./autoresearch-report.md
═══════════════════════════════
```

**3. Discord notification:**
Use the Discord plugin reply tool to send:

- On success: `autoresearch complete: <iterations> iterations, <kept> kept, metric <baseline>→<final> (<delta>%). See autoresearch-report.md`
- On stuck: `autoresearch STUCK after 10 consecutive discards at iteration <N>. <kept> changes kept so far, metric <baseline>→<current> (<delta>%). Review report and re-launch with adjusted params.`

Note: Discord notification requires the Discord plugin to be configured. If not available, skip silently.

## Subcommand Dispatch

When invoked as `/autoresearch` (no subcommand), execute the core loop above.

For subcommands, read the corresponding workflow reference:

- `/autoresearch:plan` → `references/plan-workflow.md`
- `/autoresearch:debug` → `references/debug-workflow.md`
- `/autoresearch:fix` → `references/fix-workflow.md`
- `/autoresearch:security` → `references/security-workflow.md`

## Critical Rules

1. **Loop until done** — never stop early unless a stop condition is met
2. **Read before write** — always read target files before modifying
3. **One change per iteration** — atomic, reviewable, revertable
4. **Mechanical verification only** — metrics from commands, never self-assessment
5. **Automatic rollback** — any regression is immediately reverted
6. **Simplicity wins** — prefer the simplest change that improves the metric
7. **Git as memory** — every kept change is committed, agent reads its own history
8. **No interaction** — never ask questions during the loop, fail fast instead
