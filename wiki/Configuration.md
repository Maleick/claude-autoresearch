# Configuration

## Required Parameters

| Parameter | Description                      | Example                                             |
| --------- | -------------------------------- | --------------------------------------------------- |
| `Goal:`   | What to improve                  | `"Reduce test execution time"`                      |
| `Scope:`  | File globs to modify             | `"src/**/*.ts"`                                     |
| `Metric:` | What the verify command measures | `"test duration in seconds"`                        |
| `Verify:` | Command that outputs a number    | `"npm test 2>&1 \| grep Time \| awk '{print \$2}'"` |

## Optional Parameters

| Parameter                        | Default               | Description                                               |
| -------------------------------- | --------------------- | --------------------------------------------------------- |
| `Guard:`                         | none                  | Command that must exit 0 after each change                |
| `Iterations:` / `--iterations N` | 50                    | Max iterations (soft cap 100, override with `--no-limit`) |
| `Duration:`                      | none                  | Max wall-clock time (`6h`, `90m`)                         |
| `Direction:`                     | maximize              | `maximize` or `minimize` the metric                       |
| `Target:`                        | none                  | Stop when metric reaches this value                       |
| `MetricPattern:`                 | last number in stdout | Regex to extract metric (e.g. `"score: ([0-9.]+)"`)       |
| `Timeout:`                       | 300                   | Per-command timeout in seconds                            |
| `--no-limit`                     | off                   | Remove 100-iteration soft cap                             |
| `--resume`                       | off                   | Resume from `autoresearch-state.json`. Re-supply `Verify:` on resume; `Guard:` remains optional. |

## Resume Behavior

When resuming a run, pass `Verify:` again. The state file is treated as run metadata only; `Verify:` and `Guard:` values stored on disk are not executed.

## Stop Conditions

| Condition       | Trigger                                              |
| --------------- | ---------------------------------------------------- |
| Iteration limit | `iteration >= max_iterations`                        |
| Duration limit  | Wall-clock time exceeds `Duration:`                  |
| Metric goal     | Metric reached `Target:`                             |
| Stuck           | 10 consecutive discards                              |
| Plateau         | Last 20 iterations had <1% cumulative improvement    |
| Crash loop      | 5 consecutive crashes                                |
| Goal satisfied  | All Scope files pass verify + guard with no findings |

## MetricPattern Examples

```bash
# Default: last number in stdout
Verify: "npm test 2>&1 | tail -1"

# Named capture with regex
MetricPattern: "duration: ([0-9.]+)ms"

# Score from JSON output
Verify: "node score.js | jq '.score'"
MetricPattern: "([0-9.]+)"
```
