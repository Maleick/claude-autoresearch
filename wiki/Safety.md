# Safety

## What autoresearch Protects

- **Your default branch** — all work happens on `autoresearch/<timestamp>`, never on main/master
- **Your commit history** — failed experiments are reset, not reverted. No commit spam
- **Your verification integrity** — metrics come from running commands, never from LLM self-assessment

## What autoresearch Does NOT Protect

- **Side effects of your Verify/Guard commands** — if your Verify command writes files, calls APIs, or modifies a database, those effects happen. autoresearch only controls git state
- **Untracked files** — `git clean -fd` runs during discard. Untracked files in the working directory may be removed
- **External resources** — if your code calls out to external services during verify, those calls happen

## The 10 Safety Invariants

Authoritative list in `SKILL.md`. These are enforced on every iteration and cannot be overridden:

1. Branch isolation — `autoresearch/<timestamp>` only, never main/master
2. Clean discard — `git reset --hard HEAD~1` + `git clean -fd`, no revert commits
3. Fail-fast — missing required params → immediate error, no interactive prompts
4. One atomic change per iteration — small, reviewable diffs only
5. Mechanical verification — metrics from commands, not LLM self-assessment
6. Guard enforcement — Guard must pass or change is discarded
7. Command timeouts — 300s default; timeout = crash; 5 consecutive crashes = stop
8. State persistence — checkpoint to `autoresearch-state.json` after every phase
9. Git hygiene — `git status --porcelain` checked at start of every iteration
10. Duplicate detection — skip changes matching previously discarded descriptions

## Before Running Overnight

```bash
# Confirm clean working tree
git status

# Test your Verify command manually first
<your verify command>  # should output a single number

# Test your Guard command manually
<your guard command>; echo "exit: $?"  # should exit 0

# Dry-run to validate config
/autoresearch Goal: "..." Scope: "..." Verify: "..." --dry-run
```
