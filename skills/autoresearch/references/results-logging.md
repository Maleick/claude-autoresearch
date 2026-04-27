# Results Logging

`autoresearch-results.tsv` is the primary append-only results log per run.

The runtime maintains `autoresearch-results.tsv` as the canonical iteration log.

## Required Columns

The TSV header is:

`timestamp iteration decision metric_value verify_status guard_status hypothesis change_summary labels note`

## Logging Rules

1. Record exactly one row per completed iteration.
2. Treat each row as the orchestrator-owned result for that iteration, even when several subagents contributed evidence.
3. Use `keep`, `discard`, or `needs_human` as the decision.
4. Store the observed metric value as text; leave it blank only when no metric was produced.
5. Keep `change_summary` short and specific to the experiment that just finished.
6. Use `labels` for compact tags such as `test`, `perf`, `retry`, `docs`, or `security`.
7. Put blocker details, rollback notes, or subagent evidence worth preserving in `note`.

## Interpretation

- `verify_status=pass` means the primary metric command completed successfully.
- `guard_status=pass` means the regression guard also passed.
- `decision=keep` means the change survived verification and stays in the working tree.
- `decision=discard` means the change should be rolled back before the next experiment.
- `decision=needs_human` means the run hit ambiguity or risk that should stop autonomous progress.
