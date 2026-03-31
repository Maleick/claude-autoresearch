# Results Logging Format

File: `autoresearch-results.tsv` (gitignored --- runtime artifact, not committed)

## Format

Tab-separated values with header row:

```
iteration	commit	metric	delta	guard	status	description
```

## Columns

| Column | Type | Description |
|---|---|---|
| iteration | int | 0-indexed iteration number. 0 = baseline. |
| commit | string | Short SHA of the commit (7 chars). `-` for baseline or discarded. |
| metric | float | Numeric value from the Verify command |
| delta | string | Change from previous best: `+N`, `-N`, or `-` for baseline |
| guard | string | `pass`, `fail`, `skip` (if no Guard configured), or `crash` |
| status | string | `baseline`, `keep`, `discard`, `crash`, or `stuck` |
| description | string | Brief description of what was changed |

## Example

```
iteration	commit	metric	delta	guard	status	description
0	abc1234	42	-	pass	baseline	Initial state
1	def5678	45	+3	pass	keep	Optimized database query in users.ts
2	-	44	-1	pass	discard	Tried caching layer, slight regression
3	ghi9012	46	+1	pass	keep	Removed unused imports reducing parse time
4	-	46	0	pass	discard	Refactored loop --- no improvement
5	-	-	-	crash	crash	Verify command timed out
```

## Rules

- Create the file with header row at Phase 0 (baseline) if it doesn't exist
- Append (never overwrite) if the file already exists from a prior run
- Baseline row always has status `baseline` and delta `-`
- Discarded iterations have commit `-` (the commit was reset, not preserved)
- Crash iterations have metric `-` and delta `-`
- The description should be a single line, no tabs, under 100 characters

## Reading the Log

During Phase 1 (Review), read the TSV to understand:
- Overall trend: is the metric generally improving?
- Recent streak: how many consecutive discards?
- What descriptions appear in `keep` vs `discard` rows --- learn what works
- If crash entries exist: what patterns caused crashes?
