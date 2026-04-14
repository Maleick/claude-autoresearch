from __future__ import annotations

import json
import tempfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

HOOK_POINTER_VERSION = 1
HOOK_POINTER_NAME = "autoresearch-hook-context.json"
SESSION_MODE_CHOICES = ("foreground", "background")
UNSET = object()


@dataclass(frozen=True)
class HookRuntimePointer:
    version: int
    active: bool
    session_mode: str | None
    results_path: Path | None
    state_path: Path | None
    launch_path: Path | None
    runtime_path: Path | None
    updated_at: str | None


class HookRuntimeError(Exception):
    pass


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def write_json_atomic(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        "w",
        encoding="utf-8",
        dir=path.parent,
        prefix=f".{path.name}.",
        suffix=".tmp",
        delete=False,
    ) as handle:
        json.dump(payload, handle, indent=2)
        handle.write("\n")
        temp_path = Path(handle.name)
    temp_path.replace(path)


def find_repo_root(start: Path | None = None) -> Path:
    current = Path(start or Path.cwd()).expanduser().resolve()
    for candidate in (current, *current.parents):
        if (candidate / ".git").exists():
            return candidate
    return current


def default_hook_runtime_path(cwd: Path | None = None) -> Path:
    return find_repo_root(cwd) / HOOK_POINTER_NAME


def _normalize_repo(repo: Path | None) -> Path:
    return find_repo_root(repo or Path.cwd()).resolve()


def _path_within_repo(repo: Path, path: Path) -> bool:
    try:
        path.relative_to(repo)
        return True
    except ValueError:
        return False


def serialize_pointer_path(repo: Path, path: Path | None) -> str | None:
    if path is None:
        return None
    resolved = path.expanduser().resolve()
    if _path_within_repo(repo, resolved):
        return resolved.relative_to(repo).as_posix()
    return str(resolved)


def deserialize_pointer_path(repo: Path, raw: Any) -> Path | None:
    if raw in (None, ""):
        return None
    if not isinstance(raw, str):
        raise HookRuntimeError(f"Invalid hook context path: {raw!r}")
    candidate = Path(raw).expanduser()
    if not candidate.is_absolute():
        candidate = repo / candidate
    return candidate.resolve()


def pointer_payload(
    *,
    repo: Path,
    active: bool,
    session_mode: str | None,
    results_path: Path | None,
    state_path: Path | None,
    launch_path: Path | None,
    runtime_path: Path | None,
    updated_at: str | None = None,
) -> dict[str, Any]:
    if session_mode is not None and session_mode not in SESSION_MODE_CHOICES:
        raise HookRuntimeError(f"Unsupported session mode for hook context: {session_mode}")
    normalized_repo = _normalize_repo(repo)
    return {
        "version": HOOK_POINTER_VERSION,
        "active": bool(active),
        "session_mode": session_mode,
        "results_path": serialize_pointer_path(normalized_repo, results_path),
        "state_path": serialize_pointer_path(normalized_repo, state_path),
        "launch_path": serialize_pointer_path(normalized_repo, launch_path),
        "runtime_path": serialize_pointer_path(normalized_repo, runtime_path),
        "updated_at": updated_at or utc_now(),
    }


def write_hook_context_pointer(
    *,
    repo: Path,
    active: bool,
    session_mode: str | None,
    results_path: Path | None,
    state_path: Path | None,
    launch_path: Path | None,
    runtime_path: Path | None,
    updated_at: str | None = None,
) -> Path:
    normalized_repo = _normalize_repo(repo)
    path = default_hook_runtime_path(normalized_repo)
    payload = pointer_payload(
        repo=normalized_repo,
        active=active,
        session_mode=session_mode,
        results_path=results_path,
        state_path=state_path,
        launch_path=launch_path,
        runtime_path=runtime_path,
        updated_at=updated_at,
    )
    write_json_atomic(path, payload)
    return path


def load_hook_context_pointer(repo: Path | None) -> HookRuntimePointer | None:
    normalized_repo = _normalize_repo(repo)
    path = default_hook_runtime_path(normalized_repo)
    if not path.exists():
        return None
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    if not isinstance(payload, dict):
        return None
    if payload.get("version") != HOOK_POINTER_VERSION:
        return None
    active = payload.get("active")
    if not isinstance(active, bool):
        return None
    session_mode = payload.get("session_mode")
    if session_mode is not None and session_mode not in SESSION_MODE_CHOICES:
        return None
    try:
        return HookRuntimePointer(
            version=HOOK_POINTER_VERSION,
            active=active,
            session_mode=session_mode,
            results_path=deserialize_pointer_path(normalized_repo, payload.get("results_path")),
            state_path=deserialize_pointer_path(normalized_repo, payload.get("state_path")),
            launch_path=deserialize_pointer_path(normalized_repo, payload.get("launch_path")),
            runtime_path=deserialize_pointer_path(normalized_repo, payload.get("runtime_path")),
            updated_at=payload.get("updated_at") if isinstance(payload.get("updated_at"), str) else None,
        )
    except HookRuntimeError:
        return None


def update_hook_context_pointer(
    *,
    repo: Path,
    active: bool | object = UNSET,
    session_mode: str | None | object = UNSET,
    results_path: Path | None | object = UNSET,
    state_path: Path | None | object = UNSET,
    launch_path: Path | None | object = UNSET,
    runtime_path: Path | None | object = UNSET,
) -> Path:
    normalized_repo = _normalize_repo(repo)
    existing = load_hook_context_pointer(normalized_repo)
    resolved_active = existing.active if existing is not None else True
    resolved_session_mode = existing.session_mode if existing is not None else None
    resolved_results = existing.results_path if existing is not None else None
    resolved_state = existing.state_path if existing is not None else None
    resolved_launch = existing.launch_path if existing is not None else None
    resolved_runtime = existing.runtime_path if existing is not None else None

    if active is not UNSET:
        resolved_active = bool(active)
    if session_mode is not UNSET:
        resolved_session_mode = session_mode
    if results_path is not UNSET:
        resolved_results = results_path
    if state_path is not UNSET:
        resolved_state = state_path
    if launch_path is not UNSET:
        resolved_launch = launch_path
    if runtime_path is not UNSET:
        resolved_runtime = runtime_path

    return write_hook_context_pointer(
        repo=normalized_repo,
        active=resolved_active,
        session_mode=resolved_session_mode,
        results_path=resolved_results,
        state_path=resolved_state,
        launch_path=resolved_launch,
        runtime_path=resolved_runtime,
    )


HookContextPointer = HookRuntimePointer
HookContextError = HookRuntimeError
default_hook_context_path = default_hook_runtime_path
