#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


PLUGIN_NAME = "codex-autoresearch"
MARKETPLACE_PATH = "./plugins/codex-autoresearch"


class DistributionError(RuntimeError):
    pass


def load_json(path: Path) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise DistributionError(f"Invalid JSON file: {path}") from exc
    if not isinstance(payload, dict):
        raise DistributionError(f"Expected a JSON object in {path}")
    return payload


def resolve_repo_root(value: str | None) -> Path:
    return Path(value).expanduser().resolve() if value else Path.cwd().resolve()


def relative_files(root: Path, pattern: str) -> list[Path]:
    return sorted(path.relative_to(root) for path in root.glob(pattern) if path.is_file())


def ensure_matching_files(source_root: Path, bundled_root: Path, pattern: str) -> list[str]:
    source_files = relative_files(source_root, pattern)
    bundled_files = relative_files(bundled_root, pattern)
    if source_files != bundled_files:
        raise DistributionError(
            f"File mismatch for pattern {pattern!r}: source={source_files}, bundled={bundled_files}"
        )
    mismatched = [
        str(rel_path)
        for rel_path in source_files
        if (source_root / rel_path).read_bytes() != (bundled_root / rel_path).read_bytes()
    ]
    if mismatched:
        raise DistributionError(
            f"Bundled payload diverges from root sources for pattern {pattern!r}: {', '.join(mismatched)}"
        )
    return [str(rel_path) for rel_path in source_files]


def resolve_plugin_relative_path(plugin_root: Path, value: str) -> Path:
    rel_path = Path(value)
    if rel_path.is_absolute():
        raise DistributionError(f"Plugin manifest path must be relative: {value}")
    if value.startswith("./"):
        rel_path = Path(value[2:])
    return (plugin_root / rel_path).resolve()


def require_existing_path(plugin_root: Path, value: str, *, field_name: str) -> str:
    path = resolve_plugin_relative_path(plugin_root, value)
    if not path.exists():
        raise DistributionError(f"{field_name} points to a missing path: {value}")
    return str(path)


def validate_distribution(repo_root: Path) -> dict[str, Any]:
    plugin_root = repo_root / "plugins" / PLUGIN_NAME
    plugin_manifest_path = plugin_root / ".codex-plugin" / "plugin.json"
    plugin_skill_root = plugin_root / "skills" / PLUGIN_NAME
    marketplace_path = repo_root / ".agents" / "plugins" / "marketplace.json"

    plugin_manifest = load_json(plugin_manifest_path)
    if plugin_manifest.get("name") != PLUGIN_NAME:
        raise DistributionError(f"Unexpected plugin name in {plugin_manifest_path}")
    skills_value = plugin_manifest.get("skills")
    if not isinstance(skills_value, str) or not skills_value.strip():
        raise DistributionError("Plugin manifest is missing a valid skills path")
    skills_path = require_existing_path(plugin_root, skills_value, field_name="skills")

    interface = plugin_manifest.get("interface")
    if not isinstance(interface, dict):
        raise DistributionError("Plugin manifest is missing interface metadata")
    for field_name in ("displayName", "shortDescription"):
        value = interface.get(field_name)
        if not isinstance(value, str) or not value.strip():
            raise DistributionError(f"Plugin manifest interface.{field_name} must be a non-empty string")

    auxiliary_manifests: dict[str, dict[str, Any]] = {}
    for field_name in ("mcpServers", "apps"):
        rel_path = plugin_manifest.get(field_name)
        if rel_path is None:
            continue
        if not isinstance(rel_path, str) or not rel_path.strip():
            raise DistributionError(f"Plugin manifest contains an invalid {field_name} path")
        manifest_path = resolve_plugin_relative_path(plugin_root, rel_path)
        payload = load_json(manifest_path)
        auxiliary_manifests[field_name] = {
            "path": str(manifest_path),
            "keys": sorted(payload.keys()),
        }

    asset_paths: dict[str, Any] = {}
    for field_name in ("composerIcon", "logo"):
        value = interface.get(field_name)
        if value is None:
            continue
        if not isinstance(value, str) or not value.strip():
            raise DistributionError(f"Plugin manifest interface.{field_name} must be a non-empty string")
        asset_paths[field_name] = require_existing_path(
            plugin_root,
            value,
            field_name=f"interface.{field_name}",
        )
    screenshots = interface.get("screenshots")
    if screenshots is not None:
        if not isinstance(screenshots, list):
            raise DistributionError("Plugin manifest interface.screenshots must be a list when present")
        asset_paths["screenshots"] = [
            require_existing_path(plugin_root, value, field_name="interface.screenshots")
            for value in screenshots
        ]

    mirrored = {
        "skill": str(repo_root / "SKILL.md"),
        "agents": ensure_matching_files(repo_root / "agents", plugin_skill_root / "agents", "*.yaml"),
        "scripts": ensure_matching_files(repo_root / "scripts", plugin_skill_root / "scripts", "*.py"),
        "references": ensure_matching_files(
            repo_root / "references",
            plugin_skill_root / "references",
            "*.md",
        ),
    }
    if (repo_root / "SKILL.md").read_bytes() != (plugin_skill_root / "SKILL.md").read_bytes():
        raise DistributionError("Bundled SKILL.md diverges from root SKILL.md")

    marketplace_payload = load_json(marketplace_path)
    interface_payload = marketplace_payload.get("interface")
    if not isinstance(interface_payload, dict):
        raise DistributionError("Marketplace manifest must include interface metadata")
    display_name = interface_payload.get("displayName")
    if not isinstance(display_name, str) or not display_name.strip():
        raise DistributionError("Marketplace interface.displayName must be a non-empty string")
    plugins = marketplace_payload.get("plugins")
    if not isinstance(plugins, list):
        raise DistributionError("Marketplace manifest must contain a plugins list")
    marketplace_entry = next(
        (
            entry
            for entry in plugins
            if isinstance(entry, dict) and entry.get("name") == PLUGIN_NAME
        ),
        None,
    )
    if marketplace_entry is None:
        raise DistributionError(f"Missing marketplace entry for {PLUGIN_NAME}")
    source = marketplace_entry.get("source")
    if source != {
        "source": "local",
        "path": MARKETPLACE_PATH,
    }:
        raise DistributionError(f"Unexpected marketplace source for {PLUGIN_NAME}: {source!r}")
    policy = marketplace_entry.get("policy")
    if not isinstance(policy, dict):
        raise DistributionError("Marketplace entry must include a policy object")
    installation = policy.get("installation")
    authentication = policy.get("authentication")
    if not isinstance(installation, str) or not installation.strip():
        raise DistributionError("Marketplace policy.installation must be a non-empty string")
    if not isinstance(authentication, str) or not authentication.strip():
        raise DistributionError("Marketplace policy.authentication must be a non-empty string")
    category = marketplace_entry.get("category")
    if not isinstance(category, str) or not category.strip():
        raise DistributionError("Marketplace entry category must be a non-empty string")

    return {
        "repo_root": str(repo_root),
        "plugin_manifest": str(plugin_manifest_path),
        "skills_path": skills_path,
        "auxiliary_manifests": auxiliary_manifests,
        "asset_paths": asset_paths,
        "mirrored": mirrored,
        "marketplace_entry": marketplace_entry,
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Validate the root-to-plugin packaging surface for codex-autoresearch."
    )
    parser.add_argument(
        "--repo",
        help="Repository root. Defaults to the current working directory.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    payload = validate_distribution(resolve_repo_root(args.repo))
    print(json.dumps(payload, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except DistributionError as exc:
        raise SystemExit(f"error: {exc}")
