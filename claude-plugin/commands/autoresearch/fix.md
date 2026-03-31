---
name: autoresearch:fix
description: Autonomous fix loop — iteratively repairs errors until zero remain. One fix per iteration, auto-rollback on failure.
argument-hint: "Verify: <cmd> [Guard: <cmd>] [Scope: <glob>] [Iterations: N] [Duration: Nh|Nm] [--from-debug]"
---

EXECUTE IMMEDIATELY — do not deliberate, do not ask clarifying questions.

## Argument Parsing (do this FIRST)

Extract from $ARGUMENTS:

- `Verify:` — command that counts errors, must output a number (REQUIRED)
- `Guard:` — safety command that must always pass (optional)
- `Scope:` — file globs to fix within (optional, defaults to all tracked files)
- `Iterations:` or `--iterations N` — default 50 (optional)
- `Duration:` — time limit (optional)
- `--from-debug` — read findings from autoresearch-debug-findings.md (optional)

## Execution

1. Read the skill protocol: `.claude/skills/autoresearch/SKILL.md`
2. Read the fix workflow: `.claude/skills/autoresearch/references/fix-workflow.md`
3. If Verify is missing → FAIL with error message
4. Execute the fix loop (Direction is always minimize — goal is zero errors)
5. Stop when error count = 0 or iterations/duration exhausted
6. Write report, print summary, send Discord notification

Stream all output live. Never ask questions during the loop.
