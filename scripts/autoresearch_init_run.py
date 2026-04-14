from __future__ import annotations

import argparse

try:
    from scripts.autoresearch_helpers import (
        AutoresearchError,
        DEFAULT_LAUNCH_PATH,
        RunConfig,
        initialize_run,
        print_json,
        resolve_path,
        resolve_repo,
    )
    from scripts.hook_context import update_hook_context_pointer
except ModuleNotFoundError:
    from autoresearch_helpers import (
        AutoresearchError,
        DEFAULT_LAUNCH_PATH,
        RunConfig,
        initialize_run,
        print_json,
        resolve_path,
        resolve_repo,
    )
    from hook_context import update_hook_context_pointer


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Initialize Codex autoresearch state and results artifacts.")
    parser.add_argument("--repo", help="Repository root. Defaults to the current working directory.")
    parser.add_argument("--results-path", help="Override the results TSV path.")
    parser.add_argument("--state-path", help="Override the state JSON path.")
    parser.add_argument("--scope", help="Optional run scope label.")
    parser.add_argument("--goal", required=True, help="Human-readable outcome for the run.")
    parser.add_argument("--metric", required=True, help="Metric name tracked during the run.")
    parser.add_argument("--direction", required=True, choices=["lower", "higher"], help="Preferred metric direction.")
    parser.add_argument("--verify", required=True, help="Mechanical verify command.")
    parser.add_argument("--mode", default="foreground", choices=["foreground", "background"], help="Run mode.")
    parser.add_argument("--guard", help="Optional guard command.")
    parser.add_argument("--iterations", type=int, help="Optional iteration cap.")
    parser.add_argument("--duration", help="Optional wall-clock cap, for example 5h or 300m.")
    parser.add_argument("--memory-path", help="Optional reusable memory input path. Defaults to autoresearch-memory.md at repo root.")
    parser.add_argument("--required-keep-labels", nargs="*", help="Labels that must be present before a keep decision is valid.")
    parser.add_argument("--required-stop-labels", nargs="*", help="Labels that mark a retained keep as stop-ready.")
    parser.add_argument("--run-tag", help="Optional human-readable run tag.")
    parser.add_argument("--stop-condition", help="Optional textual stop condition.")
    parser.add_argument("--baseline", help="Optional baseline metric value.")
    parser.add_argument("--fresh-start", action="store_true", help="Archive previous artifacts before initializing.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    config = RunConfig(
        goal=args.goal,
        metric=args.metric,
        direction=args.direction,
        verify=args.verify,
        mode=args.mode,
        scope=args.scope,
        guard=args.guard,
        iterations=args.iterations,
        duration=args.duration,
        memory_path=args.memory_path,
        required_keep_labels=args.required_keep_labels,
        required_stop_labels=args.required_stop_labels,
        run_tag=args.run_tag,
        stop_condition=args.stop_condition,
        baseline=args.baseline,
    )
    try:
        payload = initialize_run(
            repo=args.repo,
            results_path_value=args.results_path,
            state_path_value=args.state_path,
            config=config,
            fresh_start=args.fresh_start,
        )
    except AutoresearchError as exc:
        parser.error(str(exc))
        return 2

    try:
        update_hook_context_pointer(
            repo=resolve_repo(args.repo),
            active=True,
            session_mode=args.mode,
            results_path=resolve_path(args.repo, args.results_path, "research-results.tsv"),
            state_path=resolve_path(args.repo, args.state_path, "autoresearch-state.json"),
            launch_path=resolve_path(args.repo, None, DEFAULT_LAUNCH_PATH) if args.mode == "background" else None,
            runtime_path=None,
        )
    except Exception:
        pass
    print_json(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
