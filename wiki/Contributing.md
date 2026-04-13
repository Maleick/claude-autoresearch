# Contributing

## Version Bump Procedure

When bumping the version (e.g. `2.1.0 → 2.2.0`), update **all 5 files**:

1. `plugins/autoresearch/.claude-plugin/plugin.json` — `"version"` field
2. `.claude-plugin/marketplace.json` — `"version"` field at root
3. `README.md` — version badge and `> **v2.2.0**` line
4. `CHANGELOG.md` — new `## [2.2.0] - YYYY-MM-DD` section at top
5. `VERSION` — single line at repo root, no trailing newline: `2.2.0`

Missing any one of these will cause the `validate.yml` CI check to fail.

## Adding a Sub-command

1. Create `plugins/autoresearch/commands/autoresearch/<name>.md` with required frontmatter:
   ```yaml
   ---
   name: autoresearch:<name>
   description: <one line>
   argument-hint: "<flags>"
   ---
   ```
2. Create `plugins/autoresearch/skills/autoresearch/references/<name>-workflow.md`
3. Reference the workflow file from the command (see existing sub-commands for the pattern)
4. Add the command to `README.md` command table and Command Reference section
5. Add it to `wiki/Commands.md`

## Modifying a Workflow Protocol

When editing a `references/*-workflow.md` file:

- Verify the corresponding command still reads it correctly (check the `## Execution` section of the command `.md`)
- Use decimal phase numbering when inserting new phases (e.g., `Phase 2.5`) to avoid renumbering
- Update `docs/ARCHITECTURE.md` phase table if phase numbering changes

## PR Checklist

- [ ] All 5 version files updated (or no version bump needed)
- [ ] No TBDs or incomplete sections in any modified markdown
- [ ] Frontmatter fields present: `name`, `description`, `argument-hint` (sub-commands)
- [ ] If new sub-command: corresponding `*-workflow.md` exists
- [ ] `CHANGELOG.md` has an entry for this change
- [ ] `wiki/` updated if commands or configuration changed
