---
name: autoresearch:security
description: Security audit — STRIDE threat model, OWASP Top 10 checks, and red-team probing with adversarial personas
argument-hint: "[--diff] [--fix] [--fail-on <severity>] [--scope <glob>] [--depth <level>] [--baseline <path>] [--iterations N]"
---

EXECUTE IMMEDIATELY — do not deliberate, do not ask clarifying questions before reading the protocol.

## Argument Parsing (do this FIRST)

Extract these from $ARGUMENTS — the user may provide extensive context alongside flags. Ignore prose and extract ONLY flags/config:

- `--diff` — only audit files changed since last audit
- `--fix` — auto-fix confirmed Critical/High findings
- `--fail-on <severity>` — exit non-zero for CI/CD gating (critical/high/medium)
- `--scope <glob>` or `Scope:` — file globs to audit
- `--depth <level>` or `Depth:` — shallow (5 iterations), standard (15), deep (30+)
- `--baseline <path>` — path to a previous security audit report. Produces a delta report showing new, resolved, and persistent findings.
- `Focus:` — specific area to focus on (e.g., "authentication and authorization")
- `Iterations:` or `--iterations N` — integer for bounded mode (CRITICAL: run exactly N iterations then stop)

If `Iterations: N` or `--iterations N` is found, set `max_iterations = N`. Track `current_iteration` starting at 0. After iteration N, print final summary and STOP.

All remaining text in $ARGUMENTS is additional context — use it to understand scope but do not treat it as flags.

## Execution

1. Read the security workflow: `.claude/skills/autoresearch/references/security-workflow.md`
   - Also read: `.claude/skills/autoresearch/references/results-logging.md` (for TSV log format)
2. If scope is missing — **FAIL FAST**: print a clear error listing the missing fields and an example invocation, then STOP. Do NOT use `AskUserQuestion` — this command must run unattended.
3. Execute the security audit (Phase 0-7)
4. If bounded: after each iteration, check `current_iteration < max_iterations`. If not, STOP and print summary.

Stream all output live — never run in background.
