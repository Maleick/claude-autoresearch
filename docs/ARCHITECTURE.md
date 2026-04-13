# Autoresearch Architecture

> Current reference for v2.2.0. The historical design spec is at `docs/specs/2026-03-30-autoresearch-design.md`.

## Plugin Structure

Autoresearch is a pure-markdown Claude Code plugin. There is no build step, no compilation, and no runtime binary. Claude Code reads the markdown files directly as commands and skills.

```
.claude-plugin/marketplace.json        ← marketplace registry
plugins/autoresearch/
  .claude-plugin/plugin.json           ← plugin manifest (name, version, autoUpdate)
  commands/
    autoresearch.md                    ← main command — wizard + direct execution
    autoresearch/                      ← sub-commands
      debug.md, fix.md, learn.md,
      plan.md, predict.md, scenario.md,
      security.md, ship.md
  skills/autoresearch/
    SKILL.md                           ← shared invariants, stop conditions, artifact list
    references/
      autonomous-loop-protocol.md      ← core phase loop (Phases 0–8)
      state-management.md              ← checkpoint/resume protocol
      results-logging.md               ← TSV log format and schema
      debug-workflow.md                ← 7-phase debug investigation
      fix-workflow.md                  ← error repair loop
      learn-workflow.md                ← documentation generation
      plan-workflow.md                 ← setup wizard
      predict-workflow.md              ← multi-persona analysis
      scenario-workflow.md             ← edge case generation
      security-workflow.md             ← STRIDE + OWASP audit
      ship-workflow.md                 ← 8-phase shipping checklist
```

## Execution Flow

When a user runs `/autoresearch`, Claude Code:

1. Reads `commands/autoresearch.md` — parses arguments, decides wizard vs. direct
2. Reads `skills/autoresearch/SKILL.md` — loads shared invariants (these apply to all commands)
3. Reads `references/autonomous-loop-protocol.md` — executes phases 0–8

Sub-commands follow the same pattern: `commands/autoresearch/fix.md` → `SKILL.md` → `references/fix-workflow.md`.

## Core Loop Phases

| Phase | Name             | Description                                                                          |
| ----- | ---------------- | ------------------------------------------------------------------------------------ |
| 0     | Pre-flight       | Validate params, check git status, create isolated branch                            |
| 1     | Baseline         | Run Verify command on current state, record baseline metric                          |
| 2     | Pre-flight check | Detect duplicate changes, check disk space, verify Guard passes                      |
| 2.5   | Generate         | Make one atomic change in Scope files                                                |
| 3     | Commit           | `git add -A && git commit`                                                           |
| 4     | Verify           | Run Verify command, extract metric                                                   |
| 4.5   | Reproduce        | Re-run Verify to confirm metric is stable (guards against flaky commands)            |
| 5     | Guard            | Run Guard command if set, check exit 0                                               |
| 6     | Evaluate         | Compare metric to best. Keep if improved; discard (`git reset --hard HEAD~1`) if not |
| 7     | Log              | Append row to `autoresearch-results.tsv`                                             |
| 8     | Loop             | Increment iteration counter, check all stop conditions, goto Phase 2 or stop         |

## State Machine

State is checkpointed to `autoresearch-state.json` after every phase. This enables `--resume` after crashes. On resume, executable commands come from the current invocation; the state file only restores non-executable loop metadata.

Schema fields: `run_id`, `schema_version`, `branch`, `iteration`, `max_iterations`, `best_metric`, `direction`, `goal`, `scope`, `verify_cmd`, `guard_cmd`, `start_time`, `duration_limit`, `discarded_descriptions`. `verify_cmd` and `guard_cmd` are record-only metadata and are not executed from the state file on resume.

## Safety Invariants

All 10 invariants are authoritative in `SKILL.md`. Summary:

1. Branch isolation — work only on `autoresearch/<timestamp>`
2. Clean discard — `git reset --hard HEAD~1` + `git clean -fd`, never revert commits
3. Fail-fast — missing required params → error and stop immediately
4. One atomic change per iteration
5. Mechanical verification only — metrics from commands, never LLM self-assessment
6. Guard enforcement — Guard must pass or change is discarded
7. Command timeouts — 300s default, timeout = crash
8. State persistence — checkpoint after every phase
9. Git hygiene — `git status --porcelain` checked before every iteration
10. Duplicate detection — skip changes matching previously discarded descriptions

## Runtime Artifacts

All gitignored — never committed to the repo by the loop.

| File                             | Created by    | Purpose                                       |
| -------------------------------- | ------------- | --------------------------------------------- |
| `autoresearch-state.json`        | Every command | Checkpoint state for `--resume`               |
| `autoresearch-results.tsv`       | Every command | Iteration log, TSV format, scoped by `run_id` |
| `autoresearch-report.md`         | End of run    | Human-readable report                         |
| `autoresearch-debug-findings.md` | `:debug`      | Bug findings                                  |
| `autoresearch-security/`         | `:security`   | Audit artifacts and PoC directory             |
| `.autoresearch-predict/`         | `:predict`    | Temporary persona files                       |
