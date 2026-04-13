# Changelog

All notable changes to the autoresearch plugin are documented in this file.

## [2.2.1] - 2026-04-13

### Fixed

- `validate.yml`: all three CI checks now use `continue-on-error` with a final aggregator step — all validation errors surface in a single run instead of stopping at the first failure
- `validate.yml`: added comment explaining why `autoresearch.md` is excluded from `argument-hint` frontmatter check
- `docs/index.html`: copy button reads install string from DOM instead of a duplicate hardcoded string; hoisted button reference before promise branches

## [2.2.0] - 2026-04-13

### Added

- One-liner install command — `claude plugin marketplace add && claude plugin install` in one shot
- Auto-update enabled by default via `"autoUpdate": true` in plugin manifests
- Hero graphic (`assets/autoresearch-loop.svg`) — night-mode SVG banner for README and GitHub Pages
- GitHub Pages landing page (`docs/index.html`) — dark-theme project site with install one-liner, command table, and how-it-works section
- GitHub Actions `release.yml` — auto-creates GitHub Releases from CHANGELOG on version tags
- GitHub Actions `validate.yml` — PR checks for frontmatter, cross-references, and version consistency
- GitHub Sponsors support — `.github/FUNDING.yml`, Sponsor badge in badge row, `☕ Keep the loop running` footer link
- Architecture doc (`docs/ARCHITECTURE.md`) — current phase flow, state machine, invariants, artifact lifecycle
- Wiki (`wiki/`) — 6-page reference covering installation, commands, configuration, safety, and contributing
- `VERSION` file at repo root for cross-file version consistency checking
- Mermaid flowcharts in README — core loop diagram and plugin architecture diagram
- GitHub repo topics for discoverability
- README restructured to match AutoShip layout: one-liner above the fold, How It Works + Architecture sections added

## [2.1.0] - 2026-03-31

### Added

- README badges (release, license, language, last commit, stars, repo size, status, Claude Code, platform, PRs welcome)
- Full command reference in README with flag tables for all 9 commands
- Configuration reference table (Goal, Scope, Metric, Verify, Guard, Direction, Duration, Target, MetricPattern, Timeout)
- Stop conditions table in README
- Output artifacts table in README
- Troubleshooting section in README
- CHANGELOG.md (this file)
- CONTRIBUTING.md with guidelines for adding subcommands and modifying workflows
- SECURITY.md documenting safety invariants and branch isolation
- CODE_OF_CONDUCT.md (Contributor Covenant)
- `--dry-run` flag for config validation without running iterations
- `--notify` flag for completion summary output
- `--output` flag for debug findings path
- `--max-attempts-per-error` flag for fix loop (default 3)
- `--audience` flag for learn documentation tone
- `--export` flag for predict JSON output
- `--baseline` flag for security delta reports
- `--changelog` flag for ship auto-generated changelog entries
- `--seed-from-tests` flag for scenario test-case seeding
- Phase 2.5 "Pre-flight check" in autonomous loop protocol (duplicate change detection)
- Schema versioning in state-management.md
- Optional "tags" column in results-logging.md
- Phase 4.5 "Reproduce" in debug workflow
- Rollback validation in fix workflow
- CVSS scoring in security workflow findings
- Rollback dry-run phase in ship workflow
- 10th safety invariant: duplicate detection
- 7th stop condition: goal satisfaction
- Artifact cleanup strategy in SKILL.md
- Version bump procedure in CLAUDE.md
- Plugin reload instructions in CLAUDE.md
- MetricPattern regex examples in main command

### Changed

- Design spec marked as historical (v1.0 reference)
- Guided wizard menu options now include 1-line descriptions

### Improved

- Better error diagnostics when Verify command fails on baseline (explains what went wrong, suggests fixes)

## [2.0.0] - 2026-03-30

### Added

- Guided wizard for no-args invocation (interactive parameter collection)
- `--force-branch` flag to skip branch safety check
- `--no-limit` flag for unlimited iterations (with Duration safety)
- Scope glob validation in Phase 0 (error on zero matches)
- Secondary Bash tool timeout kill switch for Verify commands
- SHA guard for Discard/Crash paths (prevents resetting wrong commit)
- `consecutive_crashes` tracking in state file
- Crash loop stop condition (5 consecutive crashes)
- Div-by-zero guard for plateau detection
- Atomic write protocol for state file (.tmp rename)
- SHA mismatch recovery in resume protocol
- Dirty worktree handling on resume
- Setup sections in all workflow files (branch, state, logging, timeout)

### Changed

- Command descriptions shortened and standardized across all subcommands
- SKILL.md table updated: "Used By" column now says "All code-modifying modes" instead of listing specific commands
- Commit message prefix standardized to `autoresearch:` (was `autoresearch-fix:` in fix workflow)
- Fix workflow Phase 0 added (was previously implicit)
- Security workflow Phase 0 added (conditional on --fix flag)

## [1.3.1] - 2026-03-30

### Fixed

- README accuracy audit — removed broken Discord notifications reference
- Simplified review terminology and deduplicated invariants

## [1.3.0] - 2026-03-31

### Fixed

- Installation instructions — replaced non-existent `/install` command with correct three-step marketplace process
- Added `repository` and `license` fields to plugin.json

### Known Issues

- 3 command files have FAIL FAST logic issues (fix.md, learn.md, ship.md)
- 4 skill/reference inconsistencies (state schema mismatch, write frequency contradiction, metric_pattern gap, branch isolation ambiguity)

## [1.2.0] - 2026-03-31

### Added

- `--resume` flag — recover from session crashes via checkpointed state
- `Target:` parameter — numeric target for metric goal stop condition
- `MetricPattern:` parameter — custom regex for metric extraction
- `Timeout:` parameter — per-command hard timeout (default: 300s)
- Plateau detection — stops if 20 iterations yield <1% cumulative improvement
- Run-scoped logging — `run_id` column in TSV prevents prior runs from contaminating strategy
- `duration_sec` column in TSV for iteration timing analysis

### Changed

- Metric extraction tightened: last-line parsing, regex fallback, 100x sanity check
- Strict keep rule: equal metrics = discard (no subjective judgment)
- Git hygiene: `git status --porcelain` checked every iteration; `git clean -fd` after discards

## [1.1.0] - 2026-03-31

### Added

- All 10 workflow protocols (prior versions had command stubs referencing missing files)
- Full safety invariant enforcement across all commands

### Changed

- **Breaking:** Commands no longer prompt interactively when params are missing — fail fast instead
- **Breaking:** Discard mechanism changed from `git revert` to `git reset` on isolated branches
- **Breaking:** All runs now happen on `autoresearch/<timestamp>` branches, never on main

## [1.0.0] - 2026-03-29

### Added

- Initial release of autoresearch plugin
- Core autonomous loop protocol (Phase 0-8)
- 8 subcommands: debug, fix, learn, plan, predict, scenario, security, ship
- 9 safety invariants
- State persistence and resume protocol
- TSV results logging
- Morning report generation
