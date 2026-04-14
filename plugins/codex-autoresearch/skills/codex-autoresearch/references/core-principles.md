# Core Principles

The loop exists to make disciplined progress, not noisy activity.

## Principles

- Work toward a metric that can be checked mechanically.
- Prefer one reversible change over a large speculative rewrite.
- Keep a guard when the target metric does not capture regression risk.
- Record every completed experiment in the same format.
- Change tactics when repeated experiments fail.
- Treat blockers explicitly instead of silently stalling.

## Artifact Discipline

- `autoresearch-state.json` is the current run snapshot.
- `research-results.tsv` is the append-only experiment log.
- `autoresearch-launch.json` is the last background launch request.

Only helper scripts should mutate these files when possible.
