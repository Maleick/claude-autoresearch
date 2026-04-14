from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    from scripts.hook_context import load_hook_context_pointer
except ModuleNotFoundError:
    from hook_context import load_hook_context_pointer


RESULTS_HEADER_PREFIX = "timestamp\titeration\tdecision\t"
MANAGED_SESSION_MARKERS = (
    "$codex-autoresearch",
    "This repo is managed by the autoresearch runtime controller.",
)
ACTIVE_ENV_NAMES = ("HOOK_RUNTIME_ACTIVE", "AUTORESEARCH_HOOK_ACTIVE")
RESULTS_PATH_ENV_NAMES = ("HOOK_RUNTIME_RESULTS_PATH", "AUTORESEARCH_HOOK_RESULTS_PATH")
STATE_PATH_ENV_NAMES = ("HOOK_RUNTIME_STATE_PATH", "AUTORESEARCH_HOOK_STATE_PATH")
LAUNCH_PATH_ENV_NAMES = ("HOOK_RUNTIME_LAUNCH_PATH", "AUTORESEARCH_HOOK_LAUNCH_PATH")
RUNTIME_PATH_ENV_NAMES = ("HOOK_RUNTIME_PATH", "AUTORESEARCH_HOOK_RUNTIME_PATH")
NEXT_STEP_INLINE_PATTERN = re.compile(r"^\s*next steps?\s*:\s*(?P<body>\S.*)\s*$", re.IGNORECASE)
NEXT_STEP_HEADING_PATTERN = re.compile(r"^\s*next steps?\s*:\s*$", re.IGNORECASE)
OPTION_LINE_PATTERN = re.compile(r"^\s*(?:[-*+]|\d+\.)\s+")
RECOMMENDED_PATTERN = re.compile(r"recommended", re.IGNORECASE)
SECTION_HEADER_PATTERN = re.compile(r"^\s*(?:#{1,6}\s+\S|\*\*[^*].*?\*\*)\s*$")
ARCHIVE_READY_PATTERN = re.compile(r"^\s*\*\*THREAD COMPLETE\. READY FOR ARCHIVE\.\*\*\s*$")


@dataclass(frozen=True)
class ManagedArtifactPaths:
    results_path: Path
    state_path: Path | None
    launch_path: Path | None
    runtime_path: Path | None


@dataclass(frozen=True)
class ManagedHookContext:
    payload: dict[str, object]
    cwd: Path
    repo: Path
    skill_root: Path | None
    artifacts: ManagedArtifactPaths
    opt_in_env: bool
    transcript_marked: bool
    pointer_active: bool | None
    transcript_path: Path | None

    @property
    def session_is_managed(self) -> bool:
        return self.opt_in_env or self.transcript_marked or self.pointer_active is True

    @property
    def has_active_artifacts(self) -> bool:
        if self.pointer_active is False and not self.opt_in_env:
            return False
        paths = self.artifacts
        if paths.launch_path is not None and paths.launch_path.exists():
            return True
        if paths.runtime_path is not None and paths.runtime_path.exists():
            return True
        if paths.state_path is not None and paths.state_path.exists():
            return True
        return results_log_looks_managed(paths.results_path)

    @property
    def session_is_autoresearch(self) -> bool:
        return self.session_is_managed


def load_input() -> dict[str, object]:
    raw = sys.stdin.read().strip()
    if not raw:
        return {}
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return {}
    return payload if isinstance(payload, dict) else {}


def manifest_path(script_path: str | Path) -> Path:
    return Path(script_path).resolve().with_name("manifest.json")


def load_manifest(script_path: str | Path) -> dict[str, object]:
    path = manifest_path(script_path)
    if not path.exists():
        return {}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return payload if isinstance(payload, dict) else {}


def resolve_git_repo(cwd: Path) -> Path | None:
    completed = subprocess.run(
        ["git", "-C", str(cwd), "rev-parse", "--show-toplevel"],
        capture_output=True,
        text=True,
    )
    if completed.returncode != 0:
        return None
    repo = Path(completed.stdout.strip())
    return repo if repo.exists() else None


def resolve_repo(cwd: Path) -> Path:
    repo = resolve_git_repo(cwd)
    if repo is not None:
        return repo
    return cwd


def resolve_repo_relative(repo: Path, raw: str | None, default_name: str) -> Path:
    candidate = Path(raw) if raw else Path(default_name)
    if not candidate.is_absolute():
        candidate = repo / candidate
    return candidate.expanduser().resolve()


def results_log_looks_managed(results_path: Path) -> bool:
    if not results_path.exists():
        return False
    try:
        lines = results_path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return False
    for line in lines[:20]:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        return stripped.startswith(RESULTS_HEADER_PREFIX)
    return False


def valid_skill_root(path: Path | None) -> Path | None:
    if path is None:
        return None
    resolved = path.expanduser().resolve()
    if not resolved.exists():
        return None
    if not (resolved / "SKILL.md").exists():
        return None
    helper = resolved / "scripts" / "autoresearch_supervisor_status.py"
    if not helper.exists():
        return None
    return resolved


def resolve_skill_root(cwd: Path, repo: Path, manifest: dict[str, object]) -> Path | None:
    for candidate in (repo, cwd, *cwd.parents):
        resolved = valid_skill_root(candidate)
        if resolved is not None:
            return resolved
    fallback = manifest.get("skill_root_fallback")
    if isinstance(fallback, str):
        return valid_skill_root(Path(fallback))
    return None


def env_value(names: tuple[str, ...]) -> str | None:
    for name in names:
        value = os.environ.get(name)
        if value is not None and value.strip():
            return value
    return None


def env_truthy(names: tuple[str, ...]) -> bool:
    value = env_value(names)
    return isinstance(value, str) and value.strip().lower() in {"1", "true", "yes", "on", "enabled"}


def _coalesce_path(
    *,
    repo: Path,
    env_names: tuple[str, ...],
    pointer_path: Path | None,
    default_name: str,
) -> Path:
    raw = env_value(env_names)
    if raw:
        return resolve_repo_relative(repo, raw, default_name)
    if pointer_path is not None:
        return pointer_path
    return resolve_repo_relative(repo, None, default_name)


def resolve_artifact_paths(repo: Path) -> tuple[ManagedArtifactPaths, bool | None]:
    pointer = load_hook_context_pointer(repo)
    return ManagedArtifactPaths(
        results_path=_coalesce_path(
            repo=repo,
            env_names=RESULTS_PATH_ENV_NAMES,
            pointer_path=pointer.results_path if pointer is not None else None,
            default_name="research-results.tsv",
        ),
        state_path=_coalesce_path(
            repo=repo,
            env_names=STATE_PATH_ENV_NAMES,
            pointer_path=pointer.state_path if pointer is not None else None,
            default_name="autoresearch-state.json",
        ),
        launch_path=_coalesce_path(
            repo=repo,
            env_names=LAUNCH_PATH_ENV_NAMES,
            pointer_path=pointer.launch_path if pointer is not None else None,
            default_name="autoresearch-launch.json",
        ),
        runtime_path=_coalesce_path(
            repo=repo,
            env_names=RUNTIME_PATH_ENV_NAMES,
            pointer_path=pointer.runtime_path if pointer is not None else None,
            default_name="autoresearch-runtime.json",
        ),
    ), (pointer.active if pointer is not None else None)


def payload_transcript_path(payload: dict[str, object]) -> Path | None:
    raw = payload.get("transcript_path")
    if not isinstance(raw, str) or not raw.strip():
        return None
    return Path(raw).expanduser().resolve()


def iter_text_fields(value: Any) -> list[str]:
    found: list[str] = []
    if isinstance(value, dict):
        for key, item in value.items():
            if key == "text" and isinstance(item, str):
                found.append(item)
            else:
                found.extend(iter_text_fields(item))
    elif isinstance(value, list):
        for item in value:
            found.extend(iter_text_fields(item))
    return found


def transcript_indicates_managed_session(transcript_path: Path | None) -> bool:
    if transcript_path is None or not transcript_path.exists():
        return False
    try:
        with transcript_path.open("r", encoding="utf-8", errors="ignore") as handle:
            for raw_line in handle:
                line = raw_line.strip()
                if not line:
                    continue
                try:
                    payload = json.loads(line)
                except json.JSONDecodeError:
                    continue
                for text in iter_text_fields(payload):
                    stripped = text.lstrip()
                    if any(stripped.startswith(marker) for marker in MANAGED_SESSION_MARKERS):
                        return True
    except OSError:
        return False
    return False


def load_last_task_complete_message(transcript_path: Path | None) -> str | None:
    if transcript_path is None or not transcript_path.exists():
        return None
    try:
        lines = transcript_path.read_text(encoding="utf-8", errors="ignore").splitlines()
    except OSError:
        return None

    for raw_line in reversed(lines):
        if not raw_line.strip():
            continue
        try:
            payload = json.loads(raw_line)
        except json.JSONDecodeError:
            continue
        if payload.get("type") != "event_msg":
            continue
        event_payload = payload.get("payload")
        if not isinstance(event_payload, dict):
            continue
        if event_payload.get("type") != "task_complete":
            continue
        message = event_payload.get("last_agent_message")
        if isinstance(message, str) and message.strip():
            return message.strip()
    return None


def extract_next_steps_block(message: str | None) -> str | None:
    if not isinstance(message, str) or not message.strip():
        return None

    lines = message.splitlines()
    start = None
    for index, line in enumerate(lines):
        inline_match = NEXT_STEP_INLINE_PATTERN.match(line)
        if inline_match is not None:
            return inline_match.group("body").strip()
        if NEXT_STEP_HEADING_PATTERN.match(line):
            start = index + 1
            break
    if start is None:
        return None

    collected: list[str] = []
    blank_run = 0
    for line in lines[start:]:
        if ARCHIVE_READY_PATTERN.match(line):
            break
        if collected and SECTION_HEADER_PATTERN.match(line):
            break
        if not line.strip():
            blank_run += 1
            if collected and blank_run >= 2:
                break
            if collected:
                collected.append("")
            continue
        if collected and blank_run and not OPTION_LINE_PATTERN.match(line) and line == line.lstrip():
            break
        blank_run = 0
        collected.append(line.rstrip())

    body = "\n".join(collected).strip()
    return body or None


def next_steps_has_multiple_options(next_steps: str | None) -> bool:
    if not isinstance(next_steps, str) or not next_steps.strip():
        return False
    option_lines = [line for line in next_steps.splitlines() if OPTION_LINE_PATTERN.match(line)]
    if len(option_lines) >= 2:
        return True
    lowered = next_steps.lower()
    return "option 1" in lowered or "option a" in lowered or "\nor\n" in lowered


def next_steps_mentions_recommendation(next_steps: str | None) -> bool:
    if not isinstance(next_steps, str):
        return False
    return bool(RECOMMENDED_PATTERN.search(next_steps))


def message_declares_archive_ready(message: str | None) -> bool:
    if not isinstance(message, str) or not message.strip():
        return False
    return any(ARCHIVE_READY_PATTERN.match(line) for line in message.splitlines())


def build_context(script_path: str | Path) -> ManagedHookContext | None:
    payload = load_input()
    cwd_value = payload.get("cwd")
    if not isinstance(cwd_value, str) or not cwd_value:
        return None

    cwd = Path(cwd_value).expanduser().resolve()
    manifest = load_manifest(script_path)
    repo = resolve_repo(cwd)
    transcript_path = payload_transcript_path(payload)
    artifacts, pointer_active = resolve_artifact_paths(repo)

    return ManagedHookContext(
        payload=payload,
        cwd=cwd,
        repo=repo,
        skill_root=resolve_skill_root(cwd, repo, manifest),
        artifacts=artifacts,
        opt_in_env=env_truthy(ACTIVE_ENV_NAMES),
        transcript_marked=transcript_indicates_managed_session(transcript_path),
        pointer_active=pointer_active,
        transcript_path=transcript_path,
    )


HookArtifactPaths = ManagedArtifactPaths
HookContext = ManagedHookContext
results_log_looks_autoresearch = results_log_looks_managed
transcript_indicates_autoresearch_session = transcript_indicates_managed_session
