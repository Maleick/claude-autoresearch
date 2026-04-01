# Changelog

All notable changes to the autoresearch plugin are documented in this file.

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
- Improved error messages for Verify command failures
- Guided wizard menu options now include 1-line descriptions

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

## [1.0.0] - 2026-03-29

### Added

- Initial release of autoresearch plugin
- Core autonomous loop protocol (Phase 0-8)
- 8 subcommands: debug, fix, learn, plan, predict, scenario, security, ship
- 9 safety invariants
- State persistence and resume protocol
- TSV results logging
- Morning report generation
