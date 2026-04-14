# Installation

## Claude

```bash
claude plugin marketplace add Maleick/claude-autoresearch
claude plugin install autoresearch@Maleick-claude-autoresearch
```

The Claude package keeps stable `autoresearch` identifiers for compatibility.

## Codex

This repo includes a local marketplace at `.agents/plugins/marketplace.json`.

1. Open Codex in this repository.
2. Run `/plugins`.
3. Choose the repo marketplace.
4. Install `codex-autoresearch`.

If you change the root bundle, re-sync the packaged plugin before testing:

```bash
python3 scripts/sync_plugin_payload.py --repo .
```
