---
name: autoresearch
description: Autonomous Goal-directed Iteration. Modify, verify, keep/discard, repeat. For git-backed codebases with deterministic verification commands.
argument-hint: "[Goal: <text>] [Scope: <glob>] [Metric: <text>] [Verify: <cmd>] [Guard: <cmd>] [Target: <num>] [Timeout: <sec>] [--iterations N] [--resume] [--force-branch] [--no-limit]"
---

## Step 0: Wizard vs. Direct Execution (check this FIRST)

Examine `$ARGUMENTS`. Decide which path to take:

- **If `$ARGUMENTS` is empty or blank** → run the Guided Wizard (below)
- **If `$ARGUMENTS` contains `--resume`** → skip wizard, go to Argument Parsing
- **If `$ARGUMENTS` contains ANY recognized parameter keyword** (`Goal:`, `Scope:`, `Verify:`, `Metric:`, `Guard:`, `Direction:`, `Duration:`, `Iterations:`, `--iterations`, `--no-limit`, `Target:`, `MetricPattern:`, `Timeout:`, `--force-branch`) → skip wizard, go to Argument Parsing
- **Otherwise** (no recognized keywords, just free text) → run the Guided Wizard

---

## Guided Wizard (no-args path only)

This wizard runs interactively using `AskUserQuestion` at each step. It collects parameters and then dispatches to the appropriate mode.

**Edge case — structured parameters detected:** If at any step the user pastes text containing `Goal:`, `Scope:`, `Verify:`, or `Metric:` keywords, stop the wizard immediately and fall through to Argument Parsing with that text as `$ARGUMENTS`.

**Navigation:** At any wizard step, the user may type:

- `back` or `b` — return to the previous step
- `quit` or `q` — cancel the wizard and stop execution

### Step 1 — Goal Intent

Use `AskUserQuestion` with this prompt:

```
What are you trying to accomplish?

  [A] Optimize a metric — iteratively improve a measurable number (test pass rate, bundle size, perf score)
  [B] Find bugs — systematic investigation using scientific method
  [C] Fix errors — repair known failures until zero remain
  [D] Generate documentation — analyze codebase and produce/update docs
  [E] Explore scenarios — generate use cases, edge cases, test scenarios from a seed idea
  [F] Security audit — STRIDE + OWASP + red-team analysis
  [G] Expert analysis — multi-perspective code review from specialist personas
  [H] Ship something — structured release workflow with checklists
  [I] Not sure — describe your goal and get a recommendation

Enter a letter (A-I):
```

If the user's response contains structured parameter keywords (`Goal:`, `Scope:`, `Verify:`, etc.), skip the wizard — treat the response as `$ARGUMENTS` and fall through to Argument Parsing.

### Step 2 — Mode Dispatch

Based on the user's choice, collect mode-specific parameters:

#### Option A — Core Optimization Loop

Ask these follow-up questions sequentially via `AskUserQuestion`:

1. `Describe your optimization goal in one sentence:`
2. `Which files should be modified? (glob pattern, e.g. src/**/*.ts):`
3. `What metric should be tracked? (a number from your verify command's output):`
4. `What shell command measures this metric? (must print a number to stdout):`
5. `Should this metric go up or down? [1] Minimize [2] Maximize:`

Then ask: `Want to configure advanced options? (Y/N)`

If **Y**, ask these additional questions via `AskUserQuestion`:

1. `Guard command (a shell command that must pass for changes to be kept, or "none"):`
2. `Target value (stop when metric reaches this number, or "none"):`
3. `Duration limit (e.g. 6h, 90m, or "none"):`
4. `MetricPattern (regex to extract metric from verify output, or "none"):`

Proceed to Step 3 (Iteration Count).

#### Option B — Find Bugs → `/autoresearch:debug`

Ask via `AskUserQuestion`:

1. `Which files or directories should be investigated? (glob pattern, e.g. src/**/*):`
2. `Describe the symptom or suspected area (optional, press Enter to skip):`

Proceed to Step 3 (Iteration Count).

#### Option C — Fix Errors → `/autoresearch:fix`

Ask via `AskUserQuestion`:

1. `Which files should be fixed? (glob pattern, e.g. src/**/*.ts):`
2. `What command reveals the errors? (e.g. npm test, cargo build):`

Proceed to Step 3 (Iteration Count).

#### Option D — Generate Documentation → `/autoresearch:learn`

Ask via `AskUserQuestion`:

1. `What should be documented? (e.g. "API reference", "architecture overview", "onboarding guide"):`
2. `Which files should be analyzed? (glob pattern, e.g. src/**/*):`

Proceed to Step 3 (Iteration Count).

#### Option E — Explore Scenarios → `/autoresearch:scenario`

Ask via `AskUserQuestion`:

1. `Describe the scenario or seed idea to explore:`

Proceed to Step 3 (Iteration Count).

#### Option F — Security Audit → `/autoresearch:security`

Ask via `AskUserQuestion`:

1. `Which files or directories should be audited? (glob pattern, e.g. src/**/*):`

Proceed to Step 3 (Iteration Count).

#### Option G — Expert Analysis → `/autoresearch:predict`

Ask via `AskUserQuestion`:

1. `What should the experts analyze? (e.g. "performance bottlenecks", "error handling gaps"):`
2. `Which files should be reviewed? (glob pattern, e.g. src/**/*):`

Proceed to Step 3 (Iteration Count).

#### Option H — Ship Something → `/autoresearch:ship`

Ask via `AskUserQuestion`:

1. `What are you shipping? (e.g. "v2.0 release", "new API endpoint", "marketing page"):`

Skip Step 3 — dispatch directly to `/autoresearch:ship` with the target.

#### Option I — Not Sure → `/autoresearch:plan`

Ask via `AskUserQuestion`:

1. `Describe what you want to accomplish in your own words:`

Skip Step 3 — dispatch directly to `/autoresearch:plan` with the user's free-text goal.

### Step 3 — Iteration Count (all modes except plan/ship)

Use `AskUserQuestion`:

```
How many iterations?

  [1] 5  (quick test)
  [2] 25 (standard)
  [3] 50 (deep)
  [4] Custom — enter a number
  [5] No limit (runs until stuck or duration expires)

Enter 1-5:
```

Map: 1→5, 2→25, 3→50, 4→ask for custom number, 5→`--no-limit`.

### Step 4 — Preview & Confirm

Assemble the full command string from all collected parameters. Display it to the user via `AskUserQuestion`:

```
Here's the command that will be executed:

  /autoresearch Goal: <goal> Scope: <scope> Metric: <metric> Verify: <cmd> Direction: <dir> --iterations <N>

(or the equivalent sub-command for modes B-I)

Proceed?
  [Y] Run
  [E] Edit a parameter
  [B] Back to start
  [Q] Quit
```

- **Y** → dispatch the assembled command (for Option A, continue to Argument Parsing below with the assembled parameters; for Options B-I, invoke the corresponding sub-command)
- **E** → ask `Which parameter to edit?`, re-prompt for that parameter's value, then re-display the preview
- **B** → restart from Step 1
- **Q** → stop execution, print "Wizard cancelled."

---

## Argument Parsing (do this FIRST when arguments are provided, or after wizard assembles them)

EXECUTE IMMEDIATELY — do not deliberate, do not ask clarifying questions before reading the protocol.

Extract these from $ARGUMENTS — the user may provide extensive context alongside config. Ignore prose and extract ONLY structured fields:

- `Goal:` — text after "Goal:" keyword
- `Scope:` or `--scope <glob>` — file globs after "Scope:" keyword
- `Metric:` — text after "Metric:" keyword
- `Verify:` — shell command after "Verify:" keyword
- `Guard:` — shell command after "Guard:" keyword (optional)
- `Direction:` — `maximize` (default) or `minimize`
- `Duration:` — max wall-clock time (e.g., `6h`, `90m`). Loop stops when duration OR iteration limit is hit, whichever first.
- `Iterations:` or `--iterations` — integer N for bounded mode (CRITICAL: if set, you MUST run exactly N iterations then stop)
- `--no-limit` — removes the soft cap of 100 iterations (use with `Duration:` for safety)
- `Target:` — numeric target value for the metric. When the metric reaches this value (respecting Direction), the loop stops. Example: `Target: 0` for minimizing errors to zero.
- `MetricPattern:` — optional regex pattern to extract the metric from Verify output. If not set, the last number in stdout is used. Example: `MetricPattern: "score: ([0-9.]+)"`
- `Timeout:` — per-command timeout in seconds for Verify and Guard commands (default: 300). If a command exceeds this, the iteration is treated as a crash.
- `--force-branch` — skip the branch safety check in Phase 0. When set, the loop will not verify it is off the default branch before proceeding. Defined in autonomous-loop-protocol.md.
- `--resume` — resume a previous run from `autoresearch-state.json`. Skips Phase 0 setup; reads state file to restore iteration count, branch, previous_best, and config.

If `Iterations: N` or `--iterations N` is found, set `max_iterations = N`. Track `current_iteration` starting at 0. After iteration N, print final summary and STOP.

## Execution

1. Read the autonomous loop protocol: `.claude/skills/autoresearch/references/autonomous-loop-protocol.md`
2. Read the results logging format: `.claude/skills/autoresearch/references/results-logging.md`
   2.5. If `--resume` is set, read `autoresearch-state.json` from the project root. Validate the state file exists and the branch still exists. Checkout the branch, restore all loop state (iteration, previous_best, consecutive_discards, etc.), and skip Phase 0. Resume from the last completed phase.
3. If Goal, Scope, Metric, and Verify are all extracted — proceed directly to loop setup
4. If any critical field is missing — **FAIL FAST**: print a clear error listing the missing fields and a ready-to-paste example invocation, then STOP. Do NOT use `AskUserQuestion` — this command must run unattended.
5. Execute the autonomous loop: Modify → Verify → Keep/Discard → Repeat
6. If bounded: after each iteration, check `current_iteration < max_iterations`. If not, STOP and print summary.

IMPORTANT: Start executing immediately. Stream all output live — never run in background.

**Stop conditions** (any one triggers stop):

- Iteration limit reached (`max_iterations`)
- Duration limit reached (if `Duration:` was set)
- Metric goal achieved
- 10 consecutive discards (stuck) — write report and alert
- Plateau — 20 iterations with less than 1% cumulative improvement
- 5 consecutive crashes — Verify/Guard command appears broken
  Do NOT continue past any of these conditions.
