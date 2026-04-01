# Contributing to Autoresearch

Autoresearch is a Claude Code marketplace plugin written entirely in Markdown. Contributions are welcome.

## Project Structure

```
.claude-plugin/marketplace.json          # Marketplace registry
plugins/autoresearch/
  .claude-plugin/plugin.json             # Plugin manifest (name, version)
  commands/
    autoresearch.md                      # Main command — parses args, delegates
    autoresearch/                        # Sub-commands (debug, fix, learn, etc.)
  skills/autoresearch/
    SKILL.md                             # Skill entry point — invariants, stop conditions
    references/                          # Workflow protocols consumed by commands
```

## Adding a New Subcommand

1. Create `plugins/autoresearch/commands/autoresearch/<name>.md`
2. Add YAML frontmatter with `name`, `description`, and `argument-hint`
3. Create the workflow protocol at `plugins/autoresearch/skills/autoresearch/references/<name>-workflow.md`
4. Update the SKILL.md references table to include the new workflow
5. Add the command to the guided wizard in `commands/autoresearch.md` (Step 2 — Mode Dispatch)
6. Document the command in README.md with flags, example invocation, and expected output
7. Add a CHANGELOG entry

## Modifying Workflow Protocols

- Each command reads its corresponding `references/*-workflow.md` file
- Changes to a workflow must be reflected in the command that reads it
- Safety invariants in SKILL.md apply to all workflows — never violate them
- Phase numbering must be consistent within each workflow file

## Command File Format

Every command `.md` file requires YAML frontmatter:

```yaml
---
name: autoresearch:<subcommand>
description: One-line description of what the command does
argument-hint: "[flags and parameters]"
---
```

The body contains execution instructions that Claude Code follows when the command is invoked.

## Version Bumping

When releasing a new version, update these files:

1. `plugins/autoresearch/.claude-plugin/plugin.json` — `version` field
2. `.claude-plugin/marketplace.json` — `version` field
3. `README.md` — version in the header line
4. `CHANGELOG.md` — add new version section at the top

## Validation

There are no automated tests. Verify changes by:

1. Reading all modified files and checking cross-references between commands, skills, and reference docs
2. Ensuring YAML frontmatter is valid in all command files
3. Confirming no broken markdown (unclosed fences, dangling links)
4. Running `grep -rn "TODO\|FIXME" plugins/ docs/` to check for unfinished work
5. Verifying all safety invariants in SKILL.md are numbered and complete

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
