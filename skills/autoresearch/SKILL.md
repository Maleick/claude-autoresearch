---
name: autoresearch
description: "Run a subagent-first structured improve-verify loop in OpenCode. Activate with /autoresearch or specialized modes like /autoresearch:plan, /autoresearch:debug, /autoresearch:fix, /autoresearch:learn, /autoresearch:predict, /autoresearch:scenario, /autoresearch:security, /autoresearch:ship."
metadata:
  short-description: "Subagent-first autonomous iteration loop for OpenCode"
---

# Auto Research for OpenCode

Use this skill when the task is larger than a one-shot edit and benefits from repeated experiments with mechanical verification, parallel subagent input, and a main-agent orchestrator that keeps the Auto Research loop moving.

## Activation Contract

When invoked:

1. Read `references/core-principles.md`
2. Read `references/structured-output-spec.md`
3. Read `references/subagent-orchestration.md`
4. For new interactive runs, read `references/interaction-wizard.md`, `references/plan-workflow.md`, and `references/loop-workflow.md`
5. For state and results semantics, read `references/state-management.md` and `references/results-logging.md`
6. For specialized modes, read the matching workflow reference:
   - `references/debug-workflow.md`
   - `references/fix-workflow.md`
   - `references/learn-workflow.md`
   - `references/predict-workflow.md`
   - `references/scenario-workflow.md`
   - `references/security-workflow.md`
   - `references/ship-workflow.md`

## Subagent-First Orchestration

The main agent is the orchestrator. Subagents are the standing execution pool.

- Keep a small, persistent subagent pool alive across iterations.
- Use subagents for bounded context gathering, alternative generation, verification, and critique.
- Feed subagent findings back into the next iteration before making another code change.
- The main agent owns the final decision, the edit, and the run state.
- Approval belongs before launch. After launch, continue by default unless the user stops the run.

## Required Internal Fields

Infer or confirm before launching:

- **Goal** — What outcome should this run optimize?
- **Metric** — What numeric metric tracks progress?
- **Direction** — `lower` or `higher`
- **Verify** — The mechanical command that measures the metric

Strongly recommended:

- **Run Mode** — `foreground` or `background`
- **Scope** — In-scope files or subsystem
- **Guard** — Optional guard command for regression catch

## Execution Rules

1. Always read relevant in-scope files before the first write.
2. Baseline exactly once at run start.
3. Make one focused experiment per iteration.
4. Verify mechanically. Do not keep on intuition alone.
5. Record every iteration before the next one starts.
6. Keep strict improvements, discard regressions.
7. Continue until the stop condition is met.

## Background Control

```bash
autoresearch init --goal "..." --metric "..." --direction "lower" --verify "npm test"
autoresearch status
autoresearch stop
autoresearch resume
autoresearch complete
```

## Output

Follow `references/structured-output-spec.md`. Print a setup summary before the first iteration, short progress updates during the loop, and a completion summary when done.