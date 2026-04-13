# Autoresearch Wiki

Autonomous iteration engine for Claude Code. **v2.2.0**

## Navigation

| Page                              | Contents                                                  |
| --------------------------------- | --------------------------------------------------------- |
| [Installation](Installation.md)   | Install, update, auto-update, requirements                |
| [Commands](Commands.md)           | All 9 commands with flags and examples                    |
| [Configuration](Configuration.md) | Parameters, flags, stop conditions, metric patterns       |
| [Safety](Safety.md)               | Invariants, branch isolation, side effects, what to avoid |
| [Contributing](Contributing.md)   | Dev setup, version-bump procedure, PR checklist           |

## Quick Start

```bash
# Install
claude plugin marketplace add Maleick/claude-autoresearch && claude plugin install autoresearch@Maleick-claude-autoresearch

# Run the wizard
/autoresearch:plan

# Or run directly
/autoresearch Goal: "Reduce bundle size" Scope: "src/**/*.ts" Metric: "bundle size KB" Verify: "npm run build 2>&1 | grep size | awk '{print \$3}'" Direction: minimize
```

## Core Loop

**Modify → Verify → Keep/Discard → Repeat**

autoresearch makes one small, atomic change, runs your verification command, keeps the change if the metric improved (strict improvement only), resets if it didn't, and repeats. Every kept change is a git commit on an isolated branch.
