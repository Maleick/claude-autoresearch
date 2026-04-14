# Structured Output Spec

Interactive runs should use three output phases.

## Setup Summary

Before launch, summarize:

- goal
- scope
- metric and direction
- verify command
- guard command, if any
- run mode
- stop condition or iteration cap

## Iteration Update

After each completed iteration, report:

- iteration number
- decision (`keep`, `discard`, or `needs_human`)
- short explanation
- current best-known metric, if available

## Completion Summary

When the run ends, report:

- why it ended
- total iterations
- kept vs discarded counts
- best recorded metric, if available
- next action, if a blocker remains
