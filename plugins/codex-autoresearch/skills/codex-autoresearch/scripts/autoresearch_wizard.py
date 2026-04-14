from __future__ import annotations

import argparse

try:
    from scripts.autoresearch_helpers import AutoresearchError, WizardConfig, build_setup_summary, print_json
except ModuleNotFoundError:
    from autoresearch_helpers import AutoresearchError, WizardConfig, build_setup_summary, print_json


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Generate a setup summary and clarification questions for a Codex autoresearch run."
    )
    parser.add_argument("--repo", help="Repository root. Defaults to the current working directory.")
    parser.add_argument("--goal", help="Desired run outcome.")
    parser.add_argument("--scope", help="In-scope files or subsystem.")
    parser.add_argument("--metric", help="Metric name tracked during the run.")
    parser.add_argument("--direction", choices=["lower", "higher"], help="Preferred metric direction.")
    parser.add_argument("--verify", help="Mechanical verify command.")
    parser.add_argument("--guard", help="Optional guard command. Use an empty string to force no guard.")
    parser.add_argument("--mode", choices=["foreground", "background"], help="Run mode.")
    parser.add_argument("--iterations", type=int, help="Optional iteration cap.")
    parser.add_argument("--duration", help="Optional wall-clock cap, for example 5h or 300m.")
    parser.add_argument("--memory-path", help="Optional reusable memory input path. Defaults to autoresearch-memory.md at repo root.")
    parser.add_argument("--required-keep-labels", nargs="*", help="Labels that must be present before a keep decision is valid.")
    parser.add_argument("--required-stop-labels", nargs="*", help="Labels that mark a retained keep as stop-ready.")
    parser.add_argument("--stop-condition", help="Optional textual stop condition.")
    parser.add_argument("--rollback-strategy", help="Optional rollback strategy description.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    config = WizardConfig(
        goal=args.goal,
        scope=args.scope,
        metric=args.metric,
        direction=args.direction,
        verify=args.verify,
        guard=args.guard,
        mode=args.mode,
        iterations=args.iterations,
        duration=args.duration,
        memory_path=args.memory_path,
        required_keep_labels=args.required_keep_labels,
        required_stop_labels=args.required_stop_labels,
        stop_condition=args.stop_condition,
        rollback_strategy=args.rollback_strategy,
    )
    try:
        payload = build_setup_summary(repo=args.repo, config=config)
    except AutoresearchError as exc:
        parser.error(str(exc))
        return 2

    print_json(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
