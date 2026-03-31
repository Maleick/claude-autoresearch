---
name: autoresearch
description: Autonomous overnight iteration engine. Modify → Verify → Keep/Discard → Repeat. Runs unattended overnight and reports in the morning.
argument-hint: "Goal: <text> Scope: <glob> Metric: <text> Verify: <cmd> [Guard: <cmd>] [Iterations: N] [Duration: Nh|Nm] [Direction: minimize|maximize] [--no-limit]"
---

EXECUTE IMMEDIATELY — do not deliberate, do not ask clarifying questions before reading the protocol.

## Argument Parsing (do this FIRST, before reading any files)

Extract these from $ARGUMENTS:

- `Goal:` — text after "Goal:" keyword (REQUIRED)
- `Scope:` or `--scope <glob>` — file globs (REQUIRED)
- `Metric:` — text after "Metric:" keyword (REQUIRED)
- `Verify:` — shell command after "Verify:" keyword (REQUIRED)
- `Guard:` — shell command after "Guard:" keyword (optional)
- `Iterations:` or `--iterations N` — integer, default 50, soft cap 100 (optional)
- `Duration:` — time limit e.g. `6h`, `90m` (optional)
- `Direction:` — `maximize` (default) or `minimize` (optional)
- `--no-limit` — override 100 iteration soft cap (optional)

## Execution

1. Read the skill protocol: `.claude/skills/autoresearch/SKILL.md`
2. If ALL required fields are present → proceed directly to Phase 0
3. If ANY required field is missing → print error and tell user to run `/autoresearch:plan`
4. Execute the autonomous loop: Phase 0 through Phase 8, repeat until stop condition
5. Write morning report, print terminal summary, send Discord notification

IMPORTANT: Start executing immediately. Stream all output live — never run in background. Never stop early unless a stop condition is met. Never ask questions during the loop.
