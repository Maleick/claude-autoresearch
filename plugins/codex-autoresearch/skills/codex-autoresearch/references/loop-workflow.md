# Loop Workflow

## Phase 1: Setup

1. Read the relevant code and repo configuration.
2. Read `references/subagent-orchestration.md` so the standing subagent pool and task split are clear before the first iteration.
3. Generate the initial setup summary with `scripts/autoresearch_wizard.py` when the request is incomplete.
4. Summarize the goal, scope, metric, direction, verify command, guard, and subagent plan.
5. Ask one grounded clarification round if needed.
6. Initialize artifacts with `scripts/autoresearch_init_run.py`.

## Phase 2: Iterate

For each iteration:

1. Re-state the goal, scope, metric, verify command, and current subagent assignments.
2. Use the standing subagent pool to gather context, challenge the leading hypothesis, and surface verification gaps.
3. Make one focused change.
4. Run verify and guard commands.
5. Feed subagent findings back into the next iteration plan.
6. Keep or discard the experiment.
7. Record the outcome with `scripts/autoresearch_record_iteration.py`.

## Phase 3: Decide

Stop when:

- the configured goal is met
- the user requests stop
- the iteration cap is reached
- the run genuinely needs human input

Once the user approves launch, continue by default until one of those stop conditions is true. Do not restart the approval cycle on every pass; re-anchor the same standing pool and keep iterating.

Background supervisors should use `scripts/autoresearch_supervisor_status.py` to make the relaunch decision from the same artifacts.
