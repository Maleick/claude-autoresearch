# /autoresearch

Run a **subagent-first structured improve-verify loop** in OpenCode.

## Activation

1. Read `skills/autoresearch/references/loop-workflow.md`
2. Read `skills/autoresearch/references/core-principles.md`
3. Read `skills/autoresearch/references/state-management.md`
4. Read `skills/autoresearch/references/results-logging.md`
5. For interactive setup, read `skills/autoresearch/references/interaction-wizard.md`

## Required Fields

Collect these before launching:

- **Goal** — What outcome should this run optimize?
- **Metric** — What numeric metric tracks progress?
- **Direction** — `lower` or `higher`
- **Verify** — The mechanical command that measures the metric

## Execution Rules

1. Baseline exactly once at run start.
2. Make one focused experiment per iteration.
3. Verify mechanically. Do not keep on intuition alone.
4. Record every iteration before the next one starts.
5. Keep strict improvements, discard regressions.
6. Continue until the stop condition is met.

## Background Control

```bash
autoresearch init --goal "..." --metric "..." --direction "lower" --verify "npm test"
autoresearch status
autoresearch stop
autoresearch resume
autoresearch complete
```

## Output

Print a setup summary before the first iteration, progress updates during the loop, and a completion summary when done.

Follow `skills/autoresearch/references/structured-output-spec.md` for format.