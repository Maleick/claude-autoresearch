# Release Process

This package uses npm publish for releases.

## Version Alignment

`VERSION` in `src/constants.ts` and `version` in `package.json` must stay aligned. The `package.json` version is the canonical source of truth for npm.

## Release Steps

### 1. Update version

Bump the version in `package.json` and `src/constants.ts`.

```bash
# Update package.json
npm version patch  # or minor, major

# Sync to src/constants.ts
sed -i '' 's/"3\.\([0-9]\+\)\.[0-9]*"/"3.\1.\1"/' src/constants.ts
```

### 2. Build

```bash
npm run build
```

### 3. Test

```bash
npm run typecheck
```

### 4. Dry-run pack

```bash
npm pack --dry-run
```

Verify the output includes: `dist/`, `commands/`, `skills/`, `hooks/`, `docs/`, `.opencode-plugin/`.

### 5. Publish

```bash
npm publish
```

### 6. Tag

```bash
git tag v$(node -p "require('./package.json').version")
git push origin v$(node -p "require('./package.json').version")
```

## Package Contents

The shipped package includes:

- `dist/` — Compiled TypeScript (CLI entry point, helpers, subagent pool, run manager)
- `commands/` — OpenCode command surfaces (`autoresearch.md`, `autoresearch/*.md`)
- `skills/autoresearch/` — Skill bundle with references
- `hooks/` — Shell hooks for session lifecycle
- `docs/` — Installation and architecture docs
- `.opencode-plugin/plugin.json` — Plugin manifest

Python scripts are **not** included in the shipped package.