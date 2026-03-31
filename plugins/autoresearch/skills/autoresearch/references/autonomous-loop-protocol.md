# Autonomous Loop Protocol

You are an autonomous iteration engine. Follow this protocol exactly. Each phase must complete before the next begins.

---

## Phase 0: Preconditions

Before the first iteration, validate all of the following. If any check fails, STOP and report the failure.

1. **Git repo check.** Confirm the current directory is inside a git repository.
2. **Clean working tree.** Run `git status --porcelain`. If output is non-empty, STOP — the working tree must be clean.
3. **Create isolated branch.** Run `git checkout -b autoresearch/<YYYYMMDD-HHMM>` using the current timestamp. NEVER run on the default branch (main/master). If the user passes `--force-branch`, skip the branch check — otherwise, refuse.
4. **Validate Verify command.** Run the Verify command once. Confirm it exits successfully and its output contains a number. If it fails or returns no number, STOP.
5. **Validate Guard command.** If a Guard command is configured, run it and confirm exit code 0. If it fails, STOP.
6. **Record baseline metric.** The number extracted in step 4 is iteration 0's metric. Store it as `baseline` and `previous_best`.
7. **Record start time.** Capture wall-clock time for Duration limit tracking.
8. **Initialize results log.** Create or append to `autoresearch-results.tsv` with a header row if the file is new (see results-logging.md for format).
9. **Write initial `autoresearch-state.json`** with all config and baseline values. This file persists loop state for crash recovery and observability. Update this file after every subsequent phase completes. Initial contents:
   ```json
   {
     "run_id": "<branch-name>",
     "branch": "autoresearch/<timestamp>",
     "goal": "<goal text>",
     "scope": "<glob>",
     "direction": "maximize|minimize",
     "verify_cmd": "<cmd>",
     "guard_cmd": "<cmd or null>",
     "timeout_sec": 300,
     "iteration": 0,
     "max_iterations": 50,
     "duration_limit": "8h",
     "start_time": "<ISO8601>",
     "previous_best": 42.0,
     "baseline": 42.0,
     "consecutive_discards": 0,
     "last_phase_completed": "phase_0_preconditions",
     "last_commit_sha": "abc1234",
     "status": "running"
   }
   ```

---

## Phase 1: Review

Read recent history to avoid repeating failed approaches.

0. **Working tree hygiene check.** Run `git status --porcelain`. If the working tree is dirty, something went wrong in the previous iteration. Attempt cleanup: `git checkout -- .` and `git clean -fd`. If still dirty after cleanup, STOP with an error.
1. Run `git log --oneline -20` to see recent commits on this branch.
2. Read `autoresearch-results.tsv` to see metrics and outcomes from prior iterations.
3. Identify patterns:
   - Which changes improved the metric?
   - Which changes were discarded? Why?
   - Is the metric plateauing?
4. Note the current **consecutive discard count**.

---

## Phase 2: Ideate

Choose the next change to try.

1. Based on the Goal, the Scope, the review from Phase 1, and the current codebase state, pick **ONE** change that has not been tried.
2. The change must be within Scope. Do not modify files outside Scope.
3. If the consecutive discard count reaches 5: **change strategy entirely**. Try a fundamentally different approach — target different files within Scope, use a different algorithm, restructure differently. Do not keep making minor variations of a failing idea.

---

## Phase 3: Modify

Make exactly one atomic change.

1. **Read before writing.** Always read a file's current contents before modifying it.
2. Make the change. It must be small, focused, and reviewable — one logical unit of work.
3. Do not make multiple unrelated changes in a single iteration.

---

## Phase 4: Commit

Commit the change before verification so that discard is a clean reset.

1. Stage only files within Scope: `git add <changed files>`.
2. Commit with message format: `autoresearch: <short description of what changed>`.
3. Do NOT run verification before committing. The commit exists so we can cleanly reset.

---

## Phase 5: Verify

Measure the effect of the change.

1. **Run the Verify command** with a hard timeout (default: 300 seconds, configurable via `Timeout:` param). If the command does not complete within the timeout, kill it, treat this iteration as a **Crash**, and continue. Use `timeout <N>` on Unix/macOS. On Windows, use `python3 -c "import subprocess; subprocess.run([...], timeout=N)"` as a cross-platform fallback.
2. **Extract the metric:** take the LAST line of stdout, strip whitespace, and parse as a float. If the last line is not a valid number, try matching the LAST number found anywhere in stdout using regex `[-+]?[0-9]*\.?[0-9]+`. If no number can be extracted, treat as **Crash**.
3. **Sanity check:** if the extracted metric differs from `previous_best` by more than 100x (i.e., `metric / previous_best > 100` or `previous_best / metric > 100`), log a warning: "Metric sanity check failed -- extracted value differs by >100x from previous. Treating as Crash to prevent silent metric breakage." Treat as **Crash**.
4. Compare to `previous_best`:
   - If Direction is `minimize`: improvement means the metric **decreased**.
   - If Direction is `maximize`: improvement means the metric **increased**.
5. If the Verify command crashes (non-zero exit without a metric), mark this iteration as **Crash**.

---

## Phase 5.5: Guard

Run the Guard check (skip if no Guard command is configured).

1. **Run the Guard command** with the same timeout rules as Phase 5.
2. If exit code is 0: pass.
3. If exit code is non-zero: fail. The change will be discarded regardless of metric improvement.

---

## Phase 6: Decide

Determine the outcome for this iteration. Exactly one of three outcomes applies:

### Keep

- Metric **strictly improved** AND Guard passed. Equal metrics are treated as Discard -- if the metric did not move, the change had no measurable effect.
- Update `previous_best` to the new metric.
- Reset consecutive discard counter to 0.
- Update `autoresearch-state.json` with new `previous_best`, `consecutive_discards`, `last_phase_completed`, and `last_commit_sha`.

### Discard

- Metric worsened, metric unchanged, OR Guard failed.
- Run `git reset --hard HEAD~1` to remove the commit entirely.
- Run `git clean -fd` to remove any untracked files generated during the iteration (build artifacts, coverage reports, temp files, etc.).
- Increment consecutive discard counter.
- Update `autoresearch-state.json` with new `consecutive_discards`, `last_phase_completed`, and `last_commit_sha`.
- Note: use `git reset --hard HEAD~1`, NOT `git revert`. The isolated branch should have clean history -- only kept changes survive.

### Crash

- Verify or Guard command failed to execute (not a metric result, an execution failure).
- Run `git reset --hard HEAD~1` to remove the commit.
- Run `git clean -fd` to remove any untracked files generated during the iteration (build artifacts, coverage reports, temp files, etc.).
- Log the crash with error details.
- Update `autoresearch-state.json` with `last_phase_completed` and crash status.
- Continue to the next iteration.

---

## Phase 7: Log

Append one row to `autoresearch-results.tsv` with the iteration results. See results-logging.md for the exact column format.

After logging, update `autoresearch-state.json` with the current `iteration`, `last_phase_completed: "phase_7_log"`, and `status`.

---

## Phase 8: Repeat or Stop

Check stop conditions. If ANY one triggers, end the loop.

| Condition       | Trigger                                                           |
| --------------- | ----------------------------------------------------------------- |
| Iteration limit | `iteration >= max_iterations`                                     |
| Duration limit  | Wall-clock time since start exceeds the configured duration       |
| Metric goal     | Metric has reached or passed the target value                     |
| Stuck           | 10 consecutive discards                                           |
| Plateau         | Last 20 iterations had less than 1% cumulative metric improvement |

**Plateau detection** prevents the loop from running for hours making negligible improvements. Cumulative improvement is measured as `abs(metric_at_iteration_N - metric_at_iteration_N-20) / abs(baseline - metric_at_iteration_N-20)`. Only active after 20+ iterations.

### Stuck Recovery Table

| Consecutive Discards | Action                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1-4                  | Normal. Keep iterating with incremental changes.                                                                      |
| 5                    | **Strategy shift.** Try a fundamentally different approach. Target different files within Scope. Rethink the problem. |
| 6-9                  | Continue with the new strategy from the shift at 5.                                                                   |
| 10                   | **STOP.** Write the morning report with stuck analysis.                                                               |

If no stop condition is met, return to **Phase 1** for the next iteration.

---

## End of Run: Morning Report

When the loop ends (for any reason), generate the following:

### 1. Report File

Write `autoresearch-report.md` in the project root containing:

- **Run summary:** goal, scope, direction, branch name, start/end time, total iterations.
- **Metric trajectory:** baseline value -> final value (with percentage change).
- **Kept changes:** list each kept commit with SHA, description, and metric delta.
- **Discarded changes:** list each discarded change with description and reason.
- **Stuck episodes:** if any strategy shifts occurred, describe what was tried and why it failed.
- **Stop reason:** which condition triggered the stop.
- **Recommendations:** what to try in the next run based on observed patterns.

### 2. Terminal Summary

Print a compact summary to the terminal:

```
autoresearch complete.
Branch: autoresearch/<timestamp>
Iterations: <total> (<kept> kept, <discarded> discarded)
Metric: <baseline> -> <final> (<direction> goal)
Stop reason: <reason>
```

---

## Branch Merge-Back

Do NOT auto-merge back to the default branch. After the run completes, print these instructions for the user:

```
To review changes:
  git diff main...autoresearch/<timestamp>

To merge all changes:
  git checkout main
  git merge autoresearch/<timestamp>

To cherry-pick specific changes:
  git cherry-pick <sha>
```

The user decides what to keep. The autoresearch branch is disposable — it can be deleted after review.
