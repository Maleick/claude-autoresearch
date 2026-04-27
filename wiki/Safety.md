# Safety

Auto Research relies on a few non-negotiable rules:

- do not keep a change without mechanical verification
- use branch isolation for code-modifying runs
- treat run artifacts as generated state, not source files
- do not revert unrelated user work
- stop when the run genuinely needs human input
- make one focused experiment per iteration
- record every iteration before the next one starts

## Artifact Discipline

- Run artifacts (`.autoresearch/state.json`, `autoresearch-results.tsv`, etc.) are generated working state
- Do not commit them to version control unless intentional
- `autoresearch-memory.md` can be reused across runs but is also generated