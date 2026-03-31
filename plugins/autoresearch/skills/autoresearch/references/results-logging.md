# Results Logging Format

File: `autoresearch-results.tsv` (gitignored --- runtime artifact, not committed)

## Format

Tab-separated values with header row:

```
run_id	iteration	commit	metric	delta	guard	status	description	duration_sec
```

## Columns

| Column | Type | Description |
|---|---|---|
| run_id | string | Branch name identifying the run (e.g., `autoresearch/20260331-0100`) |
| iteration | int | 0-indexed iteration number. 0 = baseline. |
| commit | string | Short SHA of the commit (7 chars). `-` for baseline or discarded. |
| metric | float | Numeric value from the Verify command |
| delta | string | Change from previous best: `+N`, `-N`, or `-` for baseline |
| guard | string | `pass`, `fail`, `skip` (if no Guard configured), or `crash` |
| status | string | `baseline`, `keep`, `discard`, `crash`, `stuck`, or `timeout` |
| description | string | Brief description of what was changed |
| duration_sec | int | Wall-clock seconds for this iteration (0 for baseline) |

## Example

```
run_id	iteration	commit	metric	delta	guard	status	description	duration_sec
autoresearch/20260331-0100	0	abc1234	42	-	pass	baseline	Initial state	0
autoresearch/20260331-0100	1	def5678	45	+3	pass	keep	Optimized database query in users.ts	145
autoresearch/20260331-0100	2	-	44	-1	pass	discard	Tried caching layer, slight regression	92
autoresearch/20260331-0100	3	ghi9012	46	+1	pass	keep	Removed unused imports reducing parse time	78
autoresearch/20260331-0100	4	-	46	0	pass	discard	Refactored loop --- no improvement	110
autoresearch/20260331-0100	5	-	-	-	crash	timeout	Verify command timed out	300
```

## Rules

- Create the file with header row at Phase 0 (baseline) if it doesn't exist
- Append (never overwrite) if the file already exists from a prior run
- Baseline row always has status `baseline` and delta `-`
- Discarded iterations have commit `-` (the commit was reset, not preserved)
- Crash iterations have metric `-` and delta `-`
- The description should be a single line, no tabs, under 100 characters
- During Phase 1 (Review), filter to rows matching the current `run_id`. Do not let prior runs influence strategy or discard streak calculations.
- Record `duration_sec` as the elapsed wall-clock seconds from the start of Phase 2 (Ideate) to the end of Phase 7 (Log) for each iteration. Baseline row has duration_sec = 0.
- The `timeout` status indicates the Verify command exceeded its time limit; metric and delta are `-`

## Reading the Log

During Phase 1 (Review), read the TSV to understand:
- Filter by current run_id first --- ignore rows from prior runs
- Overall trend: is the metric generally improving?
- Recent streak: how many consecutive discards?
- What descriptions appear in `keep` vs `discard` rows --- learn what works
- If crash entries exist: what patterns caused crashes?
- Check duration_sec for unusually long iterations --- may indicate slow verify commands or complex changes
