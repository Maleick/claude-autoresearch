# Ship Workflow

Universal shipping workflow. Ship code, content, or artifacts through a structured 8-phase process.

## Setup

- Create branch `autoresearch/<timestamp>` for any code modifications during the shipping process. PR creation and deployment steps operate on the current branch.
- Persist state to `autoresearch-state.json` after each phase completes (see state-management.md protocol).
- Log each iteration/finding to `autoresearch-results.tsv` (see results-logging.md for format).
- Apply 300s timeout to all shell commands using the Bash tool's timeout parameter (300000ms). If a command times out, treat as crash — see autonomous-loop-protocol.

## Phase 1: Detect Ship Type

- Auto-detect from context (or use `--type` override):
  - **code-pr**: Changes on a branch → create/update PR
  - **code-release**: Tagged version → create GitHub release
  - **deployment**: Artifact → deploy to environment
  - **content**: Documentation, blog post, etc. → publish
- If `--target` is set, use it as the primary artifact

## Phase 2: Pre-flight Checks

- Run project test suite
- Check for uncommitted changes
- Validate branch is up to date with remote
- Check CI status (if available)
- If any check fails: report and stop (unless `--force` skips non-critical items)

## Phase 3: Generate Checklist

- Build a ship checklist based on type:
  - code-pr: tests pass, lint clean, types check, PR description, reviewer assigned
  - code-release: changelog updated, version bumped, tags correct
  - deployment: env config correct, migrations ready, rollback plan documented
  - content: spelling/grammar check, links valid, images present
- If `--checklist-only`: output checklist and stop

## Phase 4: Preparation Loop

- For each checklist item that's not ready:
  - Attempt to fix automatically (if safe)
  - If `--iterations N` is set: iterate on preparation up to N times
- If `--dry-run`: validate but don't execute

## Phase 5: Ship

- Execute the ship action based on type:
  - code-pr: `gh pr create` with generated description
  - code-release: `gh release create` with changelog
  - deployment: execute deploy command
  - content: publish to target
- If `--auto`: proceed without confirmation (if no errors)

### Phase 5.5: Rollback Dry-Run

Before confirming, validate rollback is possible:

1. code-pr: verify branch can be deleted and PR closed
2. code-release: verify tag can be deleted
3. deployment: verify rollback command exists and previous version is available
4. If validation fails, warn but do not block shipping.

## Phase 6: Verify

- Confirm the ship was successful:
  - PR created? Check URL and status
  - Release published? Check assets
  - Deployed? Run health checks

## Phase 7: Monitor (if `--monitor N`)

- Watch for N minutes after shipping:
  - Check CI/CD pipeline status
  - Monitor error rates (if accessible)
  - Report any anomalies

## Phase 8: Rollback (if `--rollback`)

- Undo the last ship action:
  - code-pr: close PR
  - code-release: delete release
  - deployment: execute rollback command
- Requires a ship action log to know what to undo
