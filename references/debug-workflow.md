# Debug Workflow

Use this when the user wants investigation before repair.

## Goal

Produce evidence-backed findings, not speculative guesses.

## Loop

1. Read the suspected files and any failing output.
2. Form one falsifiable hypothesis.
3. Test that hypothesis mechanically.
4. Prove or disprove it with concrete evidence.
5. Record the finding with file references and impact.
6. Repeat with the next best hypothesis if more iterations remain.

## Output Shape

Each finding should capture:

- title
- file reference
- severity or impact
- hypothesis
- evidence
- likely fix direction

## Handoff

When the user wants repair after debugging, switch to the fix workflow and use the logged findings to choose the next experiment.
