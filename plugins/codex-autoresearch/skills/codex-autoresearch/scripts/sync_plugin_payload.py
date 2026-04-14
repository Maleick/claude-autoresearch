#!/usr/bin/env python3
from __future__ import annotations

import argparse
import shutil
from pathlib import Path


PLUGIN_NAME = "codex-autoresearch"
MIRRORED_DIRECTORIES = {
    "agents": "*.yaml",
    "scripts": "*.py",
    "references": "*.md",
}


class SyncError(RuntimeError):
    pass


def resolve_repo_root(value: str | None) -> Path:
    return Path(value).expanduser().resolve() if value else Path.cwd().resolve()


def plugin_skill_root(repo_root: Path) -> Path:
    return repo_root / "plugins" / PLUGIN_NAME / "skills" / PLUGIN_NAME


def relative_files(root: Path, pattern: str) -> list[Path]:
    if not root.is_dir():
        raise SyncError(f"Missing source directory: {root}")
    return sorted(path.relative_to(root) for path in root.glob(pattern) if path.is_file())


def bundled_relative_files(root: Path, pattern: str) -> list[Path]:
    if not root.exists():
        return []
    return sorted(path.relative_to(root) for path in root.glob(pattern) if path.is_file())


def collect_drift(repo_root: Path) -> list[str]:
    skill_root = plugin_skill_root(repo_root)
    source_skill = repo_root / "SKILL.md"
    bundled_skill = skill_root / "SKILL.md"
    drift: list[str] = []

    if not source_skill.is_file():
        raise SyncError(f"Missing source file: {source_skill}")
    if not bundled_skill.is_file():
        drift.append(f"Missing bundled file: {bundled_skill}")
    elif source_skill.read_bytes() != bundled_skill.read_bytes():
        drift.append("Bundled SKILL.md differs from root SKILL.md")

    for directory_name, pattern in MIRRORED_DIRECTORIES.items():
        source_root = repo_root / directory_name
        bundled_root = skill_root / directory_name
        source_files = relative_files(source_root, pattern)
        bundled_files = bundled_relative_files(bundled_root, pattern)

        if source_files != bundled_files:
            drift.append(
                f"File mismatch for {directory_name}: "
                f"source={[str(path) for path in source_files]}, "
                f"bundled={[str(path) for path in bundled_files]}"
            )

        for rel_path in source_files:
            if rel_path not in bundled_files:
                continue
            if (source_root / rel_path).read_bytes() != (bundled_root / rel_path).read_bytes():
                drift.append(f"Bundled {directory_name}/{rel_path} differs from root source")

    return drift


def copy_directory(source_root: Path, bundled_root: Path, pattern: str) -> list[str]:
    files = relative_files(source_root, pattern)
    if bundled_root.exists():
        shutil.rmtree(bundled_root)
    bundled_root.mkdir(parents=True, exist_ok=True)

    for rel_path in files:
        target_path = bundled_root / rel_path
        target_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_root / rel_path, target_path)

    return [str(rel_path) for rel_path in files]


def sync_payload(repo_root: Path) -> dict[str, object]:
    plugin_root = repo_root / "plugins" / PLUGIN_NAME
    manifest_path = plugin_root / ".codex-plugin" / "plugin.json"
    skill_root = plugin_skill_root(repo_root)
    source_skill = repo_root / "SKILL.md"

    if not manifest_path.is_file():
        raise SyncError(f"Missing plugin manifest: {manifest_path}")
    if not source_skill.is_file():
        raise SyncError(f"Missing source file: {source_skill}")

    skill_root.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source_skill, skill_root / "SKILL.md")

    copied: dict[str, object] = {
        "skill_root": str(skill_root),
        "SKILL.md": "copied",
    }
    for directory_name, pattern in MIRRORED_DIRECTORIES.items():
        copied[directory_name] = copy_directory(
            repo_root / directory_name,
            skill_root / directory_name,
            pattern,
        )
    return copied


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Mirror root skill sources into the packaged plugin payload."
    )
    parser.add_argument(
        "--repo",
        help="Repository root. Defaults to the current working directory.",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Report drift without modifying the packaged plugin payload.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    repo_root = resolve_repo_root(args.repo)

    if args.check:
        drift = collect_drift(repo_root)
        if drift:
            for item in drift:
                print(f"drift: {item}")
            return 1
        print("Bundled plugin payload is in sync with root sources.")
        return 0

    copied = sync_payload(repo_root)
    print(f"Synced plugin payload at {copied['skill_root']}")
    print("Copied SKILL.md")
    for directory_name in MIRRORED_DIRECTORIES:
        entries = copied[directory_name]
        print(f"Copied {len(entries)} files for {directory_name}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SyncError as exc:
        raise SystemExit(f"error: {exc}")
