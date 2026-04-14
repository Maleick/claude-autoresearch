# Changelog

All notable changes to Auto Research are documented in this file.

## [3.0.0] - 2026-04-14

### Added

- Root-centered Auto Research skill bundle for Codex: `SKILL.md`, `agents/`, `references/`, and `scripts/`
- Local Codex plugin package at `plugins/codex-autoresearch`
- Repo-scoped Codex marketplace at `.agents/plugins/marketplace.json`
- Distribution sync and validation scripts
- Pytest coverage for plugin mirroring and dual results-log compatibility
- `feature-list.json` to track the cross-platform rewrite

### Changed

- Public project brand renamed from `Autoresearch` / `claude-autoresearch` to `Auto Research`
- Repository rename target set to `github.com/Maleick/AutoResearch`, but current functional links remain on `github.com/Maleick/claude-autoresearch` because `Maleick/autoresearch` already occupies the target slug
- README, wiki, Pages site, and architecture docs rewritten around cross-platform runtime support
- Claude package reframed as a compatibility wrapper while keeping the stable `/autoresearch*` command family
- Results logging now preserves both `research-results.tsv` and `autoresearch-results.tsv`

### Compatibility

- Existing Claude command names remain `/autoresearch`, `/autoresearch:plan`, `/autoresearch:debug`, `/autoresearch:fix`, `/autoresearch:learn`, `/autoresearch:predict`, `/autoresearch:scenario`, `/autoresearch:security`, and `/autoresearch:ship`
- Existing web URLs remain live during the transition, including the current Pages path and CNAME

## [2.2.1] - 2026-04-13

### Fixed

- `validate.yml`: all three CI checks now use `continue-on-error` with a final aggregator step
- `validate.yml`: added comment explaining why `autoresearch.md` is excluded from `argument-hint` frontmatter check
- `docs/index.html`: copy button reads install string from DOM instead of a duplicate hardcoded string

## [2.2.0] - 2026-04-13

### Added

- One-liner install command for the Claude package
- Auto-update enabled by default via `"autoUpdate": true` in Claude plugin manifests
- GitHub Pages landing page
- GitHub Actions validation and release workflows
- Architecture doc and wiki

## [2.1.0] - 2026-03-31

### Added

- Full command reference and configuration reference in README
- `--dry-run`, `--notify`, and related workflow flags
- Additional stop conditions, schema/versioning, and artifact lifecycle details

## [2.0.0] - 2026-03-30

### Added

- Guided wizard for no-args invocation
- `--force-branch`, `--no-limit`, `--resume`, `Target:`, `MetricPattern:`, and `Timeout:`
- Atomic state persistence and crash-loop handling

## [1.0.0] - 2026-03-29

### Added

- Initial release of the autoresearch plugin
- Core autonomous loop protocol and eight subcommands
