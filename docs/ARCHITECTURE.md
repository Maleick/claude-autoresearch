# Auto Research Architecture

> Current reference for v3.1.0.

Auto Research is now an OpenCode-only npm package. The runtime is Node.js ESM. All workflow semantics are preserved from earlier releases.

## Package layout

```text
src/index.ts                   # Main plugin entry
src/cli.ts                    # CLI entry point
src/constants.ts              # Package constants (version, names, paths)
src/types.ts                  # TypeScript type definitions
src/helpers.ts                # Runtime helpers (state, results, paths)
src/wizard.ts                 # Setup wizard
src/subagent-pool.ts           # Subagent pool builder
src/run-manager.ts             # Run lifecycle (init, record, status, stop, resume, complete)
commands/autoresearch.md        # Main command
commands/autoresearch/*.md     # Mode commands (plan, debug, fix, learn, etc.)
skills/autoresearch/            # OpenCode skill bundle
skills/autoresearch/references/ # Workflow and runtime references
hooks/init.sh                 # SessionStart hook
hooks/status.sh               # Status hook
hooks/stop.sh                # Stop hook
docs/OPENCODE_INSTALL.md      # OpenCode install guide
docs/RELEASE.md              # Release process
.opencode-plugin/plugin.json  # OpenCode plugin manifest
.autoresearch/                # Runtime state directory (created at runtime)
```

## Source of truth

`src/` is authoritative for runtime behavior. `commands/` and `skills/` define the OpenCode surfaces.

## Runtime artifacts

| Artifact | Purpose |
| --- | --- |
| `.autoresearch/state.json` | Current run checkpoint |
| `autoresearch-results.tsv` | Iteration log |
| `autoresearch-launch.json` | Background launch request |
| `autoresearch-report.md` | End-of-run report |
| `autoresearch-memory.md` | Reusable run memory |

## Command surface

| Command | Workflow |
| --- | --- |
| `/autoresearch` | Default improve-verify loop |
| `/autoresearch:plan` | Planning workflow |
| `/autoresearch:debug` | Debugging workflow |
| `/autoresearch:fix` | Fix workflow |
| `/autoresearch:learn` | Learning workflow |
| `/autoresearch:predict` | Prediction workflow |
| `/autoresearch:scenario` | Scenario expansion |
| `/autoresearch:security` | Security review |
| `/autoresearch:ship` | Ship-readiness workflow |

## CLI commands

| Command | Purpose |
| --- | --- |
| `autoresearch init` | Initialize a run |
| `autoresearch wizard` | Generate setup summary |
| `autoresearch status` | Print run status |
| `autoresearch launch` | Launch background run |
| `autoresearch stop` | Request stop |
| `autoresearch resume` | Resume background run |
| `autoresearch complete` | Mark run complete |
| `autoresearch record` | Record iteration result |

## Subagent pool

The standing pool provides: orchestrator, scout, analyst, verifier, synthesizer, and role-specialized variants (security_reviewer, debugger, release_guard, research_tracker). The pool is reused across iterations unless drift or repeated discards force a reset.

## Validation

1. `npm run typecheck` — TypeScript strict checks.
2. `npm pack --dry-run` — Package contents preview.
3. Package install and `autoresearch doctor` verification.

## Migration from earlier releases

- Results log is now `autoresearch-results.tsv` only (dropped `research-results.tsv`).
- State is now in `.autoresearch/state.json` (was `autoresearch-state.json` at root).
- Runtime helpers are TypeScript (`src/helpers.ts`) not Python.
- Plugin format is `.opencode-plugin/plugin.json`.
- The Claude and Codex plugin bundles (`plugins/autoresearch/`, `plugins/codex-autoresearch/`) are no longer shipped.