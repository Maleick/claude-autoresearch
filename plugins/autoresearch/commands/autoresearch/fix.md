---
name: autoresearch:fix
description: Error repair loop — fixes errors one at a time, auto-reverting on regression, until zero remain
argument-hint: "[--target <cmd>] [--guard <cmd>] [--scope <glob>] [--category <type>] [--skip-lint] [--from-debug] [--force-branch] [--iterations N]"
---

EXECUTE IMMEDIATELY — do not deliberate, do not ask clarifying questions before reading the protocol.

## Argument Parsing (do this FIRST)

Extract these from $ARGUMENTS — the user may provide extensive context alongside flags. Ignore prose and extract ONLY flags/config:

- `--target <cmd>` or `Target:` — explicit verify command
- `--guard <cmd>` or `Guard:` — safety command that must always pass
- `--scope <glob>` or `Scope:` — file globs to fix
- `--category <type>` — only fix: test, type, lint, or build
- `--skip-lint` — skip lint fixes, focus on tests/types/build only
- `--from-debug` — read findings from latest debug session
- `--force-branch` — skip the branch safety check (use when already on a feature branch)
- `Iterations:` or `--iterations N` — integer for bounded mode (CRITICAL: run exactly N iterations then stop)

If `Iterations: N` or `--iterations N` is found, set `max_iterations = N`. Track `current_iteration` starting at 0. After iteration N, print final summary and STOP. Also stops when error count = 0.

All remaining text in $ARGUMENTS is additional context — use it to understand the problem but do not treat it as flags.

## Execution

1. Read the fix workflow: `.claude/skills/autoresearch/references/fix-workflow.md`
   - Also read: `.claude/skills/autoresearch/references/results-logging.md` (for TSV log format)
2. If target and scope are missing — **FAIL FAST**: print a clear error listing the missing fields and an example invocation, then STOP. Do NOT use `AskUserQuestion` — this command must run unattended.
3. Execute the fix workflow (Phase 0-8). Pass `--force-branch` to Phase 0 if set. ONE fix per iteration, never suppress errors, auto-revert on regression
4. If bounded: after each iteration, check `current_iteration < max_iterations`. If not, STOP and print summary.

Stream all output live — never run in background.
