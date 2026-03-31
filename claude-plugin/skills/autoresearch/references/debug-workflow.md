# Debug Workflow — Scientific Method Bug Hunting

Autonomous bug finder. Hypothesize → Test → Prove/Disprove → Log → Repeat.

## Argument Parsing

Extract from $ARGUMENTS:

- `Scope:` — file globs to investigate (REQUIRED)
- `Symptom:` — description of the bug (optional, helps focus)
- `--fix` — if present, chain to `/autoresearch:fix` after finding bugs
- `Iterations:` — max iterations (default: 30)
- `Duration:` — max wall-clock time (optional)

If Scope is missing, FAIL with: "ERROR: Missing Scope. Usage: /autoresearch:debug Scope: <glob>"

## The Debug Loop

### Phase 0: Reconnaissance

1. Map the codebase within Scope: file list, module structure, entry points
2. If Symptom provided, trace it through the code
3. Identify areas of complexity, recent changes, known patterns
4. Create `autoresearch-debug-findings.md` with header

### Phase 1: Hypothesize

1. Based on recon + previous findings, form a hypothesis:
   - "I suspect [specific bug] in [file:line] because [evidence]"
2. Prioritize: likely bugs > unlikely bugs, high-impact > low-impact

### Phase 2: Test

1. Design a test for the hypothesis — read the relevant code, trace the logic
2. Look for: off-by-one errors, null/undefined handling, race conditions, resource leaks, logic inversions, missing validation, type coercion bugs

### Phase 3: Classify

**Bug confirmed:**

- Record in findings with: file:line, description, severity (Critical/High/Medium/Low), evidence
- Status: `bug-found`

**Hypothesis disproven:**

- Log what was tested and why it's not a bug
- Status: `hypothesis-disproven`

**Inconclusive:**

- Log what was tested, note what additional info would be needed
- Status: `inconclusive`

### Phase 4: Log

Append to `autoresearch-debug-findings.md`:

```markdown
### Finding #<N>: <title>

- **File:** <path>:<line>
- **Severity:** <Critical|High|Medium|Low>
- **Status:** <bug-found|hypothesis-disproven|inconclusive>
- **Evidence:** <code snippet or trace>
- **Description:** <what's wrong and why>
```

### Phase 5: Repeat or Stop

- Stop if: iterations exhausted, duration exceeded, or no more hypotheses
- Otherwise: go to Phase 1

### End of Run

1. Write summary section at top of `autoresearch-debug-findings.md`:
   - Total findings by severity
   - Files with most bugs
   - Patterns observed
2. Print terminal summary
3. Discord notification: `autoresearch:debug complete: <N> bugs found (<critical> critical, <high> high). See autoresearch-debug-findings.md`
4. If `--fix` flag: launch `/autoresearch:fix` targeting found bugs
