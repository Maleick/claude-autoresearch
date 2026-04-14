# Safety

Auto Research relies on a few non-negotiable rules:

- do not keep a change without mechanical verification
- use branch isolation for code-modifying runs
- treat run artifacts as generated state
- do not revert unrelated user work
- stop when the run genuinely needs human input

The root `SKILL.md` and `references/` directory define the Codex-facing safety contract. The Claude compatibility package keeps the stable command interface.
