# Commands

## Claude compatibility surface

The stable command family remains:

- `/autoresearch`
- `/autoresearch:plan`
- `/autoresearch:debug`
- `/autoresearch:fix`
- `/autoresearch:learn`
- `/autoresearch:predict`
- `/autoresearch:scenario`
- `/autoresearch:security`
- `/autoresearch:ship`

## Codex surface

Codex uses the root skill bundle and packaged plugin:

- `$codex-autoresearch`
- `plugins/codex-autoresearch`

The root bundle routes between:

- the default optimization loop
- plan
- debug
- fix
- learn
- predict
- scenario
- security
- ship
