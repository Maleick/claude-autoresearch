---
name: autoresearch:debug
description: Autonomous bug-hunting loop — scientific method iteration. Hypothesize, test, prove/disprove, repeat.
argument-hint: "Scope: <glob> [Symptom: <text>] [--fix] [Iterations: N] [Duration: Nh|Nm]"
---

EXECUTE IMMEDIATELY — do not deliberate, do not ask clarifying questions.

## Argument Parsing (do this FIRST)

Extract from $ARGUMENTS:

- `Scope:` — file globs to investigate (REQUIRED)
- `Symptom:` — description of what's broken (optional)
- `--fix` — chain to /autoresearch:fix after finding bugs (optional)
- `Iterations:` or `--iterations N` — default 30 (optional)
- `Duration:` — time limit (optional)

## Execution

1. Read the skill protocol: `.claude/skills/autoresearch/SKILL.md`
2. Read the debug workflow: `.claude/skills/autoresearch/references/debug-workflow.md`
3. If Scope is missing → FAIL with error message
4. Execute the debug loop
5. Write findings, print summary, send Discord notification

Stream all output live. Never ask questions during the loop.
