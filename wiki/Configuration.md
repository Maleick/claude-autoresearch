# Configuration

## Core fields

Auto Research revolves around these fields:

- `Goal`
- `Scope`
- `Metric`
- `Direction`
- `Verify`

Common optional fields:

- `Guard`
- `Iterations`
- `Duration`
- `Target`
- `MetricPattern`
- `Timeout`
- `Run Mode`

## Artifact compatibility

Auto Research now preserves both results-log names:

- `research-results.tsv`
- `autoresearch-results.tsv`

Use `autoresearch-state.json` as the checkpoint state for both runtime surfaces.
