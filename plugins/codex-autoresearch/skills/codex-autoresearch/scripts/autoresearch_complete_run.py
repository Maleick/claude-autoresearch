from __future__ import annotations

import argparse

try:
    from scripts.autoresearch_helpers import (
        AutoresearchError,
        complete_foreground_run,
        print_json,
        resolve_path,
        resolve_repo,
        write_run_report,
        write_self_improvement_artifacts,
    )
    from scripts.hook_context import update_hook_context_pointer
except ModuleNotFoundError:
    from autoresearch_helpers import (
        AutoresearchError,
        complete_foreground_run,
        print_json,
        resolve_path,
        resolve_repo,
        write_run_report,
        write_self_improvement_artifacts,
    )
    from hook_context import update_hook_context_pointer


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Complete a foreground Codex autoresearch run and write post-run artifacts."
    )
    parser.add_argument("--repo", help="Repository root. Defaults to the current working directory.")
    parser.add_argument("--state-path", help="Override the state JSON path.")
    parser.add_argument("--results-path", help="Override the results TSV path.")
    parser.add_argument("--report-path", help="Optional markdown report output path.")
    parser.add_argument(
        "--self-improvement-path",
        help="Optional self-improvement report output path.",
    )
    parser.add_argument(
        "--memory-path",
        help="Optional reusable memory output path.",
    )
    return parser


def maybe_update_hook_context(**kwargs: object) -> None:
    try:
        update_hook_context_pointer(**kwargs)
    except Exception:
        return


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        state = complete_foreground_run(repo=args.repo, state_path_value=args.state_path)
        payload = {
            "status": "completed",
            "run_id": state["run_id"],
            "state": state,
        }
        maybe_update_hook_context(
            repo=resolve_repo(args.repo),
            active=False,
            session_mode="foreground",
            results_path=resolve_path(args.repo, args.results_path, "research-results.tsv"),
            state_path=resolve_path(args.repo, args.state_path, "autoresearch-state.json"),
            launch_path=None,
            runtime_path=None,
        )
        self_improvement_path, memory_path = write_self_improvement_artifacts(
            repo=args.repo,
            results_path_value=args.results_path,
            state_path_value=args.state_path,
            self_improvement_path_value=args.self_improvement_path,
            memory_path_value=args.memory_path,
        )
        payload["self_improvement_path"] = str(self_improvement_path)
        payload["memory_path"] = str(memory_path)
        if args.report_path:
            payload["report_path"] = str(
                write_run_report(
                    repo=args.repo,
                    results_path_value=args.results_path,
                    state_path_value=args.state_path,
                    report_path_value=args.report_path,
                )
            )
    except AutoresearchError as exc:
        parser.error(str(exc))
        return 2

    print_json(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
