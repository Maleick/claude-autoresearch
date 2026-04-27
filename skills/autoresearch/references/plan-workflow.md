# Plan Workflow

Use this when the user invokes `$codex-autoresearch` without a complete setup or explicitly asks for a wizard.

## Goal

Turn a vague request into a launch-ready setup summary with:

- goal
- scope
- metric
- direction
- verify command
- optional guard
- run mode
- stop condition

## Steps

1. Read the repo before asking anything.
2. Infer defaults where the repo makes them obvious.
3. Generate the setup summary with `python scripts/autoresearch_wizard.py`.
4. Ask only the missing or risky questions.
5. Let the user correct the setup once before launch.
6. If the user approves, initialize artifacts and start the loop.

## Question Priorities

Ask these in order when missing:

1. Outcome: what should improve?
2. Scope: what files or subsystem are in play?
3. Metric: what number or count tracks progress?
4. Verify: what command measures it mechanically?
5. Guard: what command must keep passing?
6. Mode: `foreground` or `background`?

## Defaults

- If the repo has `pytest.ini` or a `tests/` directory, default `verify` to `pytest`.
- If the repo contains `scripts/autoresearch_supervisor_status.py`, offer it as the default guard.
- Default metric direction to `lower` unless the user clearly wants to maximize a score.
