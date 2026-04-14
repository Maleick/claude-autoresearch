# Contributing to Auto Research

Auto Research is a cross-platform workflow bundle for coding agents. The repository now has two distribution surfaces:

- a root-centered Codex bundle
- a Claude compatibility package

The root bundle is the source of truth for the Codex plugin payload.

## Project structure

```text
SKILL.md
agents/openai.yaml
references/
scripts/
plugins/autoresearch/                 # Claude package
plugins/codex-autoresearch/           # Codex package
.agents/plugins/marketplace.json      # Repo marketplace for local Codex installs
tests/
```

## Working on the root Codex bundle

When you change `SKILL.md`, `agents/`, `references/`, or `scripts/`:

1. Re-sync the Codex plugin payload.
2. Re-run distribution validation.
3. Re-run the pytest coverage for packaging and compatibility logs.

```bash
python3 scripts/sync_plugin_payload.py --repo .
python3 scripts/check_plugin_distribution.py --repo .
pytest -q tests/test_plugin_distribution.py tests/test_results_compatibility.py
```

## Working on the Claude package

The Claude package keeps stable `autoresearch` identifiers for compatibility. Update it when:

- the user-facing command surface changes
- installation instructions change
- the compatibility layer needs new docs or metadata

Keep the command family stable unless you are intentionally shipping a breaking change.

## Version bumps

When releasing a new version, update these surfaces together:

1. `VERSION`
2. `CHANGELOG.md`
3. `README.md`
4. `.claude-plugin/marketplace.json`
5. `plugins/autoresearch/.claude-plugin/plugin.json`
6. `plugins/codex-autoresearch/.codex-plugin/plugin.json`

## Validation

Minimum validation for packaging changes:

```bash
python3 scripts/check_plugin_distribution.py --repo .
pytest -q tests/test_plugin_distribution.py tests/test_results_compatibility.py
```

For doc-heavy changes, also grep for stale repo or brand references:

```bash
rg -n "claude-autoresearch|Autoresearch" README.md CHANGELOG.md CONTRIBUTING.md SECURITY.md wiki docs .claude-plugin plugins
```
