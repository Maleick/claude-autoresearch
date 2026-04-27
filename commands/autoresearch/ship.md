# /autoresearch:ship

Run the ship-readiness workflow.

## Activation

1. Read `skills/autoresearch/references/ship-workflow.md`
2. Read `skills/autoresearch/references/loop-workflow.md`

## When to Use

Use this when the user wants to prepare a change for release. Runs the full verify loop with a ship-readiness subagent pool.

## Execution

1. Baseline the current state.
2. Run the full improve-verify loop with ship-readiness gates.
3. Verify rollout risk and user-visible regressions mechanically.
4. Record final state.
5. Present the ship readiness summary.

Follow the ship workflow reference for release gates and handoff format.