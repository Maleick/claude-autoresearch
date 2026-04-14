#!/usr/bin/env python3
from __future__ import annotations

import argparse
import shlex
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Callable, Sequence


class ContributorGateError(RuntimeError):
    pass


@dataclass(frozen=True)
class GateStep:
    label: str
    argv: tuple[str, ...]
    cwd: Path | None = None


def resolve_repo_root(value: str | None) -> Path:
    return Path(value).expanduser().resolve() if value else Path.cwd().resolve()


def build_python_step(
    repo_root: Path,
    label: str,
    python_executable: str,
    *args: str,
    cwd: Path | None = None,
) -> GateStep:
    return GateStep(
        label=label,
        argv=(python_executable, *args),
        cwd=cwd or repo_root,
    )


def build_contributor_gate_plan(
    repo_root: Path,
    mode: str,
    *,
    python_executable: str | None = None,
) -> list[GateStep]:
    python_executable = python_executable or sys.executable or "python3"
    sync_script = repo_root / "scripts" / "sync_plugin_payload.py"
    distribution_script = repo_root / "scripts" / "check_plugin_distribution.py"

    steps = [
        build_python_step(
            repo_root,
            "sync packaged plugin payload",
            python_executable,
            str(sync_script),
            "--check",
        ),
        build_python_step(
            repo_root,
            "validate plugin distribution metadata",
            python_executable,
            str(distribution_script),
        ),
    ]

    if mode == "packaging":
        steps.append(
            build_python_step(
                repo_root,
                "run plugin distribution tests",
                python_executable,
                "-m",
                "pytest",
                "tests/test_plugin_distribution.py",
                "-q",
            )
        )
        return steps

    if mode == "skill":
        steps.append(
            build_python_step(
                repo_root,
                "run full pytest suite",
                python_executable,
                "-m",
                "pytest",
                "-q",
            )
        )
        return steps

    raise ContributorGateError(f"Unsupported contributor gate mode: {mode}")


def format_command(argv: Sequence[str]) -> str:
    return " ".join(shlex.quote(part) for part in argv)


def print_plan(steps: Sequence[GateStep]) -> None:
    for index, step in enumerate(steps, start=1):
        print(f"{index}. {step.label}: {format_command(step.argv)}")


def run_contributor_gate_plan(
    steps: Sequence[GateStep],
    *,
    repo_root: Path,
    runner: Callable[..., subprocess.CompletedProcess] = subprocess.run,
) -> int:
    for step in steps:
        print(f"==> {step.label}")
        try:
            completed = runner(step.argv, cwd=step.cwd or repo_root)
        except FileNotFoundError as exc:
            raise ContributorGateError(f"Unable to start {step.label}: {exc}") from exc
        if completed.returncode != 0:
            print(f"Contributor gate failed at {step.label} with exit code {completed.returncode}")
            return completed.returncode

    print("Contributor gate checks passed.")
    return 0


def run_step(step: GateStep) -> subprocess.CompletedProcess[bytes]:
    return subprocess.run(step.argv, cwd=step.cwd, check=False)


def run_runtime_smoke(
    repo_root: Path,
    *,
    python_executable: str | None = None,
    runner: Callable[[GateStep], object] = run_step,
) -> None:
    python_executable = python_executable or sys.executable or "python3"
    runtime_ctl = repo_root / "scripts" / "autoresearch_runtime_ctl.py"
    with TemporaryDirectory(prefix="codex-autoresearch-gate-") as tmp_dir:
        temp_repo = Path(tmp_dir)
        shared_args = ("--repo", str(temp_repo))
        steps = [
            build_python_step(
                repo_root,
                "runtime smoke: launch",
                python_executable,
                str(runtime_ctl),
                "launch",
                *shared_args,
                "--goal",
                "Contributor gate runtime smoke",
                "--scope",
                "background control helpers",
                "--metric",
                "failing checks",
                "--direction",
                "lower",
                "--verify",
                "python -m pytest -q",
                "--guard",
                f"{python_executable} scripts/check_plugin_distribution.py",
                "--iterations",
                "1",
                "--duration",
                "5m",
            ),
            build_python_step(
                repo_root,
                "runtime smoke: status",
                python_executable,
                str(runtime_ctl),
                "status",
                *shared_args,
            ),
            build_python_step(
                repo_root,
                "runtime smoke: stop",
                python_executable,
                str(runtime_ctl),
                "stop",
                *shared_args,
            ),
            build_python_step(
                repo_root,
                "runtime smoke: resume",
                python_executable,
                str(runtime_ctl),
                "resume",
                *shared_args,
            ),
            build_python_step(
                repo_root,
                "runtime smoke: complete",
                python_executable,
                str(runtime_ctl),
                "complete",
                *shared_args,
            ),
        ]
        for step in steps:
            print(f"==> {step.label}")
            result = runner(step)
            returncode = getattr(result, "returncode", 0)
            if returncode != 0:
                raise ContributorGateError(
                    f"Runtime smoke failed at {step.label} with exit code {returncode}"
                )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Run the repo's contributor gate."
    )
    parser.add_argument(
        "mode",
        nargs="?",
        default="skill",
        choices=["packaging", "skill"],
        help="Gate surface to validate. 'skill' includes full tests and runtime smoke.",
    )
    parser.add_argument(
        "--repo",
        help="Repository root. Defaults to the current working directory.",
    )
    parser.add_argument(
        "--python",
        dest="python_executable",
        help="Python interpreter to use for the gate. Defaults to the current interpreter.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the planned checks without executing them.",
    )
    parser.add_argument(
        "--skip-runtime-smoke",
        action="store_true",
        help="Skip the temporary background-control smoke run for skill mode.",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    repo_root = resolve_repo_root(args.repo)
    plan = build_contributor_gate_plan(
        repo_root,
        args.mode,
        python_executable=args.python_executable,
    )

    if args.dry_run:
        print_plan(plan)
        if args.mode == "skill" and not args.skip_runtime_smoke:
            print("runtime-smoke: temp repo launch/status/stop/resume/complete")
        return 0

    exit_code = run_contributor_gate_plan(plan, repo_root=repo_root)
    if exit_code != 0:
        return exit_code

    if args.mode == "skill" and not args.skip_runtime_smoke:
        run_runtime_smoke(
            repo_root,
            python_executable=args.python_executable,
        )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ContributorGateError as exc:
        raise SystemExit(f"error: {exc}")
