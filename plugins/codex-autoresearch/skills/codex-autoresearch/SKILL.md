---
name: codex-autoresearch
description: "Run a subagent-first structured improve-verify loop in Codex. Use this when the user wants an autonomous or semi-autonomous iteration cycle toward a measurable goal, with the main agent orchestrating a standing subagent pool for debugging, cleanup, hardening, or release-readiness work."
metadata:
  short-description: "Run a subagent-first autoresearch loop"
---

# Auto Research for Codex

Use this skill when the task is larger than a one-shot edit and benefits from repeated experiments with mechanical verification, parallel subagent input, and a main-agent orchestrator that keeps the Auto Research loop moving.

## Activation Contract

When the skill is invoked:

1. Read `references/core-principles.md`.
2. Read `references/structured-output-spec.md`.
3. Read `references/subagent-orchestration.md`.
4. For runtime re-anchoring, also read `references/runtime-hard-invariants.md`.
5. For a new interactive run, also read `references/interaction-wizard.md`, `references/plan-workflow.md`, and `references/loop-workflow.md`.
6. For state and results semantics, also read `references/state-management.md` and `references/results-logging.md`.
7. If the user asks for a specialized mode, also read the matching workflow reference:
   - `references/debug-workflow.md`
   - `references/fix-workflow.md`
   - `references/learn-workflow.md`
   - `references/predict-workflow.md`
   - `references/scenario-workflow.md`
   - `references/security-workflow.md`
   - `references/ship-workflow.md`
8. For background control (`status`, `stop`, `resume`, `launch`), use the helper scripts in `scripts/`.
9. Prefer the bundled helpers over manual edits to run artifacts.

## Subagent-First Orchestration

The main agent is the orchestrator. Subagents are the standing execution pool.

- Keep a small, persistent subagent pool alive across iterations instead of re-spawning ad hoc workers every round.
- Use subagents for bounded context gathering, alternative generation, verification, and critique.
- Feed subagent findings back into the next iteration before making another code change.
- Keep the local bundle narrower than the reference repo: use the compact references and helpers in this repository instead of expanding into a larger specialist surface unless the user asks for it.
- The main agent owns the final decision, the edit, and the run state.
- Approval belongs before launch. After launch, continue by default unless the user stops the run, the configured stop condition is reached, or a real `needs_human` blocker appears.

## Required Internal Fields

Infer or confirm these before launching a new run:

- `Goal`
- `Scope`
- `Metric`
- `Direction`
- `Verify`

Strongly recommended:

- `Guard`
- `Run Mode` (`foreground` or `background`)
- `Iteration Cap`
- `Run Duration` (for unattended runs, for example `5h`)
- `Required Keep Labels` (for example `verified`)
- `Required Stop Labels` (for example `ship-ready`)
- `Memory` (`autoresearch-memory.md`, if present; load it automatically unless the operator overrides the path)
- `Stop Condition`
- `Rollback Strategy`

## Execution Rules

1. Always read the relevant in-scope files before the first write of a new run.
2. Ask at least one repo-grounded clarification round for a new interactive launch.
3. Require an explicit `foreground` or `background` choice before starting.
4. Baseline exactly once at run start.
5. Make one focused experiment per iteration.
6. Verify mechanically. Do not retain a change on intuition alone.
7. If required keep labels are configured, do not keep an iteration unless those labels are present.
8. If required stop labels are configured, only treat a retained keep as stop-ready when those labels are present.
9. For long unattended runs, prefer installing the optional session hooks so resume/start context stays anchored.
10. Record every completed iteration before the next one starts.
11. After a completed run, the next wizard/init/launch flow should automatically carry `autoresearch-memory.md` into the next run unless the operator explicitly overrides it.
12. Do not revert unrelated user work.
13. Treat run artifacts as generated working state, not source files to commit.
14. If the run gets stuck, change strategy instead of brute-forcing the same idea.

## Mode Routing

Use the default loop for metric-driven optimization.

Use specialized workflows when the user asks to plan, debug, fix, learn, predict, expand scenarios, run a security pass, or prepare to ship.

For planning, prefer `python scripts/autoresearch_wizard.py` to generate the initial setup summary before asking the user the remaining questions.

## Background Control

Use these helpers when managing a detached run:

- `python scripts/autoresearch_runtime_ctl.py launch ...`
- `python scripts/autoresearch_runtime_ctl.py launch ... --dry-run`
- `python scripts/autoresearch_runtime_ctl.py launch ... --memory-path autoresearch-memory.md`
- `python scripts/autoresearch_runtime_ctl.py status`
- `python scripts/autoresearch_runtime_ctl.py status --report-path autoresearch-report.md`
- `python scripts/autoresearch_runtime_ctl.py complete`
- `python scripts/autoresearch_runtime_ctl.py complete --self-improvement-path autoresearch-self-improvement.md --memory-path autoresearch-memory.md`
- `python scripts/autoresearch_runtime_ctl.py stop`
- `python scripts/autoresearch_runtime_ctl.py resume`

Use `python scripts/autoresearch_supervisor_status.py` when a supervisor needs a deterministic relaunch decision.
Use `python scripts/autoresearch_hooks_ctl.py install` if you want SessionStart/Stop hooks to re-anchor overnight or resumed runs.
Use `python scripts/autoresearch_complete_run.py` to complete a foreground run and write the post-run learning artifacts without a one-off script.

## Expected Output

Follow `references/structured-output-spec.md`.

At minimum:

- print a setup summary before the first iteration
- show short progress updates during the loop
- finish with a completion or blocker summary

## Notes

This skill bundle does not attempt to prescribe one exact Codex runtime environment. It gives Codex a stable Auto Research protocol and file format so the interactive workflow and any external runner can share state cleanly.

## Plugin Distribution

Treat the repository root as the source of truth for this skill bundle.

When shipping the plugin package, mirror these root sources into `plugins/codex-autoresearch/skills/codex-autoresearch/`:

- `SKILL.md`
- `agents/openai.yaml`
- `scripts/*.py`
- `references/*.md`

Keep these release surfaces aligned before tagging a user-facing release:

- `plugins/codex-autoresearch/.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json`
- `CHANGELOG.md`

Re-run quick validation on the bundled plugin payload before release:

- `python scripts/check_plugin_distribution.py`
- `python -m pytest tests/test_plugin_distribution.py`
