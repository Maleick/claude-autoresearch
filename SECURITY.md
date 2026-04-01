# Security

Autoresearch is an autonomous iteration engine that modifies code unattended. Safety is enforced through invariants built into the protocol.

## Safety Invariants

These rules apply to all autoresearch commands and cannot be overridden:

1. **Branch isolation** — All work happens on `autoresearch/<timestamp>` branches, never on main/master.
2. **Clean discard** — Failed experiments are removed with `git reset --hard HEAD~1`, not revert commits.
3. **Fail-fast** — Missing required parameters cause immediate error and stop. The engine never prompts mid-loop.
4. **One atomic change per iteration** — Each iteration makes exactly one small, reviewable change.
5. **Mechanical verification only** — Metrics come from shell commands, never from LLM self-assessment.
6. **Guard enforcement** — If a Guard command is configured, it must pass or the change is discarded.
7. **Command timeouts** — All shell commands have a 300-second default timeout. Timeout = crash.
8. **State persistence** — Checkpoint state is written to `autoresearch-state.json` after every phase.
9. **Git hygiene** — `git status --porcelain` is checked at the start of every iteration.

## Branch Isolation

Autoresearch never commits to the default branch. All changes are made on a timestamped branch (`autoresearch/YYYYMMDD-HHMM`). After the run completes, the user decides what to merge. The branch is disposable.

## Guard Commands

A Guard command is an optional secondary verification that must pass for any change to be kept. Even if the primary metric improves, a failing Guard causes the change to be discarded. This prevents metric gaming at the expense of other quality dimensions.

## Reporting Vulnerabilities

If you find a security issue in the autoresearch plugin itself, please open a private security advisory on the [GitHub repository](https://github.com/Maleick/claude-autoresearch/security/advisories).
