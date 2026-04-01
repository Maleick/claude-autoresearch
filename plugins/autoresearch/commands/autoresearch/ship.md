---
name: autoresearch:ship
description: Shipping workflow — guides code through an 8-phase checklist from readiness check to post-ship monitoring
argument-hint: "[--dry-run] [--auto] [--force] [--rollback] [--monitor N] [--type <type>] [--target <path>] [--checklist-only] [--changelog] [--iterations N]"
---

EXECUTE IMMEDIATELY — do not deliberate, do not ask clarifying questions before reading the protocol.

## Argument Parsing (do this FIRST)

Extract these from $ARGUMENTS — the user may provide extensive context alongside flags. Ignore prose and extract ONLY flags/config:

- `--dry-run` — validate everything but don't ship
- `--auto` — auto-approve if no errors
- `--force` — skip non-critical items (blockers enforced)
- `--rollback` — undo last ship action
- `--monitor N` — post-ship monitoring for N minutes
- `--type <type>` — override auto-detection (code-pr, code-release, deployment, content, etc.)
- `--checklist-only` — only generate checklist
- `--changelog` — auto-generate a CHANGELOG.md entry from the commits on the current branch (uses `git log` to summarize changes)
- `--target <path>` or `Target:` — what to ship (path, PR, artifact)
- `Iterations:` or `--iterations N` — bounded preparation iterations (CRITICAL: run exactly N prep iterations then ship)

If `Iterations: N` or `--iterations N` is found, set `max_iterations = N` for the preparation loop.

All remaining text in $ARGUMENTS is additional context — use it to understand what's being shipped but do not treat it as flags.

## Execution

1. Read the ship workflow: `.claude/skills/autoresearch/references/ship-workflow.md`
   - Also read: `.claude/skills/autoresearch/references/results-logging.md` (for TSV log format)
2. If ship type is unclear — **FAIL FAST**: print a clear error listing the missing fields and an example invocation, then STOP. Do NOT use `AskUserQuestion` — this command must run unattended.
3. Execute the 8-phase ship workflow

Stream all output live — never run in background.
