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

| File                          | Used By                  | Purpose                                  |
| ----------------------------- | ------------------------ | ---------------------------------------- |
| `autonomous-loop-protocol.md` | All code-modifying modes | Core iteration loop (Phase 0-8)          |
| `results-logging.md`          | All modes                | TSV logging format (with run_id scoping) |
| `state-management.md`         | All code-modifying modes | Checkpoint state file + resume protocol  |
| `plan-workflow.md`            | `/autoresearch:plan`     | Interactive setup wizard                 |
| `debug-workflow.md`           | `/autoresearch:debug`    | Scientific-method bug hunting            |
| `fix-workflow.md`             | `/autoresearch:fix`      | Error repair loop                        |
| `learn-workflow.md`           | `/autoresearch:learn`    | Codebase documentation engine            |
| `predict-workflow.md`         | `/autoresearch:predict`  | Multi-persona swarm analysis             |
| `scenario-workflow.md`        | `/autoresearch:scenario` | Use case & edge case generation          |
| `security-workflow.md`        | `/autoresearch:security` | STRIDE + OWASP + red-team audit          |
| `ship-workflow.md`            | `/autoresearch:ship`     | Structured shipping workflow             |

## Safety Invariants

These invariants apply to ALL commands. They are non-negotiable and cannot be overridden by user parameters or command arguments.

1. **Branch isolation** — always create `autoresearch/<timestamp>` branch. Never commit to main/master. The `--force-branch` flag skips the branch name check but does not allow committing to default branches.
2. **Clean discard** — use `git reset --hard HEAD~1` + `git clean -fd` to discard failed experiments. Never use `git revert` — the isolated branch should have clean history with only kept changes.
3. **Fail-fast** — if required parameters are missing, print error and stop. Never prompt mid-loop. All non-plan commands must run fully unattended.
4. **One atomic change per iteration** — each iteration makes exactly one small, focused, reviewable change. Multiple unrelated changes in a single iteration violate this invariant.
5. **Mechanical verification only** — metrics come from running shell commands, never from LLM self-assessment. Strict improvement only — equal metrics are treated as discard.
6. **Guard enforcement** — if a Guard command is configured, it must pass or the change is discarded, regardless of metric improvement.
7. **Command timeouts** — Verify and Guard commands have a hard timeout (default 300s). Timeout = Crash. Both the shell `timeout` command and the Bash tool's `timeout` parameter are set.
8. **State persistence** — loop state is checkpointed to `autoresearch-state.json` after every phase via atomic write (write to `.tmp`, then rename). Enables `--resume` after crashes.
9. **Git hygiene** — `git status --porcelain` is checked at the start of every iteration. Dirty tree = cleanup or stop. SHA guards prevent resetting the wrong commit.
10. **Duplicate detection** — before making a change, check the TSV log for previously discarded changes with similar descriptions. Skip changes that match a previously discarded approach (fuzzy match on description). This invariant prevents wasting iterations on approaches already proven ineffective.

## Stop Conditions

Any one of these triggers a stop:

1. **Iteration limit** — `iteration >= max_iterations`
2. **Duration limit** — wall-clock time exceeds the configured duration
3. **Metric target** — metric has reached or passed the `Target:` value (respecting Direction)
4. **Stuck** — 10 consecutive discards
5. **Plateau** — last 20 iterations had <1% cumulative metric improvement
6. **Crash loop** — 5 consecutive crashes (Verify/Guard command appears broken)
7. **Goal satisfaction** — if Goal is qualitative and all Scope files pass Verify + Guard with no findings, stop early

## Artifact Cleanup

Runtime artifacts accumulate across runs. Cleanup strategy:

- `autoresearch-state.json` — overwritten each run. Delete after merging the branch.
- `autoresearch-results.tsv` — append-only, scoped by `run_id`. Safe to keep indefinitely or truncate old run_ids.
- `autoresearch-report.md` — overwritten each run. Archive if needed before starting a new run.
- `autoresearch-debug-findings.md` — overwritten per debug session.
- `autoresearch-security/` — accumulates per audit. Delete after review.
- `.autoresearch-predict/` — cleaned up automatically at end of predict workflow.

## Output Artifacts

All runtime artifacts are gitignored:

| Artifact                         | Description                              | Lifecycle                        |
| -------------------------------- | ---------------------------------------- | -------------------------------- |
| `autoresearch-state.json`        | Checkpoint state (enables `--resume`)    | Overwritten each run             |
| `autoresearch-results.tsv`       | Iteration log (scoped by run_id)         | Append-only across runs          |
| `autoresearch-report.md`         | Morning report                           | Overwritten each run             |
| `autoresearch-debug-findings.md` | Debug mode findings                      | Overwritten per debug session    |
| `autoresearch-security/`         | Security audit artifacts and PoCs        | Accumulates, delete after review |
| `.autoresearch-predict/`         | Predict workflow temporary persona files | Auto-cleaned at end of workflow  |
