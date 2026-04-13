# Installation

## Requirements

- [Claude Code](https://claude.ai/claude-code) with marketplace plugin support
- A git-backed codebase with a clean working tree
- A deterministic verification command that outputs a number

## One-Liner Install

```bash
claude plugin marketplace add Maleick/claude-autoresearch && claude plugin install autoresearch@Maleick-claude-autoresearch
```

## Manual Steps

If the one-liner fails, run each step individually:

```bash
# 1. Add the marketplace source
/plugin marketplace add Maleick/claude-autoresearch

# 2. Install the plugin
/plugin install autoresearch@Maleick-claude-autoresearch

# 3. Reload to activate
/reload-plugins
```

## Updating

Auto-update is enabled by default in v2.2.0. Claude Code's marketplace poller will detect new versions automatically.

To update manually:

```bash
/plugin marketplace update Maleick/claude-autoresearch
```

To verify your installed version: **Customize > Autoresearch** — version shown at the top of the plugin panel.

## Uninstalling

```bash
/plugin uninstall autoresearch
/plugin marketplace remove Maleick/claude-autoresearch
```
