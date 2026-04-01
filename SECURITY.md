# Security

Autoresearch is an autonomous iteration engine that modifies code unattended. Safety is enforced through invariants built into the protocol.

## Safety Invariants

The authoritative list of all 10 safety invariants lives in [`SKILL.md`](plugins/autoresearch/skills/autoresearch/SKILL.md). Key points:

- All work on isolated `autoresearch/<timestamp>` branches — never on main/master
- Failed experiments cleanly reset (`git reset --hard HEAD~1`), not reverted
- Mechanical verification only — metrics from commands, never LLM self-assessment
- Guard commands must pass or changes are discarded
- All commands have a hard timeout (default 300s)
- Duplicate changes are detected and skipped

## Branch Isolation

Autoresearch never commits to the default branch. All changes are made on a timestamped branch (`autoresearch/YYYYMMDD-HHMM`). After the run completes, the user decides what to merge. The branch is disposable.

## Guard Commands

A Guard command is an optional secondary verification that must pass for any change to be kept. Even if the primary metric improves, a failing Guard causes the change to be discarded. This prevents metric gaming at the expense of other quality dimensions.

## Reporting Vulnerabilities

If you find a security issue in the autoresearch plugin itself, please open a private security advisory on the [GitHub repository](https://github.com/Maleick/claude-autoresearch/security/advisories).
