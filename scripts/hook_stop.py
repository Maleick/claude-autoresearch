from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

try:
    from scripts.hook_context import update_hook_context_pointer
    from scripts.hook_common import (
        build_context,
        extract_next_steps_block,
        load_last_task_complete_message,
        message_declares_archive_ready,
        next_steps_has_multiple_options,
        next_steps_mentions_recommendation,
    )
except ModuleNotFoundError:
    from hook_context import update_hook_context_pointer
    from hook_common import (
        build_context,
        extract_next_steps_block,
        load_last_task_complete_message,
        message_declares_archive_ready,
        next_steps_has_multiple_options,
        next_steps_mentions_recommendation,
    )


NONTERMINAL_DECISIONS = {"relaunch"}
CONTINUATION_PROMPT = (
    "Continue the current managed run.\n"
    "Do not rerun the wizard.\n"
    "If you just completed an experiment, record it before starting the next one.\n"
    "Honor keep/stop label gates, iteration limits, and duration limits before stopping.\n"
    "Do not ask the user for permission.\n"
    "Only stop when your final response no longer contains a `Next step:` or `Next steps:` section."
)
FOLLOWUP_CONTINUATION_PROMPT = (
    "Continue the current managed run.\n"
    "You are already inside a stop-hook continuation.\n"
    "Do not stop yet; record the last experiment before the next one.\n"
    "Do not ask the user for permission.\n"
    "Only stop when your final response no longer contains a `Next step:` or `Next steps:` section."
)
GITHUB_REMOTE_PATTERN = re.compile(r"github\.com[:/](?P<owner>[^/]+)/(?P<repo>[^/.]+?)(?:\.git)?$")


def run_supervisor(context) -> dict[str, object] | None:
    if context.skill_root is None:
        return None
    helper = context.skill_root / "scripts" / "autoresearch_supervisor_status.py"
    command = [
        sys.executable,
        str(helper),
        "--results-path",
        str(context.artifacts.results_path),
    ]
    if context.artifacts.state_path is not None:
        command.extend(["--state-path", str(context.artifacts.state_path)])
    completed = subprocess.run(
        command,
        capture_output=True,
        text=True,
        cwd=context.repo,
    )
    if completed.returncode != 0:
        return None
    try:
        payload = json.loads(completed.stdout)
    except json.JSONDecodeError:
        return None
    return payload if isinstance(payload, dict) else None


def emit_block(reason: str) -> None:
    payload = {
        "decision": "block",
        "reason": reason,
    }
    print(json.dumps(payload), end="")


def run_capture(command: list[str], *, cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        capture_output=True,
        text=True,
        cwd=cwd,
    )


def git_output(repo: Path, *args: str) -> str | None:
    completed = run_capture(["git", *args], cwd=repo)
    if completed.returncode != 0:
        return None
    return completed.stdout.strip()


def git_status_entries(repo: Path) -> list[str]:
    output = git_output(repo, "status", "--short", "--untracked-files=normal")
    if output is None:
        return []
    return [line for line in output.splitlines() if line.strip()]


def current_branch_name(repo: Path) -> str | None:
    branch = git_output(repo, "rev-parse", "--abbrev-ref", "HEAD")
    if not branch or branch == "HEAD":
        return branch
    return branch


def default_branch_name(repo: Path) -> str:
    symbolic = git_output(repo, "symbolic-ref", "refs/remotes/origin/HEAD")
    if symbolic and "/" in symbolic:
        return symbolic.rsplit("/", 1)[-1]
    return "main"


def branch_has_upstream(repo: Path) -> bool:
    return git_output(repo, "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}") is not None


def ahead_of_upstream_count(repo: Path) -> int | None:
    counts = git_output(repo, "rev-list", "--left-right", "--count", "@{u}...HEAD")
    if counts is None:
        return None
    parts = counts.split()
    if len(parts) != 2:
        return None
    try:
        return int(parts[1])
    except ValueError:
        return None


def github_repo_name(repo: Path) -> str | None:
    remote = git_output(repo, "remote", "get-url", "origin")
    if not remote:
        return None
    match = GITHUB_REMOTE_PATTERN.search(remote)
    if match is None:
        return None
    return f"{match.group('owner')}/{match.group('repo')}"


def gh_available() -> bool:
    return run_capture(["gh", "--version"], cwd=Path.cwd()).returncode == 0


def gh_authenticated() -> bool:
    return run_capture(["gh", "auth", "status"], cwd=Path.cwd()).returncode == 0


def branch_has_open_or_merged_pr(repo: Path, repo_name: str) -> bool | None:
    if not gh_available() or not gh_authenticated():
        return None
    completed = run_capture(
        ["gh", "pr", "view", "--repo", repo_name, "--json", "state,mergedAt,url"],
        cwd=repo,
    )
    if completed.returncode != 0:
        return False
    try:
        payload = json.loads(completed.stdout)
    except json.JSONDecodeError:
        return None
    if not isinstance(payload, dict):
        return None
    merged_at = payload.get("mergedAt")
    state = payload.get("state")
    return bool(merged_at) or state == "OPEN"


def archive_readiness_blockers(context) -> list[str]:
    repo = context.repo
    blockers: list[str] = []

    dirty_entries = git_status_entries(repo)
    if dirty_entries:
        sample = "; ".join(dirty_entries[:5])
        if len(dirty_entries) > 5:
            sample += "; ..."
        blockers.append(
            "Working tree still has uncommitted changes. Commit or discard them before marking the thread archive-ready."
            + f" Current status: {sample}"
        )

    branch = current_branch_name(repo)
    if branch == "HEAD":
        blockers.append("Repository is on a detached HEAD. Create or switch to a branch, then push and open a PR before archiving.")
        return blockers
    if branch is None:
        return blockers

    default_branch = default_branch_name(repo)
    if branch != default_branch:
        if not branch_has_upstream(repo):
            blockers.append(f"Branch `{branch}` has no upstream on origin. Push it before marking the thread archive-ready.")
        else:
            ahead = ahead_of_upstream_count(repo)
            if ahead is None:
                blockers.append(f"Could not verify whether branch `{branch}` is fully pushed. Push it before marking the thread archive-ready.")
            elif ahead > 0:
                blockers.append(f"Branch `{branch}` still has {ahead} unpushed commit(s). Push it before marking the thread archive-ready.")

        repo_name = github_repo_name(repo)
        if repo_name is not None:
            pr_ready = branch_has_open_or_merged_pr(repo, repo_name)
            if pr_ready is False:
                blockers.append(f"Branch `{branch}` does not have an open or merged GitHub pull request yet. Open one before marking the thread archive-ready.")
            elif pr_ready is None:
                blockers.append(f"Could not verify GitHub PR status for branch `{branch}`. Verify or open the PR before marking the thread archive-ready.")
    else:
        if branch_has_upstream(repo):
            ahead = ahead_of_upstream_count(repo)
            if ahead is not None and ahead > 0:
                blockers.append(f"Default branch `{branch}` still has {ahead} unpushed commit(s). Push them before marking the thread archive-ready.")

    return blockers


def build_archive_guard_prompt(blockers: list[str]) -> str:
    lines = [
        "Do not mark the thread archive-ready yet.",
        "Resolve the publication and cleanup blockers below before using `**THREAD COMPLETE. READY FOR ARCHIVE.**`.",
        "Do not ask the user for permission if you can resolve them directly.",
        "",
        "Archive blockers:",
    ]
    lines.extend(f"- {blocker}" for blocker in blockers)
    lines.extend(
        [
            "",
            "When finished, verify the working tree is clean, the branch is pushed, and the work is PR'd when you are on a non-default branch.",
        ]
    )
    return "\n".join(lines)


def build_continuation_prompt(next_steps: str | None, *, followup: bool) -> str:
    lines = [FOLLOWUP_CONTINUATION_PROMPT if followup else CONTINUATION_PROMPT]
    if not isinstance(next_steps, str) or not next_steps.strip():
        return "\n".join(lines)

    if next_steps_has_multiple_options(next_steps):
        if next_steps_mentions_recommendation(next_steps):
            lines.append("Take the recommended option from the final `Next steps:` section and continue.")
        else:
            lines.append("Choose the strongest default option from the final `Next steps:` section and continue.")
    else:
        lines.append("Continue with the final `Next step:` below.")

    lines.extend(
        [
            "",
            "Final next step(s):",
            next_steps,
        ]
    )
    return "\n".join(lines)


def main() -> int:
    context = build_context(__file__)
    if context is None or context.skill_root is None:
        return 0
    if not context.session_is_managed:
        return 0
    if not context.has_active_artifacts:
        return 0

    supervisor = run_supervisor(context)
    if supervisor is None:
        return 0

    decision = supervisor.get("decision")
    if not isinstance(decision, str):
        return 0

    last_message = load_last_task_complete_message(context.transcript_path)
    if message_declares_archive_ready(last_message):
        blockers = archive_readiness_blockers(context)
        if blockers:
            emit_block(build_archive_guard_prompt(blockers))
            return 0

    if decision in NONTERMINAL_DECISIONS:
        active = bool(context.payload.get("stop_hook_active"))
        next_steps = extract_next_steps_block(last_message)
        emit_block(build_continuation_prompt(next_steps, followup=active))
    else:
        update_hook_context_pointer(
            repo=context.repo,
            active=False,
            session_mode="background" if context.opt_in_env else "foreground",
            results_path=context.artifacts.results_path,
            state_path=context.artifacts.state_path,
            launch_path=context.artifacts.launch_path,
            runtime_path=context.artifacts.runtime_path,
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
