# Predict Workflow

Use this when the user wants pre-mortem analysis, design critique, or ranked risks before editing.

## Goal

Surface likely failure modes and tradeoffs from multiple concrete angles.

## Steps

1. Define the scope and question being analyzed.
2. Generate a small set of reviewer lenses such as correctness, performance, security, maintainability, and DX.
3. Evaluate the same code through each lens.
4. Rank findings by severity and confidence.
5. If the user wants action, hand the top findings into debug or fix mode.
