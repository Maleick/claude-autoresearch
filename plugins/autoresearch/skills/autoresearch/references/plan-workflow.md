# Plan Workflow

Interactive setup wizard for `/autoresearch:plan`. This is the ONLY command that asks questions — all others are non-interactive.

## Step 1: Understand the Goal
- Read the user's goal description
- Ask: "What specific metric should improve? (e.g., test pass count, bundle size in KB, response time in ms)"

## Step 2: Define the Scope
- Ask: "Which files should autoresearch modify? Provide a glob pattern. (e.g., `src/**/*.ts`, `lib/*.py`)"
- Validate the glob matches at least one file

## Step 3: Choose the Metric
- Based on Step 1, confirm the metric name
- Ask: "What direction should the metric move? (maximize or minimize)"

## Step 4: Build the Verify Command
- Ask: "What shell command outputs the metric as a number? (e.g., `npm test 2>&1 | grep 'passing' | awk '{print $1}'`)"
- Test the command — run it and confirm it outputs a number
- If it fails or outputs non-numeric: help the user fix it

## Step 5: Optional Guard Command
- Ask: "Do you want a guard command that must always pass? (e.g., `npm run typecheck`) Enter a command or 'skip'."
- If provided, test that it exits 0

## Step 6: Set Limits
- Ask: "How many iterations? (default: 50, max recommended: 100 unless using --no-limit)"
- Ask: "Time limit? (e.g., `6h`, `90m`, or 'none')"

## Step 7: Generate Invocation
- Output a ready-to-paste command:
  ```
  /autoresearch Goal: "<goal>" Scope: "<glob>" Metric: "<metric>" Verify: "<cmd>" Guard: "<cmd>" Direction: <dir> Iterations: <N> Duration: <time>
  ```
- Confirm with the user before launching
