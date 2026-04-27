# OpenCode Install

Install `opencode-autoresearch` as a global npm package.

## Install

```bash
npm install -g opencode-autoresearch
```

## Verify Installation

```bash
opencode-autoresearch doctor
```

Should print the package version and confirm the plugin surfaces are in place.

## OpenCode Plugin Registration

After install, the plugin is available as `autoresearch`:

- `/autoresearch` — Run the main improve-verify loop
- `/autoresearch:plan` — Planning workflow
- `/autoresearch:debug` — Debugging workflow
- `/autoresearch:fix` — Fix workflow
- `/autoresearch:learn` — Learning workflow
- `/autoresearch:predict` — Prediction workflow
- `/autoresearch:scenario` — Scenario expansion
- `/autoresearch:security` — Security review
- `/autoresearch:ship` — Ship-readiness workflow

## Runtime Artifacts

After install, artifacts are stored in `.autoresearch/` under the working directory:

| Artifact | Purpose |
| --- | --- |
| `.autoresearch/state.json` | Current run state |
| `autoresearch-results.tsv` | Iteration log |
| `autoresearch-report.md` | End-of-run report |
| `autoresearch-memory.md` | Reusable memory |

## Uninstall

```bash
npm uninstall -g opencode-autoresearch
```