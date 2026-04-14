# Auto Research Architecture

> Current reference for v3.0.0.

Auto Research now has a root-centered source bundle and two distribution surfaces: a Claude compatibility package and a Codex plugin package.

## Source of truth

The repository root is authoritative for the Codex-facing runtime contract:

```text
SKILL.md
agents/openai.yaml
references/
scripts/
```

These files define:

- the main Auto Research skill
- the loop and mode-specific references
- runtime state helpers
- plugin sync and validation tooling

## Distribution surfaces

```text
.claude-plugin/marketplace.json
plugins/autoresearch/
  .claude-plugin/plugin.json
  commands/
  skills/autoresearch/

.agents/plugins/marketplace.json
plugins/codex-autoresearch/
  .codex-plugin/plugin.json
  skills/codex-autoresearch/
```

### Claude surface

- Keeps the stable `/autoresearch*` command family.
- Acts as a compatibility wrapper and install surface for Claude users.
- Uses the legacy `autoresearch` identifiers where compatibility matters.

### Codex surface

- Uses the root bundle as source material.
- Installs from the repo marketplace during local development.
- Mirrors the root bundle into `plugins/codex-autoresearch/skills/codex-autoresearch/`.

## Mirroring model

The Codex plugin payload is generated, not hand-maintained.

```bash
python3 scripts/sync_plugin_payload.py --repo .
python3 scripts/check_plugin_distribution.py --repo .
```

`sync_plugin_payload.py` copies:

- `SKILL.md`
- `agents/*.yaml`
- `scripts/*.py`
- `references/*.md`

into the packaged Codex plugin payload.

`check_plugin_distribution.py` validates:

- plugin manifest metadata
- repo marketplace metadata
- root-to-plugin file parity
- local install paths

## Runtime artifacts

Auto Research now preserves both result-log names:

| Artifact | Purpose |
| --- | --- |
| `research-results.tsv` | Primary Codex-facing results log |
| `autoresearch-results.tsv` | Claude-compatible results log alias |
| `autoresearch-state.json` | Current run checkpoint |
| `autoresearch-launch.json` | Background launch request |
| `autoresearch-report.md` | End-of-run report |
| `autoresearch-memory.md` | Optional reusable run memory |

## Validation model

The rewrite uses three verification layers:

1. Repo docs and manifests must use the Auto Research brand while keeping functional repository links until the GitHub slug conflict is resolved.
2. The Codex plugin payload must stay in sync with the root bundle.
3. Compatibility tests must prove that dual results logs stay aligned.
