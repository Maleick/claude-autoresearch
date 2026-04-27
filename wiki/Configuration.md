# Configuration

## Core fields

Auto Research revolves around these fields:

- `Goal` — What outcome to optimize
- `Scope` — In-scope files or subsystem
- `Metric` — Numeric metric that tracks progress
- `Direction` — `lower` or `higher`
- `Verify` — Mechanical command that measures the metric

Common optional fields:

- `Guard` — Guard command for regression catch
- `Iterations` — Iteration cap
- `Duration` — Wall-clock cap (e.g., `5h` or `300m`)
- `Run Mode` — `foreground` or `background`

## Runtime Artifacts

| Artifact | Purpose |
| --- | --- |
| `.autoresearch/state.json` | Current run checkpoint |
| `autoresearch-results.tsv` | Iteration log |
| `autoresearch-launch.json` | Background launch manifest |
| `autoresearch-report.md` | End-of-run report |
| `autoresearch-memory.md` | Reusable memory |

## Subagent Pool

The standing pool provides: orchestrator, scout, analyst, verifier, synthesizer, and role-specialized variants. The pool is reused across iterations.

## CLI Configuration

```bash
autoresearch init --goal "..." --metric "..." --direction "lower" --verify "npm test"
autoresearch init --repo /path/to/repo --results-path results.tsv --state-path state.json
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full artifact reference.