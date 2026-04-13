# State Management

Autoresearch persists loop state to `autoresearch-state.json` in the project root after every phase. This enables crash recovery and run resumption.

## State File: `autoresearch-state.json`

Gitignored (add to .gitignore if not present).

**Atomic write protocol:** Always write state to `autoresearch-state.json.tmp` first, then rename to `autoresearch-state.json`. This prevents corruption if the session crashes mid-write. On resume, if `autoresearch-state.json.tmp` exists but `autoresearch-state.json` does not, rename the `.tmp` file and resume.

### Schema

The state file includes a `schema_version` field for forward compatibility. When reading a state file, check the schema version:

- `schema_version: 1` — current format (v2.0.0+)
- If the field is missing, treat as schema version 1 (backwards compatible with v2.0.0 state files)
- Future versions may add fields. Unknown fields should be preserved on write, not dropped.

```json
{
  "schema_version": 1,
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
  "consecutive_crashes": 0,
  "last_phase_completed": "phase_7_log",
  "last_commit_sha": "abc1234",
  "status": "running"
}
```

### Fields

| Field                | Type           | Description                                       |
| -------------------- | -------------- | ------------------------------------------------- |
| run_id               | string         | Unique identifier = branch name                   |
| branch               | string         | The isolated autoresearch branch                  |
| goal                 | string         | The user's Goal text                              |
| scope                | string         | File glob pattern                                 |
| metric               | string         | Metric description                                |
| direction            | string         | "maximize" or "minimize"                          |
| verify_cmd           | string         | Last run's Verify shell command (record only; never trusted on resume execution) |
| guard_cmd            | string or null | Last run's Guard shell command (record only; never trusted on resume execution)  |
| metric_pattern       | string or null | Optional regex for metric extraction              |
| target               | number or null | Target metric value for goal-achieved stop        |
| timeout_sec          | integer        | Per-command timeout in seconds                    |
| iteration            | integer        | Current iteration number                          |
| max_iterations       | integer        | Iteration limit                                   |
| duration_limit       | string or null | Wall-clock duration limit                         |
| start_time           | string         | ISO 8601 start timestamp                          |
| previous_best        | number         | Best metric value seen so far                     |
| baseline             | number         | Initial metric value (iteration 0)                |
| consecutive_discards | integer        | Current streak of consecutive discards            |
| consecutive_crashes  | integer        | Current streak of consecutive crashes (default 0) |
| last_phase_completed | string         | Last successfully completed phase identifier      |
| last_commit_sha      | string         | SHA of the last commit (for validation)           |
| status               | string         | "running", "completed", "stuck", "crashed"        |

### When to Write

Update `autoresearch-state.json` after every phase completes. This ensures crash recovery can resume from the last completed phase rather than replaying multiple phases. Use the atomic write protocol (write to `.tmp`, then rename) for every state update.

### Resume Protocol

When `--resume` is used:

1. If `autoresearch-state.json.tmp` exists but `autoresearch-state.json` does not, rename the `.tmp` file before proceeding.
2. Read `autoresearch-state.json` from project root.
3. Validate: file exists, status is "running", branch exists in git.
4. Checkout the branch: `git checkout <branch>`.
5. Restore non-executable loop variables from the state file.
6. Treat `verify_cmd` and `guard_cmd` as untrusted metadata. Do **not** execute commands loaded from state.
7. Require command source from the current invocation: `Verify:` must be provided again, `Guard:` is optional. If `Verify:` is omitted, STOP with an error.
8. **SHA validation and mismatch recovery:**
   - Get current HEAD SHA via `git rev-parse HEAD`.
   - **(a) If working tree is dirty** (`git status --porcelain` is non-empty): run `git checkout -- .` and `git clean -fd`, then skip to the next iteration (Phase 1).
   - **(b) If clean but HEAD SHA is ahead of `last_commit_sha`:** run `git reset --hard <last_commit_sha>` to roll back to the last known-good state, then resume from Phase 1.
   - **(c) If HEAD SHA matches `last_commit_sha`:** resume from `current_phase` (the phase after `last_phase_completed`).
9. If none of the above conditions can be resolved: warn and offer to start fresh instead.

### Crash Recovery

If a session crashes mid-run:

- The state file persists on disk
- Git commits persist on the isolated branch
- Results TSV persists
- User can resume with `/autoresearch --resume`
- If crash happened mid-phase (between state writes), the resume logic detects the inconsistency via SHA validation and can either retry the phase or skip to the next iteration
