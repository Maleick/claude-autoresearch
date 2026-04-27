# Contributing

`src/` is the source of truth for runtime behavior. `commands/` and `skills/` define the OpenCode surfaces.

## When you change the runtime

```bash
npm run build
npm run typecheck
npm pack --dry-run
```

## When you change metadata or docs

Make sure these surfaces stay aligned:

- `package.json` (canonical version)
- `src/constants.ts` (VERSION constant)
- `README.md`
- `docs/ARCHITECTURE.md`
- `.opencode-plugin/plugin.json`

## Releasing

See [docs/RELEASE.md](docs/RELEASE.md) for the full release process.

## Testing

```bash
npm run build
npm run typecheck
```

## Package Contents

The shipped npm package includes:

- `dist/` — Compiled TypeScript
- `commands/` — OpenCode command surfaces
- `skills/autoresearch/` — Skill bundle
- `hooks/` — Shell hooks
- `docs/` — Install and architecture docs
- `.opencode-plugin/plugin.json` — Plugin manifest

Python scripts are **not** included.