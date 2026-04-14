#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import json
import os
import shutil
from pathlib import Path
from typing import Any

try:
    from scripts.sync_plugin_payload import sync_payload
except ModuleNotFoundError:  # pragma: no cover - direct script execution path
    from sync_plugin_payload import sync_payload


PLUGIN_NAME = "codex-autoresearch"
DEFAULT_MARKETPLACE_NAME = "local-plugins"
DEFAULT_MARKETPLACE_DISPLAY_NAME = "Local Plugins"


class BootstrapError(RuntimeError):
    pass


def resolve_repo_root(value: str | None) -> Path:
    return Path(value).expanduser().resolve() if value else Path.cwd().resolve()


def default_install_root() -> Path:
    return Path.home() / "plugins"


def default_marketplace_path() -> Path:
    return Path.home() / ".agents" / "plugins" / "marketplace.json"


def load_json(path: Path) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise BootstrapError(f"Missing JSON file: {path}") from exc
    except json.JSONDecodeError as exc:
        raise BootstrapError(f"Invalid JSON file: {path}") from exc
    if not isinstance(payload, dict):
        raise BootstrapError(f"Expected a JSON object in {path}")
    return payload


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def plugin_bundle_root(repo_root: Path) -> Path:
    return repo_root / "plugins" / PLUGIN_NAME


def load_repo_marketplace_entry(repo_root: Path) -> dict[str, Any]:
    payload = load_json(repo_root / ".agents" / "plugins" / "marketplace.json")
    plugins = payload.get("plugins")
    if not isinstance(plugins, list):
        raise BootstrapError("Repo marketplace manifest must contain a plugins list")
    entry = next(
        (
            item
            for item in plugins
            if isinstance(item, dict) and item.get("name") == PLUGIN_NAME
        ),
        None,
    )
    if entry is None:
        raise BootstrapError(f"Repo marketplace manifest is missing {PLUGIN_NAME}")
    return copy.deepcopy(entry)


def home_root_for_marketplace(marketplace_path: Path) -> Path:
    try:
        return marketplace_path.resolve().parents[2]
    except IndexError as exc:
        raise BootstrapError(
            "Marketplace path must live under a home-style root such as ~/.agents/plugins/marketplace.json"
        ) from exc


def local_source_path(*, home_root: Path, install_root: Path) -> str:
    relative = os.path.relpath((install_root / PLUGIN_NAME).resolve(), home_root.resolve())
    if relative == "." or relative.startswith(".."):
        raise BootstrapError(
            f"Install root must stay inside the marketplace home root: install_root={install_root}, home_root={home_root}"
        )
    return f"./{relative.replace(os.sep, '/')}"


def build_local_plugin_entry(
    repo_entry: dict[str, Any],
    *,
    home_root: Path,
    install_root: Path,
) -> dict[str, Any]:
    entry = copy.deepcopy(repo_entry)
    if entry.get("name") != PLUGIN_NAME:
        raise BootstrapError(
            f"Unexpected plugin name in repo marketplace entry: {entry.get('name')!r}"
        )
    source = entry.get("source")
    if not isinstance(source, dict) or source.get("source") != "github":
        raise BootstrapError(
            "Repo marketplace entry must stay GitHub-backed; the local fallback installer rewrites that source for the machine-local marketplace."
        )
    entry["source"] = {
        "source": "local",
        "path": local_source_path(home_root=home_root, install_root=install_root),
    }
    return entry


def ensure_marketplace_payload(
    payload: dict[str, Any],
    *,
    marketplace_name: str,
    marketplace_display_name: str,
) -> tuple[str, list[Any]]:
    name = payload.get("name")
    if name is None:
        payload["name"] = marketplace_name
        name = marketplace_name
    if not isinstance(name, str) or not name.strip():
        raise BootstrapError("Marketplace manifest name must be a non-empty string")

    interface = payload.get("interface")
    if interface is None:
        interface = {}
        payload["interface"] = interface
    if not isinstance(interface, dict):
        raise BootstrapError("Marketplace manifest interface must be a JSON object")
    display_name = interface.get("displayName")
    if display_name is None:
        interface["displayName"] = marketplace_display_name
    elif not isinstance(display_name, str) or not display_name.strip():
        raise BootstrapError("Marketplace interface.displayName must be a non-empty string")

    plugins = payload.get("plugins")
    if plugins is None:
        payload["plugins"] = []
        plugins = payload["plugins"]
    if not isinstance(plugins, list):
        raise BootstrapError("Marketplace manifest plugins must be a list")
    return name, plugins


def validate_existing_local_entries(plugins: list[Any]) -> None:
    for entry in plugins:
        if not isinstance(entry, dict):
            raise BootstrapError("Marketplace plugin entries must be JSON objects")
        if entry.get("name") == PLUGIN_NAME:
            continue
        source = entry.get("source")
        if not isinstance(source, dict):
            raise BootstrapError("Marketplace plugin entries must contain a source object")
        if source.get("source") != "local":
            raise BootstrapError(
                "Local fallback marketplace entries must use source='local'; "
                f"found {source.get('source')!r} for {entry.get('name')!r}"
            )


def merge_marketplace_entry(
    marketplace_path: Path,
    plugin_entry: dict[str, Any],
    *,
    marketplace_name: str,
    marketplace_display_name: str,
) -> dict[str, str]:
    payload = load_json(marketplace_path) if marketplace_path.exists() else {}
    effective_name, plugins = ensure_marketplace_payload(
        payload,
        marketplace_name=marketplace_name,
        marketplace_display_name=marketplace_display_name,
    )
    validate_existing_local_entries(plugins)

    existing_index = next(
        (
            index
            for index, entry in enumerate(plugins)
            if isinstance(entry, dict) and entry.get("name") == PLUGIN_NAME
        ),
        None,
    )
    action = "updated" if existing_index is not None else "created"
    if existing_index is None:
        plugins.append(copy.deepcopy(plugin_entry))
    else:
        plugins[existing_index] = copy.deepcopy(plugin_entry)

    write_json(marketplace_path, payload)
    return {
        "action": action,
        "marketplace_name": effective_name,
        "marketplace_path": str(marketplace_path),
    }


def remove_path(path: Path) -> None:
    if not path.exists():
        return
    if path.is_file() or path.is_symlink():
        path.unlink()
        return
    shutil.rmtree(path)


def copy_installed_plugin(repo_root: Path, install_root: Path) -> Path:
    plugin_root = plugin_bundle_root(repo_root)
    if not plugin_root.is_dir():
        raise BootstrapError(f"Missing packaged plugin bundle: {plugin_root}")

    install_root = install_root.expanduser().resolve()
    install_root.mkdir(parents=True, exist_ok=True)

    staging_path = install_root / f".{PLUGIN_NAME}.tmp"
    target_path = install_root / PLUGIN_NAME
    remove_path(staging_path)
    shutil.copytree(plugin_root, staging_path)
    remove_path(target_path)
    staging_path.replace(target_path)
    return target_path


def bootstrap_local_plugin(
    repo_root: Path,
    *,
    install_root: Path,
    marketplace_path: Path,
    marketplace_name: str,
    marketplace_display_name: str,
    sync_source: bool = True,
) -> dict[str, str]:
    repo_root = repo_root.resolve()
    install_root = install_root.expanduser().resolve()
    marketplace_path = marketplace_path.expanduser().resolve()

    if sync_source:
        sync_payload(repo_root)

    install_target = copy_installed_plugin(repo_root, install_root)
    home_root = home_root_for_marketplace(marketplace_path)
    plugin_entry = build_local_plugin_entry(
        load_repo_marketplace_entry(repo_root),
        home_root=home_root,
        install_root=install_root,
    )
    marketplace_result = merge_marketplace_entry(
        marketplace_path,
        plugin_entry,
        marketplace_name=marketplace_name,
        marketplace_display_name=marketplace_display_name,
    )
    effective_marketplace_name = marketplace_result["marketplace_name"]
    return {
        "install_target": str(install_target),
        "marketplace_action": marketplace_result["action"],
        "marketplace_name": effective_marketplace_name,
        "marketplace_path": marketplace_result["marketplace_path"],
        "plugin_reference": f"{PLUGIN_NAME}@{effective_marketplace_name}",
        "source_path": plugin_entry["source"]["path"],
        "source_sync": "synced" if sync_source else "skipped",
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Install the packaged codex-autoresearch plugin into a machine-local "
            "plugin directory and merge a local-source marketplace fallback entry."
        )
    )
    parser.add_argument(
        "--repo",
        help="Repository root. Defaults to the current working directory.",
    )
    parser.add_argument(
        "--install-root",
        help=f"Target plugin root directory. Defaults to {default_install_root()}.",
    )
    parser.add_argument(
        "--marketplace",
        help=(
            "Target local marketplace manifest path. "
            f"Defaults to {default_marketplace_path()}."
        ),
    )
    parser.add_argument(
        "--marketplace-name",
        default=DEFAULT_MARKETPLACE_NAME,
        help=(
            "Marketplace identifier to use when creating a new local manifest. "
            f"Defaults to {DEFAULT_MARKETPLACE_NAME!r}."
        ),
    )
    parser.add_argument(
        "--marketplace-display-name",
        default=DEFAULT_MARKETPLACE_DISPLAY_NAME,
        help=(
            "Marketplace display name to use when creating a new local manifest. "
            f"Defaults to {DEFAULT_MARKETPLACE_DISPLAY_NAME!r}."
        ),
    )
    parser.add_argument(
        "--skip-sync",
        action="store_true",
        help="Skip syncing the packaged plugin payload from the repo root first.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    repo_root = resolve_repo_root(args.repo)
    install_root = (
        Path(args.install_root).expanduser().resolve()
        if args.install_root
        else default_install_root().expanduser().resolve()
    )
    marketplace_path = (
        Path(args.marketplace).expanduser().resolve()
        if args.marketplace
        else default_marketplace_path().expanduser().resolve()
    )
    payload = bootstrap_local_plugin(
        repo_root,
        install_root=install_root,
        marketplace_path=marketplace_path,
        marketplace_name=args.marketplace_name,
        marketplace_display_name=args.marketplace_display_name,
        sync_source=not args.skip_sync,
    )
    print(f"Packaged plugin payload {payload['source_sync']} from repo sources.")
    print(f"Installed plugin bundle to {payload['install_target']}")
    print(
        f"{payload['marketplace_action'].capitalize()} marketplace entry in "
        f"{payload['marketplace_path']}"
    )
    print(f"Local marketplace source path: {payload['source_path']}")
    print(f"Enabled plugin reference: {payload['plugin_reference']}")
    print("Reload Codex after updating enabled plugins if it is already running.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except BootstrapError as exc:
        raise SystemExit(f"error: {exc}")
