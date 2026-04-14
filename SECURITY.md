# Security

Auto Research can modify code unattended, so the project keeps explicit safety rules across both runtime surfaces.

## Core safety model

- Branch isolation: keep experiments off the default branch.
- Mechanical verification: do not keep a change without a verify command.
- Guard enforcement: treat regressions as discard conditions, not optional warnings.
- State persistence: record authoritative run state in `autoresearch-state.json`.
- Artifact hygiene: treat run artifacts as generated state, not source files to commit.

## Runtime artifacts

The project now supports both the Codex-facing and Claude-facing results log names:

- `research-results.tsv`
- `autoresearch-results.tsv`

Both should describe the same experiment history for a given run.

## Source of truth

The root `SKILL.md` and `references/` directory define the Codex-facing runtime contract. The Claude compatibility package under `plugins/autoresearch/` preserves the stable `/autoresearch*` command family.

## Reporting

If you find a security issue in Auto Research itself, open a private security advisory on [GitHub](https://github.com/Maleick/AutoResearch/security/advisories).
