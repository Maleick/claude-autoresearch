# Learn Workflow

Autonomous codebase documentation engine. Scout, learn, generate/update docs with a validation-fix loop.

## Modes

- **init**: Generate documentation from scratch for the codebase
- **update**: Update existing docs to reflect code changes
- **check**: Validate existing docs against current code (no modifications)
- **summarize**: Generate a high-level summary of the codebase

## Phase 1: Scout
- Scan files matching Scope glob
- Identify: entry points, exports, public APIs, key data structures
- Build a map of modules/components and their relationships
- If `--depth quick`: scan top-level files only
- If `--depth standard`: scan all source files
- If `--depth deep`: scan source + tests + configs

## Phase 2: Learn
- For each module/component identified:
  - Read the code and understand its purpose
  - Identify inputs, outputs, side effects
  - Note dependencies and dependents
  - Extract existing comments/docstrings

## Phase 3: Generate
- Based on `--format` (default: markdown):
  - Generate documentation files in the appropriate format
  - If `--file` is set, only generate/update that specific file
  - If `--topics` is set, focus on those topics
- Structure: overview → architecture → modules → API reference

## Phase 4: Validate
- Check generated docs against code:
  - Are all public APIs documented?
  - Do code examples compile/run?
  - Are file paths and function names accurate?
- Report discrepancies

## Phase 5: Fix (unless `--no-fix`)
- Auto-correct inaccuracies found in validation
- Re-validate after fixes
- Repeat until clean or max iterations reached

## Phase 6: Summary
- Print what was generated/updated
- List any remaining validation issues
