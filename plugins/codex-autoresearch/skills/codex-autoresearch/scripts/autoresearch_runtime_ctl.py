from __future__ import annotations

import argparse

try:
    from scripts.autoresearch_helpers import (
        AutoresearchError,
        DEFAULT_LAUNCH_PATH,
        DEFAULT_MEMORY_PATH,
        build_launch_manifest_payload,
        DEFAULT_SELF_IMPROVEMENT_PATH,
        RunConfig,
        complete_background_run,
        build_supervisor_snapshot,
        initialize_run,
        mark_background_active,
        make_state_payload,
        print_json,
        resume_background_run,
        resolve_repo,
        resolve_path,
        set_stop_requested,
        write_self_improvement_artifacts,
        write_run_report,
        write_launch_manifest,
    )
    from scripts.hook_context import update_hook_context_pointer
except ModuleNotFoundError:
    from autoresearch_helpers import (
        AutoresearchError,
        DEFAULT_LAUNCH_PATH,
        DEFAULT_MEMORY_PATH,
        build_launch_manifest_payload,
        DEFAULT_SELF_IMPROVEMENT_PATH,
        RunConfig,
        complete_background_run,
        build_supervisor_snapshot,
        initialize_run,
        mark_background_active,
        make_state_payload,
        print_json,
        resume_background_run,
        resolve_repo,
        resolve_path,
        set_stop_requested,
        write_self_improvement_artifacts,
        write_run_report,
        write_launch_manifest,
    )
    from hook_context import update_hook_context_pointer


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Manage Codex autoresearch background control artifacts.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    launch = subparsers.add_parser("launch", help="Initialize a background run and write the launch manifest.")
    launch.add_argument("--repo", help="Repository root. Defaults to the current working directory.")
    launch.add_argument("--results-path", help="Override the results TSV path.")
    launch.add_argument("--state-path", help="Override the state JSON path.")
    launch.add_argument("--launch-path", help="Override the launch manifest path.")
    launch.add_argument("--scope", help="Optional run scope label.")
    launch.add_argument("--goal", required=True)
    launch.add_argument("--metric", required=True)
    launch.add_argument("--direction", required=True, choices=["lower", "higher"])
    launch.add_argument("--verify", required=True)
    launch.add_argument("--guard")
    launch.add_argument("--iterations", type=int)
    launch.add_argument("--duration", help="Optional wall-clock cap, for example 5h or 300m.")
    launch.add_argument("--memory-path", help="Optional reusable memory input path. Defaults to autoresearch-memory.md at repo root.")
    launch.add_argument("--required-keep-labels", nargs="*", help="Labels that must be present before a keep decision is valid.")
    launch.add_argument("--required-stop-labels", nargs="*", help="Labels that mark a retained keep as stop-ready.")
    launch.add_argument("--run-tag")
    launch.add_argument("--stop-condition")
    launch.add_argument("--baseline")
    launch.add_argument("--fresh-start", action="store_true")
    launch.add_argument("--dry-run", action="store_true", help="Validate configuration and preview artifacts without writing files.")

    status = subparsers.add_parser("status", help="Read the current background run status.")
    status.add_argument("--repo", help="Repository root. Defaults to the current working directory.")
    status.add_argument("--results-path", help="Override the results TSV path.")
    status.add_argument("--state-path", help="Override the state JSON path.")
    status.add_argument("--report-path", help="Optional markdown report output path.")

    stop = subparsers.add_parser("stop", help="Request that the background run stop.")
    stop.add_argument("--repo", help="Repository root. Defaults to the current working directory.")
    stop.add_argument("--state-path", help="Override the state JSON path.")

    resume = subparsers.add_parser("resume", help="Resume a previously launched background run.")
    resume.add_argument("--repo", help="Repository root. Defaults to the current working directory.")
    resume.add_argument("--state-path", help="Override the state JSON path.")

    complete = subparsers.add_parser("complete", help="Mark the background run complete.")
    complete.add_argument("--repo", help="Repository root. Defaults to the current working directory.")
    complete.add_argument("--state-path", help="Override the state JSON path.")
    complete.add_argument("--results-path", help="Override the results TSV path.")
    complete.add_argument("--report-path", help="Optional markdown report output path.")
    complete.add_argument(
        "--self-improvement-path",
        help=f"Optional self-improvement report output path (default: {DEFAULT_SELF_IMPROVEMENT_PATH}).",
    )
    complete.add_argument(
        "--memory-path",
        help=f"Optional reusable memory output path (default: {DEFAULT_MEMORY_PATH}).",
    )

    return parser


def maybe_update_hook_context(**kwargs: object) -> None:
    try:
        update_hook_context_pointer(**kwargs)
    except Exception:
        return


def command_launch(args: argparse.Namespace) -> dict:
    launch_path = resolve_path(args.repo, args.launch_path, DEFAULT_LAUNCH_PATH)
    results_path = resolve_path(args.repo, args.results_path, "research-results.tsv")
    state_path = resolve_path(args.repo, args.state_path, "autoresearch-state.json")
    duration = getattr(args, "duration", None)
    memory_path = getattr(args, "memory_path", None)
    required_keep_labels = getattr(args, "required_keep_labels", None)
    required_stop_labels = getattr(args, "required_stop_labels", None)
    dry_run = getattr(args, "dry_run", False)
    if launch_path.exists() and not args.fresh_start:
        raise AutoresearchError(
            f"{launch_path} already exists. Use --fresh-start to archive previous artifacts."
        )
    config = RunConfig(
        goal=args.goal,
        metric=args.metric,
        direction=args.direction,
        verify=args.verify,
        scope=args.scope,
        mode="background",
        guard=args.guard,
        iterations=args.iterations,
        duration=duration,
        memory_path=memory_path,
        required_keep_labels=required_keep_labels,
        required_stop_labels=required_stop_labels,
        run_tag=args.run_tag,
        stop_condition=args.stop_condition,
        baseline=args.baseline,
    )
    if dry_run:
        return {
            "status": "dry_run",
            "launch_path": str(launch_path),
            "state_preview": make_state_payload(config, results_path, state_path, repo=args.repo),
            "launch_manifest_preview": build_launch_manifest_payload(
                repo=args.repo,
                launch_path_value=args.launch_path,
                config=config,
                results_path_value=args.results_path,
                state_path_value=args.state_path,
            ),
        }
    initialize_run(
        repo=args.repo,
        results_path_value=args.results_path,
        state_path_value=args.state_path,
        config=config,
        fresh_start=args.fresh_start,
    )
    launch = write_launch_manifest(
        repo=args.repo,
        launch_path_value=args.launch_path,
        config=config,
        results_path_value=args.results_path,
        state_path_value=args.state_path,
        fresh_start=args.fresh_start,
    )
    state = mark_background_active(repo=args.repo, state_path_value=args.state_path, active=True)
    maybe_update_hook_context(
        repo=resolve_repo(args.repo),
        active=True,
        session_mode="background",
        results_path=results_path,
        state_path=state_path,
        launch_path=launch_path,
        runtime_path=None,
    )
    return {
        "status": "launched",
        "launch_path": str(launch_path),
        "state": state,
        "launch_manifest": launch,
    }


def command_status(args: argparse.Namespace) -> dict:
    payload = build_supervisor_snapshot(
        repo=args.repo,
        results_path_value=args.results_path,
        state_path_value=args.state_path,
    )
    report_path = getattr(args, "report_path", None)
    if report_path:
        payload["report_path"] = str(
            write_run_report(
                repo=args.repo,
                results_path_value=args.results_path,
                state_path_value=args.state_path,
                report_path_value=report_path,
            )
        )
    return payload


def command_stop(args: argparse.Namespace) -> dict:
    state = set_stop_requested(repo=args.repo, state_path_value=args.state_path)
    maybe_update_hook_context(
        repo=resolve_repo(args.repo),
        active=True,
        session_mode="background",
        results_path=resolve_path(args.repo, None, "research-results.tsv"),
        state_path=resolve_path(args.repo, args.state_path, "autoresearch-state.json"),
        launch_path=resolve_path(args.repo, None, DEFAULT_LAUNCH_PATH),
        runtime_path=None,
    )
    return {
        "status": "stop_requested",
        "run_id": state["run_id"],
        "state": state,
    }


def command_resume(args: argparse.Namespace) -> dict:
    state = resume_background_run(repo=args.repo, state_path_value=args.state_path)
    maybe_update_hook_context(
        repo=resolve_repo(args.repo),
        active=True,
        session_mode="background",
        results_path=resolve_path(args.repo, None, "research-results.tsv"),
        state_path=resolve_path(args.repo, args.state_path, "autoresearch-state.json"),
        launch_path=resolve_path(args.repo, None, DEFAULT_LAUNCH_PATH),
        runtime_path=None,
    )
    return {
        "status": "resumed",
        "run_id": state["run_id"],
        "state": state,
    }


def command_complete(args: argparse.Namespace) -> dict:
    state = complete_background_run(repo=args.repo, state_path_value=args.state_path)
    report_path = getattr(args, "report_path", None)
    self_improvement_path = getattr(args, "self_improvement_path", None)
    memory_path = getattr(args, "memory_path", None)
    payload = {
        "status": "completed",
        "run_id": state["run_id"],
        "state": state,
    }
    maybe_update_hook_context(
        repo=resolve_repo(args.repo),
        active=False,
        session_mode="background",
        results_path=resolve_path(args.repo, args.results_path, "research-results.tsv"),
        state_path=resolve_path(args.repo, args.state_path, "autoresearch-state.json"),
        launch_path=resolve_path(args.repo, None, DEFAULT_LAUNCH_PATH),
        runtime_path=None,
    )
    self_improvement_path, memory_path = write_self_improvement_artifacts(
        repo=args.repo,
        results_path_value=args.results_path,
        state_path_value=args.state_path,
        self_improvement_path_value=self_improvement_path,
        memory_path_value=memory_path,
    )
    payload["self_improvement_path"] = str(self_improvement_path)
    payload["memory_path"] = str(memory_path)
    if report_path:
        payload["report_path"] = str(
            write_run_report(
                repo=args.repo,
                results_path_value=args.results_path,
                state_path_value=args.state_path,
                report_path_value=report_path,
            )
        )
    return payload


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        if args.command == "launch":
            payload = command_launch(args)
        elif args.command == "status":
            payload = command_status(args)
        elif args.command == "stop":
            payload = command_stop(args)
        elif args.command == "resume":
            payload = command_resume(args)
        elif args.command == "complete":
            payload = command_complete(args)
        else:
            parser.error(f"Unsupported command: {args.command}")
            return 2
    except AutoresearchError as exc:
        parser.error(str(exc))
        return 2

    print_json(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
