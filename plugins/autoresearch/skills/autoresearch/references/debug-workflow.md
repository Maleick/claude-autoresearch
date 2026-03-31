# Debug Workflow

Autonomous bug-hunting loop. Scientific method: hypothesize → test → prove/disprove → log → repeat.

## Phase 1: Reconnaissance

- Read files matching Scope glob
- Run any failing tests/commands to capture current error output
- If `--symptom` provided, use it to narrow the search
- Build initial mental model of the codebase area

## Phase 2: Hypothesis Formation

- Based on the symptom and code reading, form a testable hypothesis
- Write it down clearly: "I hypothesize that [X] because [Y]"
- Each hypothesis must be falsifiable

## Phase 3: Investigation

- Choose a technique (or use `--technique` if specified):
  - **binary-search**: Bisect the code to isolate the bug
  - **differential**: Compare working vs broken state
  - **minimal-reproduction**: Create the smallest reproduction case
  - **trace**: Follow the execution path step by step
  - **pattern-search**: Look for known anti-patterns (null checks, off-by-one, etc.)
  - **working-backwards**: Start from the error and trace backwards to the cause
  - **rubber-duck**: Explain the code line by line to find the flaw
- Execute the technique, collecting evidence

## Phase 4: Verdict

- Prove or disprove the hypothesis with concrete evidence
- If proven: log the finding with file:line reference
- If disproven: note what was learned, form new hypothesis (go to Phase 2)

## Phase 5: Classification

- Severity: Critical / High / Medium / Low
- Category: logic error, race condition, null/undefined, type mismatch, off-by-one, resource leak, etc.
- Root cause: the specific code that causes the bug
- Impact: what user-visible behavior results

## Phase 6: Log Finding

- Append to `autoresearch-debug-findings.md`:
  ```
  ### Finding [N]: [title]
  - **File:** path/to/file.ts:42
  - **Severity:** High
  - **Category:** logic error
  - **Hypothesis:** [what was tested]
  - **Evidence:** [what proved it]
  - **Root cause:** [specific code/logic]
  - **Suggested fix:** [brief description]
  ```

## Phase 7: Continue or Stop

- If `--iterations N` set: check iteration count
- If more bugs likely exist in Scope: form next hypothesis (Phase 2)
- If scope exhausted or iteration limit reached: write summary and stop
- If `--fix` flag was passed: hand off findings to `/autoresearch:fix`

## Output

- `autoresearch-debug-findings.md` — all findings with file:line evidence
- Terminal summary: N findings (X critical, Y high, Z medium, W low)
- Discord notification on completion with finding count

## Important Rules

- Every finding MUST have a file:line reference — no vague descriptions
- Do NOT fix bugs in this mode — only find and document them (unless `--fix` chains to fix mode)
- Each iteration investigates one hypothesis
- If `--severity` is set, only report findings at or above that severity level
