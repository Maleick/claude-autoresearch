# State Management

Autoresearch persists loop state to `autoresearch-state.json` in the project root after every phase. This enables crash recovery and run resumption.

## State File: `autoresearch-state.json`

Written after every phase completion. Gitignored (add to .gitignore if not present).

### Schema

```json
{
  "run_id": "autoresearch/20260331-0100",
  "branch": "autoresearch/20260331-0100",
  "goal": "Reduce bundle size",
  "scope": "src/**/*.ts",
  "metric": "bundle size KB",
  "direction": "minimize",
  "verify_cmd": "npm run build 2>&1 | tail -1",
  "guard_cmd": "npm test",
  "metric_pattern": null,
  "target": null,
  "timeout_sec": 300,
  "iteration": 15,
  "max_iterations": 50,
  "duration_limit": "8h",
  "start_time": "2026-03-31T01:00:00Z",
  "previous_best": 128.5,
  "baseline": 185.0,
  "consecutive_discards": 2,
  "last_phase_completed": "phase_7_log",
  "last_commit_sha": "abc1234",
  "status": "running"
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| run_id | string | Unique identifier = branch name |
| branch | string | The isolated autoresearch branch |
| goal | string | The user's Goal text |
| scope | string | File glob pattern |
| metric | string | Metric description |
| direction | string | "maximize" or "minimize" |
| verify_cmd | string | The Verify shell command |
| guard_cmd | string or null | The Guard shell command |
| metric_pattern | string or null | Optional regex for metric extraction |
| target | number or null | Target metric value for goal-achieved stop |
| timeout_sec | integer | Per-command timeout in seconds |
| iteration | integer | Current iteration number |
| max_iterations | integer | Iteration limit |
| duration_limit | string or null | Wall-clock duration limit |
| start_time | string | ISO 8601 start timestamp |
| previous_best | number | Best metric value seen so far |
| baseline | number | Initial metric value (iteration 0) |
| consecutive_discards | integer | Current streak of consecutive discards |
| last_phase_completed | string | Last successfully completed phase identifier |
| last_commit_sha | string | SHA of the last commit (for validation) |
| status | string | "running", "completed", "stuck", "crashed" |

### When to Write

Update the state file after:
- Phase 0 completion (initial state with baseline)
- Phase 6 completion (after Keep/Discard/Crash decision — updates iteration, previous_best, consecutive_discards)
- Phase 7 completion (after logging — updates last_phase_completed)
- End of run (updates status to completed/stuck)

### Resume Protocol

When `--resume` is used:
1. Read `autoresearch-state.json` from project root
2. Validate: file exists, status is "running", branch exists in git
3. Checkout the branch: `git checkout <branch>`
4. Restore all loop variables from the state file
5. Verify git state: `git log --oneline -1` SHA matches `last_commit_sha`
6. If validation fails: warn and offer to start fresh instead
7. Resume from Phase 1 (Review) of the next iteration

### Crash Recovery

If a session crashes mid-run:
- The state file persists on disk
- Git commits persist on the isolated branch
- Results TSV persists
- User can resume with `/autoresearch --resume`
- If crash happened mid-phase (between state writes), the resume logic detects the inconsistency via SHA validation and can either retry the phase or skip to the next iteration
