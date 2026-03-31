# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Autoresearch is a **Claude Code marketplace plugin** (not an npm package) that provides an autonomous overnight iteration engine for git-backed codebases. It follows the pattern: Modify → Verify → Keep/Discard → Repeat.

**Distribution:** Installed via `/plugin marketplace add Maleick/claude-autoresearch` then `/plugin install autoresearch@Maleick-claude-autoresearch`. There is no build step, no compilation, no `npm install`. The plugin is pure markdown — skills, commands, and reference docs.

## Architecture

```
.claude-plugin/marketplace.json    ← marketplace registry (lists plugins in this repo)
plugins/autoresearch/
  .claude-plugin/plugin.json       ← plugin manifest (name, version, description)
  commands/
    autoresearch.md                ← main command — parses args, delegates to skill
    autoresearch/                  ← sub-commands (debug, fix, learn, plan, predict, scenario, security, ship)
  skills/autoresearch/
    SKILL.md                       ← skill entry point — safety invariants, stop conditions, artifact list
    references/                    ← detailed workflow protocols consumed by each command
      autonomous-loop-protocol.md  ← core iteration phases (0-8)
      state-management.md          ← checkpoint/resume protocol
      results-logging.md           ← TSV log format
      {debug,fix,learn,plan,predict,scenario,security,ship}-workflow.md
docs/specs/                        ← design specs (historical reference)
```

**Key relationship:** Each command `.md` file parses arguments and then reads its corresponding `references/*-workflow.md` protocol. The skill's `SKILL.md` defines shared invariants that all commands inherit.

**Commands** are frontmatter-annotated `.md` files invoked via `/autoresearch` and `/autoresearch:<sub>`. The `argument-hint` frontmatter field defines the CLI signature.

## Safety Invariants (Never Violate)

Authoritative list is in `SKILL.md`. Summary:

1. **Branch isolation** — all work on `autoresearch/<timestamp>`, never on main/master
2. **Clean discard** — `git reset --hard HEAD~1` for failed experiments, not revert commits
3. **Fail-fast** — missing required parameters → error and stop, never prompt mid-loop
4. **One atomic change per iteration** — small, reviewable diffs only
5. **Mechanical verification only** — metrics from commands, never LLM self-assessment
6. **Guard enforcement** — Guard command must pass or change is discarded
7. **Command timeouts** — 300s default, timeout = crash
8. **State persistence** — checkpoint to `autoresearch-state.json` after every phase
9. **Git hygiene** — `git status --porcelain` checked at start of every iteration

## Runtime Artifacts (All Gitignored)

- `autoresearch-state.json` — checkpoint state for `--resume`
- `autoresearch-results.tsv` — iteration log scoped by `run_id`
- `autoresearch-report.md` — morning report
- `autoresearch-debug-findings.md` — debug mode findings
- `autoresearch-security/` — security audit artifacts and PoCs

## Editing Guidelines

- **Command files** must have `name`, `description`, and `argument-hint` in YAML frontmatter
- **Skill files** must have `name` and `description` in YAML frontmatter
- When modifying a workflow protocol in `references/`, verify the corresponding command still reads it correctly
- The version lives in `plugins/autoresearch/.claude-plugin/plugin.json` — bump it on releases
- There are no tests to run — this is a pure-markdown plugin. Verify changes by reading the files and checking cross-references between commands, skills, and reference docs.
