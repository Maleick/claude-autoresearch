---
name: autoresearch:debug
description: Bug hunter — iterates through scientific-method investigation to surface multiple bugs, not just the first one
argument-hint: "[--fix] [--scope <glob>] [--symptom <text>] [--severity <level>] [--technique <name>] [--iterations N]"
---

EXECUTE IMMEDIATELY — do not deliberate, do not ask clarifying questions before reading the protocol.

## Argument Parsing (do this FIRST)

Extract these from $ARGUMENTS — the user may provide extensive context alongside flags. Ignore prose and extract ONLY flags/config:

- `--fix` — if present, auto-switch to /autoresearch:fix after finding bugs
- `--scope <glob>` or `Scope:` — file globs to investigate
- `--symptom "<text>"` or `Symptom:` — description of what's broken
- `--severity <level>` — minimum severity to report (critical/high/medium/low)
- `--technique <name>` — force a specific investigation technique (binary-search, differential, minimal-reproduction, trace, pattern-search, working-backwards, rubber-duck)
- `Iterations:` or `--iterations N` — integer for bounded mode (CRITICAL: run exactly N iterations then stop)

If `Iterations: N` or `--iterations N` is found, set `max_iterations = N`. Track `current_iteration` starting at 0. After iteration N, print final summary and STOP.

All remaining text in $ARGUMENTS is additional context — use it to understand the problem but do not treat it as flags.

## Execution

1. Read the debug workflow: `.claude/skills/autoresearch/references/debug-workflow.md`
   - Also read: `.claude/skills/autoresearch/references/results-logging.md` (for logging findings)
2. If scope is missing — **FAIL FAST**: print a clear error listing the missing fields and an example invocation, then STOP. Do NOT use `AskUserQuestion` — this command must run unattended.
3. Execute the 7-phase debug loop
4. If bounded: after each iteration, check `current_iteration < max_iterations`. If not, STOP and print summary.

Stream all output live — never run in background.
