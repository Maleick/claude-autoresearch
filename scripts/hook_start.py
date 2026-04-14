from __future__ import annotations

import json

try:
    from scripts.hook_common import build_context
except ModuleNotFoundError:
    from hook_common import build_context


CHECKLIST_LINES = (
    "- If this is a fresh managed run, baseline first, then initialize results/state artifacts.",
    "- Record every completed experiment before starting the next one.",
    "- Keep retain/stop label gates satisfied before marking an iteration as kept.",
    "- Respect iteration and duration caps; use status --report-path when you need a report.",
    "- After launch approval, continue by default unless the user stops the run or a real needs_human blocker appears.",
    "- If autoresearch-memory.md exists at repo root, the next setup and launch flow should carry it automatically; review it before overriding.",
)


def emit_additional_context(text: str) -> None:
    payload = {
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": text,
        }
    }
    print(json.dumps(payload), end="")


def main() -> int:
    context = build_context(__file__)
    if context is None or context.skill_root is None:
        return 0
    if not context.session_is_managed:
        return 0
    if not context.has_active_artifacts:
        return 0

    emit_additional_context("\n".join(CHECKLIST_LINES))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
