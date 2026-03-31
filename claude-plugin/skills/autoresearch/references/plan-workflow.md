# Plan Workflow — Interactive Setup Wizard

The ONLY interactive command in autoresearch. Builds a complete `/autoresearch` invocation through focused questions.

## Process

### Step 1: Goal

Ask: "What do you want to improve? Describe the goal in plain language."

Validate: Must be specific enough to guide ideation. If vague (e.g., "make it better"), ask for clarification.

### Step 2: Scope

Ask: "Which files should autoresearch modify? Provide glob patterns."

Examples:

- `src/**/*.ts` — all TypeScript in src
- `*.mac,*.inc` — MacroQuest macro files
- `lib/**/*.py` — Python library code

Validate: Globs must match at least one file in the current project.

### Step 3: Metric & Verify

Ask: "What command measures progress? It must output a single number."

Help the user construct a Verify command. Common patterns:

- Test count: `npm test 2>&1 | grep -c 'passing'`
- Build warnings: `cargo build 2>&1 | grep -c 'warning'`
- Bundle size: `du -b dist/bundle.js | cut -f1`
- Lint errors: `eslint src/ --format compact 2>&1 | grep -c 'Error'`
- Coverage: `pytest --cov --cov-report=term 2>&1 | grep TOTAL | awk '{print $4}' | tr -d '%'`

**MANDATORY: Dry-run the command** before accepting it. It must:

- Exit 0
- Output a parseable number
- Complete in under 30 seconds (fast verification = more iterations)

Ask Direction: "Should this number go UP (maximize) or DOWN (minimize)?"

### Step 4: Guard

Ask: "Is there a command that must always pass? (e.g., build, type check, existing tests). Leave empty for none."

If provided, dry-run it — must exit 0.

### Step 5: Limits

Ask: "How many iterations? (default: 50, max recommended: 100) And/or a time limit? (e.g., 6h)"

### Step 6: Review & Launch

Present the complete invocation:

```
/autoresearch Goal: "<goal>" Scope: "<globs>" Metric: "<description>" Verify: "<command>" Guard: "<command>" Iterations: <N> Duration: <time> Direction: <dir>
```

Ask: "Ready to launch? (yes / edit / cancel)"

- yes → execute the invocation
- edit → go back to the relevant step
- cancel → abort
