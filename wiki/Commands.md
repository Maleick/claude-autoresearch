# Commands

## OpenCode Command Surface

The command family is fully supported in OpenCode:

- `/autoresearch` — Default improve-verify loop
- `/autoresearch:plan` — Planning workflow
- `/autoresearch:debug` — Debugging workflow
- `/autoresearch:fix` — Fix workflow
- `/autoresearch:learn` — Learning workflow
- `/autoresearch:predict` — Prediction workflow
- `/autoresearch:scenario` — Scenario expansion
- `/autoresearch:security` — Security review
- `/autoresearch:ship` — Ship-readiness workflow

## CLI

The `autoresearch` CLI provides background and foreground run control:

- `autoresearch init` — Initialize a run
- `autoresearch wizard` — Generate setup summary
- `autoresearch status` — Print run status
- `autoresearch launch` — Launch background run
- `autoresearch stop` — Request stop
- `autoresearch resume` — Resume background run
- `autoresearch complete` — Mark run complete
- `autoresearch record` — Record iteration result

## Mode Routing

- **default**: Improve-verify loop with metric tracking
- **plan**: Setup planning before iteration
- **debug**: Debugging workflow
- **fix**: Targeted repair workflow
- **learn**: Knowledge acquisition
- **predict**: Outcome prediction
- **scenario**: Scenario comparison
- **security**: Security review
- **ship**: Ship-readiness check