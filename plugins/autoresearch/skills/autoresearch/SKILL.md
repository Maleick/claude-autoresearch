---
name: autoresearch
description: Autonomous Goal-directed Iteration engine. Compounds small improvements via Modify → Verify → Keep/Discard → Repeat.
---

# Autoresearch Skill

Autonomous iteration engine for Claude Code. Runs unattended on any git-backed codebase with a deterministic verification command.

## Core Concept

Given a Goal, Scope, Metric, and Verify command, autoresearch autonomously:
1. Creates an isolated `autoresearch/<timestamp>` branch
2. Makes one atomic change per iteration
3. Keeps improvements, resets regressions
4. Repeats until limit/goal/stuck

## Reference Files

The detailed protocols for each workflow are in `references/`:

| File | Used By | Purpose |
|------|---------|---------|
| `autonomous-loop-protocol.md` | `/autoresearch` | Core iteration loop (Phase 0-8) |
| `results-logging.md` | `/autoresearch` | TSV logging format |
| `plan-workflow.md` | `/autoresearch:plan` | Interactive setup wizard |
| `debug-workflow.md` | `/autoresearch:debug` | Scientific-method bug hunting |
| `fix-workflow.md` | `/autoresearch:fix` | Error repair loop |
| `learn-workflow.md` | `/autoresearch:learn` | Codebase documentation engine |
| `predict-workflow.md` | `/autoresearch:predict` | Multi-persona swarm analysis |
| `scenario-workflow.md` | `/autoresearch:scenario` | Use case & edge case generation |
| `security-workflow.md` | `/autoresearch:security` | STRIDE + OWASP + red-team audit |
| `ship-workflow.md` | `/autoresearch:ship` | Structured shipping workflow |

## Safety Invariants

These rules apply to ALL commands:

1. **Branch isolation** — always create `autoresearch/<timestamp>` branch. Never commit to main/master.
2. **Clean discard** — use `git reset --hard HEAD~1` (not `git revert`) to discard failed experiments.
3. **Fail-fast** — if required parameters are missing, print error and stop. Never prompt mid-loop.
4. **One change per iteration** — atomic, reviewable diffs only.
5. **Mechanical verification** — metrics come from running commands, never from LLM self-assessment.
6. **Guard enforcement** — if a Guard command is configured, it must pass or the change is discarded.

## Stop Conditions

Any one of these triggers a stop:
- Iteration limit reached
- Duration limit reached
- Metric goal achieved
- 10 consecutive discards (stuck)

## Output Artifacts

All runtime artifacts are gitignored:
- `autoresearch-results.tsv` — iteration log
- `autoresearch-report.md` — morning report
- `autoresearch-debug-findings.md` — debug findings
- `autoresearch-security/` — security audit artifacts and PoCs
