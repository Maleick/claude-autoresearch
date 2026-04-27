# State Management

`autoresearch-state.json` is the run checkpoint.

## Core Fields

- `run_id`: stable identifier for the current run
- `status`: `initialized`, `running`, `stopping`, `stopped`, or `completed`
- `mode`: `foreground` or `background`
- `goal`: human-readable objective
- `metric`: name, direction, baseline, latest, and best values
- `subagent_pool`: standing-pool plan, role activation, and re-anchor guidance
- `continuation_policy`: launch approval boundary and post-launch stop rules
- `stats`: total iterations, keep/discard counters, best iteration, and discard streak
- `flags`: stop request, needs-human marker, and background activity
- `last_iteration`: summary of the latest completed iteration

## Rules

1. Baseline exactly once when the run is initialized.
2. Update `updated_at` on every state mutation.
3. Keep `metric.latest` aligned with the most recent finished iteration.
4. Only update `metric.best` on strict improvement.
5. Only the orchestrator records iterations or mutates the authoritative run state.
6. Set `flags.needs_human=true` when autonomous progress should stop for user input.
7. For detached runs, `flags.background_active` reflects whether a background owner is currently expected to continue the loop.
8. If the pool metadata is missing from an older state file, reconstruct it from the goal, scope, and mode before resuming.

## Resume Semantics

- `python scripts/autoresearch_runtime_ctl.py resume` clears `stop_requested` and marks the background run active again.
- Resume does not create a new run; it continues the existing state snapshot.
- Resume should re-anchor the standing pool with the latest metric, last iteration, and active role guidance before the next handoff.
- Completed runs are not resumable; return to the previous state by starting a new run.
- If the run is not a background run, resume should fail fast.

## Completion Semantics

- `python scripts/autoresearch_runtime_ctl.py complete` moves a background run to `completed`, clears `background_active`, and ends the detached session lifecycle.
