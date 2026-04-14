from __future__ import annotations

import argparse

try:
    from scripts.autoresearch_helpers import AutoresearchError, append_iteration, print_json
except ModuleNotFoundError:
    from autoresearch_helpers import AutoresearchError, append_iteration, print_json


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Append an experiment outcome to the autoresearch log.")
    parser.add_argument("--repo", help="Repository root. Defaults to the current working directory.")
    parser.add_argument("--results-path", help="Override the results TSV path.")
    parser.add_argument("--state-path", help="Override the state JSON path.")
    parser.add_argument("--decision", required=True, choices=["keep", "discard", "needs_human"])
    parser.add_argument("--metric-value", help="Observed metric value after the iteration.")
    parser.add_argument("--verify-status", default="pass", choices=["pass", "fail", "skip"])
    parser.add_argument("--guard-status", default="skip", choices=["pass", "fail", "skip"])
    parser.add_argument("--hypothesis", help="Short hypothesis being tested.")
    parser.add_argument("--change-summary", required=True, help="What changed in this iteration.")
    parser.add_argument("--labels", nargs="*", help="Optional labels attached to the result.")
    parser.add_argument("--note", help="Optional note or blocker detail.")
    parser.add_argument("--iteration", type=int, help="Override the iteration number.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        payload = append_iteration(
            repo=args.repo,
            results_path_value=args.results_path,
            state_path_value=args.state_path,
            decision=args.decision,
            metric_value=args.metric_value,
            verify_status=args.verify_status,
            guard_status=args.guard_status,
            hypothesis=args.hypothesis,
            change_summary=args.change_summary,
            labels=args.labels,
            note=args.note,
            iteration=args.iteration,
        )
    except AutoresearchError as exc:
        parser.error(str(exc))
        return 2

    print_json(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
