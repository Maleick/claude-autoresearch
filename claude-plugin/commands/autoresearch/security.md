---
name: autoresearch:security
description: Offensive security audit — STRIDE + OWASP Top 10 + red-team with exploit PoCs for every finding
argument-hint: "Scope: <glob> [--fix] [--fail-on <severity>] [Iterations: N] [Duration: Nh|Nm]"
---

EXECUTE IMMEDIATELY — do not deliberate, do not ask clarifying questions.

## Argument Parsing (do this FIRST)

Extract from $ARGUMENTS:

- `Scope:` — file globs to audit (REQUIRED)
- `--fix` — auto-remediate confirmed findings after writing PoC (optional)
- `--fail-on <severity>` — exit non-zero if findings at/above severity: critical, high, medium (optional)
- `Iterations:` or `--iterations N` — default 30 (optional)
- `Duration:` — time limit (optional)

## Execution

1. Read the skill protocol: `.claude/skills/autoresearch/SKILL.md`
2. Read the security workflow: `.claude/skills/autoresearch/references/security-workflow.md`
3. If Scope is missing → FAIL with error message
4. Execute the security audit loop with 4 adversarial personas
5. Write exploit PoCs for every confirmed vulnerability
6. If --fix: remediate and verify PoC fails after fix
7. Write report, print summary, send Discord notification
8. If --fail-on: exit non-zero if threshold met

Stream all output live. Never ask questions during the loop.
