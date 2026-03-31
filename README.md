# Autoresearch

Autonomous overnight iteration engine for [Claude Code](https://claude.ai/claude-code). Fire it before bed, review improvements in the morning.

Inspired by [Karpathy's autoresearch](https://github.com/karpathy/autoresearch). Applies constraint-driven autonomous iteration to any codebase.

**Core loop:** Modify → Verify → Keep/Discard → Repeat.

## What It Does

You give autoresearch a goal, a scope (which files to touch), and a verification command that outputs a number. It then autonomously:

1. Makes one small, atomic change
2. Commits it
3. Runs your verification command
4. Keeps the change if the metric improved, reverts if it didn't
5. Repeats until iterations run out, time expires, or it gets stuck

Every kept change is a git commit. Every discarded change is reverted. In the morning you get a structured report (file + terminal + Discord notification) showing what happened.

## Commands

| Command                  | Purpose                                       |
| ------------------------ | --------------------------------------------- |
| `/autoresearch`          | Core autonomous loop — runs unattended        |
| `/autoresearch:plan`     | Interactive setup wizard — builds your config |
| `/autoresearch:debug`    | Scientific-method bug hunting                 |
| `/autoresearch:fix`      | Iterative error repair until zero remain      |
| `/autoresearch:security` | Offensive security audit with exploit PoCs    |

## Quick Start

```bash
# Install the plugin
/plugin marketplace add maleick/claude-autoresearch
/plugin install autoresearch@claude-autoresearch

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

Runs at 1 AM daily. Writes report, sends Discord notification when done.

## Safety

- **Automatic rollback** — every regression is immediately reverted via `git revert`
- **Guard commands** — a command that must always pass (e.g., `npm test`) prevents breaking changes
- **Bounded iterations** — default 50, soft cap at 100 (override with `--no-limit`)
- **Duration limits** — set `Duration: 8h` to cap wall-clock time
- **Stuck detection** — stops after 10 consecutive failed attempts and alerts you via Discord
- **Git as memory** — full audit trail in git history, easy to review or bulk-revert

## Morning Report

When the run finishes, you get:

1. **`autoresearch-report.md`** — detailed report with every change, metrics, and recommendations
2. **Terminal summary** — quick stats if you check the session
3. **Discord ping** — notification on your phone with the headline numbers

## Manual Installation

If you prefer not to use the plugin marketplace:

```bash
# Copy skill files
cp -r claude-plugin/skills/autoresearch/ ~/.claude/skills/autoresearch/

# Copy command files
cp claude-plugin/commands/autoresearch.md ~/.claude/commands/
cp -r claude-plugin/commands/autoresearch/ ~/.claude/commands/autoresearch/
```

## Configuration Reference

### Required Parameters

| Parameter | Description                        | Example                                              |
| --------- | ---------------------------------- | ---------------------------------------------------- |
| `Goal:`   | What to improve (natural language) | `"Reduce test execution time"`                       |
| `Scope:`  | File globs to modify               | `"src/**/*.ts"`                                      |
| `Metric:` | What the verify command measures   | `"test duration in seconds"`                         |
| `Verify:` | Command that outputs a number      | `"npm test 2>&1 \| grep 'Time' \| awk '{print $2}'"` |

### Optional Parameters

| Parameter     | Default  | Description                                                  |
| ------------- | -------- | ------------------------------------------------------------ |
| `Guard:`      | none     | Command that must exit 0 after each change                   |
| `Iterations:` | 50       | Max iterations (soft cap: 100, use `--no-limit` to override) |
| `Duration:`   | none     | Max wall-clock time (`6h`, `90m`, etc.)                      |
| `Direction:`  | maximize | `maximize` or `minimize` the metric                          |
| `--no-limit`  | off      | Remove the 100-iteration soft cap                            |

## License

MIT
