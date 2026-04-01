# Autoresearch — Autonomous Overnight Iteration Engine

**Date:** 2026-03-30
**Status:** Historical — this document describes the v1.0 design. See [README.md](../../README.md) for current documentation.

## Purpose

A Claude Code skill that runs autonomous improvement loops on any project overnight. You configure it before bed — Goal, Scope, Metric, Verify command, Guard command, iteration limit — and it compounds small, atomic improvements until the limit is reached or the goal is met. In the morning, you review a structured summary of everything that happened.

Core idea from Karpathy: **Modify → Verify → Keep/Discard → Repeat.**

## Design Principles

1. **Zero interaction after launch** — all config is front-loaded into the invocation. No `AskUserQuestion` mid-loop. If something is ambiguous, fail loudly and stop rather than guess.
2. **Safety by default** — automatic rollback on any regression. Guard commands prevent collateral damage. Soft cap at 100 iterations (override with `--no-limit`). Duration cap supported.
3. **Git as memory** — every kept change is a commit on an isolated branch. The agent reads its own git history to learn what worked and what didn't. Discarded changes are reset (removed from history), not reverted.
4. **Mechanical verification only** — metrics come from running commands (tests, linters, benchmarks), never from LLM self-assessment.
5. **One atomic change per iteration** — small, reviewable diffs. Never bundle multiple changes.
6. **Morning report everywhere** — structured markdown file + terminal summary + Discord notification on completion or stuck.

## Execution Models

The skill is execution-agnostic — it runs the same loop regardless of how it's launched. Two recommended paths:

### Manual Kick-off (Getting Started)

Open a terminal, run the command, leave it running overnight:

```bash
claude
> /autoresearch Goal: "..." Scope: "src/**/*.ts" Metric: "test pass count" Verify: "npm test -- --reporter=count" Iterations: 50
```

Best with `tmux` or a persistent terminal session. If the machine sleeps, the loop pauses and resumes on wake.

### Scheduled Remote Agent (Recommended for Overnight)

Use `/schedule` to create a cron trigger that runs autoresearch at a set time:

```bash
/schedule "autoresearch on project X" --cron "0 1 * * *" --project /path/to/project
```

This spins up a headless Claude Code session at the scheduled time, runs the loop, writes the report, sends the Discord notification, and exits. Survives sleep/restart.

## Commands

### `/autoresearch` — Core Loop

The main command. Runs the autonomous iteration loop.

**Invocation:**

```
/autoresearch Goal: <text> Scope: <glob> Metric: <text> Verify: <cmd> [Guard: <cmd>] [Iterations: N] [Duration: Nh|Nm] [Direction: minimize|maximize] [--no-limit]
```

**Required parameters:**

- `Goal:` — what you're trying to achieve (natural language, used for ideation)
- `Scope:` — file globs to modify (e.g., `src/**/*.ts`)
- `Metric:` — what the verify command outputs (e.g., "test pass count", "bundle size in KB")
- `Verify:` — shell command that outputs a number. This IS the metric.

**Optional parameters:**

- `Guard:` — shell command that must exit 0 after every change. Prevents regressions.
- `Iterations:` — max iterations (default: 50, soft cap: 100, override with `--no-limit`)
- `Duration:` — max wall-clock time (e.g., `6h`, `90m`). Loop stops when duration OR iteration limit is hit, whichever comes first.
- `Direction:` — `maximize` (default) or `minimize`
- `--no-limit` — removes the soft cap of 100 iterations (use with `Duration:` for safety)

**If any required parameter is missing:** Run `/autoresearch:plan` interactively to build the config, then launch.

### `/autoresearch:plan` — Setup Wizard

Interactive config builder. Walks through Goal → Scope → Metric → Verify → Guard → Direction → Iterations/Duration in focused questions. Outputs a ready-to-paste `/autoresearch` invocation.

This is the **ONLY** command that asks questions — all others are non-interactive.

### `/autoresearch:debug` — Bug Hunting Loop

Autonomous bug finder using scientific method: hypothesize → test → prove/disprove → log → repeat.

**Invocation:**

```
/autoresearch:debug Scope: <glob> [Symptom: <text>] [--fix] [Iterations: N] [Duration: Nh|Nm]
```

- Finds bugs, doesn't fix them (unless `--fix` chains to `/autoresearch:fix`)
- Every finding requires file:line evidence
- Outputs findings to `autoresearch-debug-findings.md`
- Discord notification on completion with finding count

### `/autoresearch:fix` — Error Repair Loop

Iterative fix loop. One fix per iteration, automatic rollback on regression.

**Invocation:**

```
/autoresearch:fix Verify: <cmd> [Guard: <cmd>] [Scope: <glob>] [Iterations: N] [Duration: Nh|Nm]
```

- Detects: test failures, type errors, lint errors, build errors
- Stops when error count hits 0 or iterations/duration exhausted
- Max 3 rework attempts per fix before moving on
- Discord notification on completion with errors remaining

### `/autoresearch:security` — Security Audit Loop

Offensive security audit. STRIDE threat modeling + OWASP Top 10 + red-team adversarial analysis with exploit proof-of-concepts.

**Invocation:**

```
/autoresearch:security Scope: <glob> [--fix] [--fail-on <severity>] [Iterations: N] [Duration: Nh|Nm]
```

- Maps trust boundaries and attack surfaces
- 4 adversarial personas: External Attacker, Insider Threat, Supply Chain, Infrastructure
- Every finding includes a working exploit PoC written to `autoresearch-security/poc-<vuln-slug>.{py,sh,js}`
- PoC files double as regression tests once the vulnerability is fixed
- Severity classification: Critical / High / Medium / Low
- `--fix` auto-remediates confirmed findings after writing the PoC
- `--fail-on` exits non-zero for CI/CD gating
- Outputs structured report to `autoresearch-security/`
- Discord notification on completion with finding summary by severity

## The Loop Engine (Core Protocol)

All commands share this iteration engine:

### Phase 0: Preconditions

- Confirm inside a git repo with clean working tree
- Create an isolated branch: `autoresearch/<timestamp>` — NEVER run on the default branch
- Validate Verify command runs and outputs a number
- Validate Guard command (if provided) exits 0
- Record baseline metric (iteration 0)
- Record start time (for Duration tracking)
- Create/append to `autoresearch-results.tsv`

### Phase 1: Review

- Read `git log --oneline -20` (what's been tried)
- Read `autoresearch-results.tsv` (what worked/failed)
- Identify patterns: what's improving, what's plateauing, what keeps failing
- Track consecutive discard count

### Phase 2: Ideate

- Based on Goal, review of past iterations, and current state
- Pick ONE change that hasn't been tried
- If >5 consecutive discards: change strategy entirely (different approach, different files within scope)

### Phase 3: Modify

- Make exactly ONE atomic change within Scope
- Read before writing (always)

### Phase 4: Commit

- `git add` changed files within Scope only
- Commit with message: `autoresearch: <description of change>`
- Commit BEFORE verification (so rollback = `git reset --hard HEAD~1` on isolated branch)

### Phase 5: Verify

- Run Verify command, extract numeric metric
- Compare to previous best

### Phase 5.5: Guard

- Run Guard command (if configured)
- Must exit 0 or change is discarded

### Phase 6: Decide

- **Keep:** metric improved (or equal + meaningful change) AND guard passed → reset consecutive discard counter
- **Discard:** metric worsened OR guard failed → `git reset --hard HEAD~1` → increment consecutive discard counter
- **Crash:** command failed to run → `git reset --hard HEAD~1`, log crash, continue

### Phase 7: Log

- Append row to `autoresearch-results.tsv`
- Format: `iteration | commit_sha | metric_value | delta | guard_status | decision | description`

### Phase 8: Repeat or Stop

- **Stop conditions** (any one triggers stop):
  - Iteration limit reached
  - Duration limit reached
  - Metric goal achieved
  - 10 consecutive discards (stuck) → Discord alert: "I'm stuck — see report for what was tried"
- Otherwise: go to Phase 1

### End of Run: Morning Report

**1. Markdown file** — `autoresearch-report.md` in project root:

- Run summary (start time, end time, iterations completed, wall-clock duration)
- Baseline → final metric (net improvement, percentage change)
- List of kept changes with commit SHAs and descriptions
- List of discarded changes (what was tried but didn't work)
- Stuck episodes (if any): what triggered them, what strategy change was attempted
- Stop reason (iterations exhausted / duration hit / goal reached / stuck)
- Recommendations for next run

**2. Terminal summary** — condensed version printed to stdout:

```
═══ autoresearch complete ═══
Duration:   6h 12m (47/50 iterations)
Metric:     42 → 67 (+59.5%)
Kept:       12 changes
Discarded:  34 changes
Crashed:    1
Stop reason: iterations exhausted
Report:     ./autoresearch-report.md
═══════════════════════════════
```

**3. Discord notification** — ping via Discord plugin:

```
autoresearch complete: 47 iterations, 12 kept, metric 42→67 (+59.5%). See autoresearch-report.md
```

If stopped due to being stuck:

```
autoresearch STUCK after 10 consecutive discards at iteration 23. 8 changes kept so far, metric 42→55 (+31%). Review report and re-launch with adjusted params.
```

## Stuck Recovery Behavior

| Consecutive Discards | Action                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------ |
| 1-4                  | Normal — keep iterating                                                                    |
| 5                    | Strategy shift — try fundamentally different approach, target different files within scope |
| 6-9                  | Continue with new strategy                                                                 |
| 10                   | **Stop.** Write morning report with stuck analysis. Send Discord alert.                    |

The stuck section of the morning report includes:

- What approaches were tried and why they failed
- Which files/areas were targeted
- Suggested parameter changes for the next run

## Results Log Format

File: `autoresearch-results.tsv` (gitignored)

```
iteration	commit	metric	delta	guard	status	description
0	abc1234	42	-	pass	baseline	Initial state
1	def5678	45	+3	pass	keep	Optimized database query in users.ts
2	ghi9012	44	-1	pass	discard	Tried caching layer, slight regression
```

Statuses: `baseline`, `keep`, `discard`, `crash`, `stuck`

## File Structure (Plugin Distribution)

```
claude-autoresearch/
├── .claude-plugin/
│   └── marketplace.json              # Marketplace manifest
├── plugins/
│   └── autoresearch/
│       ├── .claude-plugin/
│       │   └── plugin.json           # Plugin manifest
│       ├── commands/
│       │   ├── autoresearch.md       # Main slash command entry point
│       │   └── autoresearch/
│       │       ├── plan.md
│       │       ├── debug.md
│       │       ├── fix.md
│       │       ├── learn.md
│       │       ├── predict.md
│       │       ├── scenario.md
│       │       ├── security.md
│       │       └── ship.md
│       └── skills/
│           └── autoresearch/
│               ├── SKILL.md          # Core skill definition
│               └── references/
│                   ├── autonomous-loop-protocol.md
│                   ├── results-logging.md
│                   ├── plan-workflow.md
│                   ├── debug-workflow.md
│                   ├── fix-workflow.md
│                   ├── learn-workflow.md
│                   ├── predict-workflow.md
│                   ├── scenario-workflow.md
│                   ├── security-workflow.md
│                   └── ship-workflow.md
├── docs/
│   └── specs/
│       └── 2026-03-30-autoresearch-design.md
├── README.md
├── LICENSE
└── .gitignore
```

### Installation

**Via marketplace (recommended):**

```bash
/plugin marketplace add Maleick/claude-autoresearch
/plugin install autoresearch@Maleick-claude-autoresearch
/reload-plugins
```

## Key Differences from uditgoenka/autoresearch

| Aspect               | Original (v1.8.2)        | Ours                                                                 |
| -------------------- | ------------------------ | -------------------------------------------------------------------- |
| Commands             | 9                        | 9 (core, plan, debug, fix, security, learn, predict, scenario, ship) |
| Reference files      | 11                       | 10 (workflow refs + loop protocol + results logging)                 |
| Interactive mid-loop | Yes (7 questions)        | No — fail-fast if config incomplete                                  |
| Overnight capable    | Not designed for it      | Primary use case                                                     |
| Iteration limits     | Count only               | Count + Duration, soft cap 100                                       |
| Morning report       | No                       | Markdown + terminal + Discord                                        |
| Stuck handling       | >5 discards, keeps going | 5 = strategy shift, 10 = stop + Discord alert                        |
| Loop protocol        | Separate reference file  | Inline in SKILL.md                                                   |
| Security workflow    | Generic STRIDE/OWASP     | Full offensive — writes exploit PoCs                                 |
| Notifications        | None                     | Discord on complete/stuck                                            |
| Distribution         | Plugin only              | Plugin + manual install                                              |
