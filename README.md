# Autoresearch

> **v2.1.0** — [Issues](https://github.com/Maleick/claude-autoresearch/issues)

Autonomous overnight iteration engine for [Claude Code](https://claude.ai/claude-code). Fire it before bed, review improvements in the morning.

Inspired by [Karpathy's autoresearch](https://github.com/karpathy/autoresearch). Applies constraint-driven autonomous iteration to any git-backed codebase with a deterministic verification command.

**Core loop:** Modify → Verify → Keep/Discard → Repeat.

## What It Does

You give autoresearch a goal, a scope (which files to touch), and a verification command that outputs a number. It then autonomously:

1. Creates an isolated `autoresearch/<timestamp>` branch
2. Makes one small, atomic change
3. Commits it
4. Runs your verification command
5. Keeps the change if the metric improved (strict improvement only — equal values are discarded), resets if it didn't
6. Repeats until iterations run out, time expires, or it gets stuck

Every kept change is a git commit on the isolated branch. Every discarded change is cleanly reset (no revert commits). In the morning you get a structured report (file + terminal summary) showing what happened.

## Commands

| Command                  | Purpose                                                               |
| ------------------------ | --------------------------------------------------------------------- |
| `/autoresearch`          | Core autonomous loop — runs unattended                                |
| `/autoresearch:plan`     | Interactive setup wizard — builds your config                         |
| `/autoresearch:debug`    | Scientific-method bug hunting                                         |
| `/autoresearch:fix`      | Iterative error repair until zero remain                              |
| `/autoresearch:security` | Autonomous security audit — STRIDE + OWASP Top 10 + red-team personas |
| `/autoresearch:learn`    | Autonomous codebase documentation engine                              |
| `/autoresearch:predict`  | Multi-persona swarm analysis from expert views                        |
| `/autoresearch:scenario` | Scenario-driven use case & edge case generator                        |
| `/autoresearch:ship`     | Structured shipping workflow (PR, release notes, deploy checklist)    |

## Quick Start

### Prerequisites

- [Claude Code](https://claude.ai/claude-code) with marketplace plugin support
- A git-backed codebase with a clean working tree (no uncommitted changes)
- A deterministic verification command that outputs a number

### Install

```bash
# Add the marketplace source
/plugin marketplace add Maleick/claude-autoresearch

# Install the plugin
/plugin install autoresearch@Maleick-claude-autoresearch

# Reload to activate
/reload-plugins
```

### Update

The marketplace caches the plugin at install time — it won't automatically detect new versions on the remote. To check for and install updates:

```bash
/plugin marketplace update Maleick/claude-autoresearch
```

You'll be prompted to enable auto-update. With auto-update on, the marketplace checks for new versions periodically. Without it, run the update command manually when you want the latest version.

You can verify your installed version in **Customize > Autoresearch** — the version number is shown at the top of the plugin panel.

### Use

```bash
# Use the wizard to set up your first run
/autoresearch:plan

# Or configure directly
/autoresearch Goal: "Reduce bundle size" Scope: "src/**/*.ts" Metric: "bundle size KB" Verify: "npm run build 2>&1 | grep 'bundle size' | awk '{print $3}'" Direction: minimize Iterations: 50
```

## Running Overnight

### Option 1: Manual (Simple)

Open a terminal with `tmux` or a persistent session:

```bash
claude
> /autoresearch Goal: "..." Scope: "..." Metric: "..." Verify: "..." Iterations: 50 Duration: 8h
```

Leave it running. Check in the morning.

### Option 2: Scheduled (Recommended)

Use Claude Code's `/schedule` to create a recurring overnight job:

```bash
/schedule "autoresearch on my-project" --cron "0 1 * * *" --project ~/Projects/my-project
```

Runs at 1 AM daily. Writes report when done.

## Safety

- **Branch isolation** — all work happens on `autoresearch/<timestamp>`, never on your default branch. Note: this protects git history only — `Verify:` and `Guard:` commands still execute on the host machine and can have side effects outside of git
- **Clean working tree required** — the loop checks `git status --porcelain` before starting and at every iteration. Dirty tree = stop. Untracked files in the working directory may be removed by `git clean -fd` during discard
- **Clean discard** — failed experiments are reset (`git reset --hard HEAD~1` + `git clean -fd`), not reverted — no commit spam
- **One change per iteration** — atomic, reviewable diffs only
- **Mechanical verification** — metrics come from running commands, never from LLM self-assessment
- **Guard commands** — a command that must always pass (e.g., `npm test`) prevents breaking changes
- **Command timeouts** — `Verify:` and `Guard:` commands have a hard timeout (default 300s). Timeout is treated as a crash
- **Bounded iterations** — default 50, soft cap at 100 (override with `--no-limit`)
- **Duration limits** — set `Duration: 8h` to cap wall-clock time
- **State persistence** — loop state is checkpointed to `autoresearch-state.json` after every phase, enabling `--resume` after crashes
- **Fail-fast** — all non-plan commands fail immediately on missing required parameters (no interactive prompts mid-loop)

## Output Artifacts

When the run finishes, you get:

| Artifact                   | Description                                                     |
| -------------------------- | --------------------------------------------------------------- |
| `autoresearch-report.md`   | Detailed report with every change, metrics, and recommendations |
| `autoresearch-results.tsv` | Iteration log scoped by `run_id` — every attempt with metrics   |
| `autoresearch-state.json`  | Checkpoint state for `--resume` after crashes                   |
| Terminal summary           | Quick stats if you check the session                            |

Sub-command specific artifacts:

| Artifact                         | Created By                                                   |
| -------------------------------- | ------------------------------------------------------------ |
| `autoresearch-debug-findings.md` | `/autoresearch:debug`                                        |
| `autoresearch-security/`         | `/autoresearch:security` — audit artifacts and PoC directory |

All runtime artifacts are gitignored.

## Configuration Reference

### Required Parameters

| Parameter | Description                        | Example                                              |
| --------- | ---------------------------------- | ---------------------------------------------------- |
| `Goal:`   | What to improve (natural language) | `"Reduce test execution time"`                       |
| `Scope:`  | File globs to modify               | `"src/**/*.ts"`                                      |
| `Metric:` | What the verify command measures   | `"test duration in seconds"`                         |
| `Verify:` | Command that outputs a number      | `"npm test 2>&1 \| grep 'Time' \| awk '{print $2}'"` |

### Optional Parameters

| Parameter                        | Default               | Description                                                                                             |
| -------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------- |
| `Guard:`                         | none                  | Command that must exit 0 after each change                                                              |
| `Iterations:` / `--iterations N` | 50                    | Max iterations (soft cap: 100, use `--no-limit` to override)                                            |
| `Duration:`                      | none                  | Max wall-clock time (`6h`, `90m`, etc.)                                                                 |
| `Direction:`                     | maximize              | `maximize` or `minimize` the metric                                                                     |
| `Target:`                        | none                  | Numeric target value — loop stops when the metric reaches this value (respecting Direction)             |
| `MetricPattern:`                 | last number in stdout | Regex to extract the metric from Verify output (e.g., `"score: ([0-9.]+)"`)                             |
| `Timeout:`                       | 300                   | Per-command timeout in seconds for Verify and Guard commands. Timeout = crash                           |
| `--no-limit`                     | off                   | Remove the 100-iteration soft cap                                                                       |
| `--resume`                       | off                   | Resume a previous run from `autoresearch-state.json`. Restores iteration count, branch, and best metric |

### Stop Conditions

The loop stops when any of these triggers:

- Iteration limit reached
- Duration limit reached
- Metric target achieved (if `Target:` is set)
- 10 consecutive discards (stuck)
- Plateau detected (20 iterations with <1% cumulative improvement)

## License

MIT
