# Auto Research

[![GitHub Release](https://img.shields.io/github/v/release/Maleick/AutoResearch?style=flat-square&label=release)](https://github.com/Maleick/AutoResearch/releases)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Runtime](https://img.shields.io/badge/runtime-OpenCode-0F766E?style=flat-square)](.)

> **v3.1.0** — OpenCode-only npm package

Auto Research is a subagent-first autonomous iteration engine for OpenCode. It keeps the existing `/autoresearch` command surface intact and adds specialized mode workflows.

Inspired by [Karpathy's autoresearch](https://github.com/karpathy/autoresearch). The core loop is still the same:

**Modify -> Verify -> Keep or Discard -> Repeat**

## Runtime surfaces

| Surface | Entry point |
| --- | --- |
| OpenCode | `/autoresearch`, `/autoresearch:plan`, `/autoresearch:debug`, `/autoresearch:fix`, `/autoresearch:learn`, `/autoresearch:predict`, `/autoresearch:scenario`, `/autoresearch:security`, `/autoresearch:ship` |

## Install

```bash
npm install -g opencode-autoresearch
opencode-autoresearch doctor
```

See [docs/OPENCODE_INSTALL.md](docs/OPENCODE_INSTALL.md) for full install and verification steps.

## Core loop

Auto Research requires a goal, scope, and a mechanical verification command. It then:

1. Baselines the current state.
2. Makes one focused experiment.
3. Verifies it mechanically.
4. Keeps strict improvements and discards regressions.
5. Records the result and continues until the stop condition is met.

## Runtime artifacts

| Artifact | Purpose |
| --- | --- |
| `.autoresearch/state.json` | Checkpoint state for the current run |
| `autoresearch-results.tsv` | Iteration log |
| `autoresearch-report.md` | End-of-run report |
| `autoresearch-memory.md` | Reusable memory for later runs |

## Development

```bash
npm run typecheck   # Type check the TypeScript sources
npm run build       # Compile TypeScript to dist/
npm pack --dry-run # Preview shipped package contents
```

## Repository layout

```text
src/                          # TypeScript source (runtime helpers, CLI, subagent pool)
dist/                         # Compiled JavaScript output
commands/                     # OpenCode command surfaces
skills/autoresearch/           # Skill bundle with references
hooks/                        # Shell hooks for session lifecycle
docs/                         # Install and architecture docs
.autoresearch/                 # Runtime state directory
.opencode-plugin/              # Plugin manifest
```

## Notes

- This is an **OpenCode-only** package. No Claude or Codex runtime is supported.
- The CLI uses Node.js ESM modules.
- Python scripts were used in earlier releases and are no longer shipped.