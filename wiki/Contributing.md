# Contributing

The root bundle is the source of truth for the Codex plugin payload.

## When you change the root bundle

Run:

```bash
python3 scripts/sync_plugin_payload.py --repo .
python3 scripts/check_plugin_distribution.py --repo .
pytest -q tests/test_plugin_distribution.py tests/test_results_compatibility.py
```

## When you change metadata or docs

Make sure these surfaces stay aligned:

- `README.md`
- `CHANGELOG.md`
- `VERSION`
- `.claude-plugin/marketplace.json`
- `plugins/autoresearch/.claude-plugin/plugin.json`
- `plugins/codex-autoresearch/.codex-plugin/plugin.json`
