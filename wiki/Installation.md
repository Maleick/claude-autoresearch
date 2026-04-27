# Installation

Install the `opencode-autoresearch` npm package globally.

## Install

```bash
npm install -g opencode-autoresearch
```

## Verify

```bash
opencode-autoresearch doctor
```

## OpenCode Commands

After install, these are available in OpenCode:

- `/autoresearch` — Default improve-verify loop
- `/autoresearch:plan` — Planning workflow
- `/autoresearch:debug` — Debugging workflow
- `/autoresearch:fix` — Fix workflow
- `/autoresearch:learn` — Learning workflow
- `/autoresearch:predict` — Prediction workflow
- `/autoresearch:scenario` — Scenario expansion
- `/autoresearch:security` — Security review
- `/autoresearch:ship` — Ship-readiness workflow

## CLI Commands

```bash
autoresearch init --goal "..." --metric "..." --direction "lower" --verify "npm test"
autoresearch status
autoresearch stop
autoresearch resume
autoresearch complete
```

## Runtime Artifacts

Artifacts are stored in `.autoresearch/` under the working directory:

- `.autoresearch/state.json` — Current run state
- `autoresearch-results.tsv` — Iteration log
- `autoresearch-report.md` — End-of-run report
- `autoresearch-memory.md` — Reusable memory

See [docs/OPENCODE_INSTALL.md](docs/OPENCODE_INSTALL.md) for full install details.