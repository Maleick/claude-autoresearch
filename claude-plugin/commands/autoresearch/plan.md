---
name: autoresearch:plan
description: Interactive setup wizard — builds a ready-to-paste /autoresearch invocation through focused questions
argument-hint: "[goal description]"
---

EXECUTE IMMEDIATELY.

## Argument Parsing

The user may provide a goal description in $ARGUMENTS. If present, use it as the starting point for Step 1.

## Execution

1. Read the plan workflow: `.claude/skills/autoresearch/references/plan-workflow.md`
2. Walk through the 6-step wizard
3. Output a ready-to-paste `/autoresearch` invocation
4. Ask if the user wants to launch it immediately

This is the ONLY autoresearch command that asks questions interactively.
