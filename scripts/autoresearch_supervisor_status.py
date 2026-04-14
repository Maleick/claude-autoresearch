from __future__ import annotations

import argparse

try:
    from scripts.autoresearch_helpers import AutoresearchError, build_supervisor_snapshot, print_json
except ModuleNotFoundError:
    from autoresearch_helpers import AutoresearchError, build_supervisor_snapshot, print_json


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Compute the next supervisor action for an autoresearch run.")
    parser.add_argument("--repo", help="Repository root. Defaults to the current working directory.")
    parser.add_argument("--results-path", help="Override the results TSV path.")
    parser.add_argument("--state-path", help="Override the state JSON path.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        payload = build_supervisor_snapshot(
            repo=args.repo,
            results_path_value=args.results_path,
            state_path_value=args.state_path,
        )
    except AutoresearchError as exc:
        parser.error(str(exc))
        return 2

    print_json(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
