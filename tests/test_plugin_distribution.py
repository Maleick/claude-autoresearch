from __future__ import annotations

import json
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from scripts.check_plugin_distribution import validate_distribution
from scripts.sync_plugin_payload import collect_drift, sync_payload


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def write_json(path: Path, payload: dict) -> None:
    write_text(path, json.dumps(payload, indent=2) + "\n")


def build_minimal_repo(repo_root: Path) -> None:
    write_text(repo_root / "SKILL.md", "# Auto Research\n")
    write_text(
        repo_root / "agents" / "openai.yaml",
        'interface:\n  display_name: "Auto Research"\n',
    )
    write_text(repo_root / "scripts" / "example.py", "print('ok')\n")
    write_text(repo_root / "references" / "overview.md", "# Overview\n")

    write_json(
        repo_root / "plugins" / "codex-autoresearch" / ".codex-plugin" / "plugin.json",
        {
            "name": "codex-autoresearch",
            "version": "0.1.0",
            "description": "Auto Research Codex plugin",
            "skills": "./skills/",
            "interface": {
                "displayName": "Auto Research",
                "shortDescription": "Cross-platform autonomous iteration",
            },
        },
    )
    write_json(
        repo_root / ".agents" / "plugins" / "marketplace.json",
        {
            "name": "local-auto-research",
            "interface": {"displayName": "Local Auto Research Plugins"},
            "plugins": [
                {
                    "name": "codex-autoresearch",
                    "source": {
                        "source": "local",
                        "path": "./plugins/codex-autoresearch",
                    },
                    "policy": {
                        "installation": "AVAILABLE",
                        "authentication": "ON_INSTALL",
                    },
                    "category": "Productivity",
                }
            ],
        },
    )


def test_sync_payload_mirrors_root_sources(tmp_path: Path) -> None:
    build_minimal_repo(tmp_path)

    payload = sync_payload(tmp_path)

    bundled_root = tmp_path / "plugins" / "codex-autoresearch" / "skills" / "codex-autoresearch"
    assert payload["skill_root"] == str(bundled_root)
    assert (bundled_root / "SKILL.md").read_text(encoding="utf-8") == "# Auto Research\n"
    assert (bundled_root / "agents" / "openai.yaml").exists()
    assert (bundled_root / "scripts" / "example.py").exists()
    assert (bundled_root / "references" / "overview.md").exists()
    assert collect_drift(tmp_path) == []


def test_validate_distribution_accepts_synced_local_marketplace(tmp_path: Path) -> None:
    build_minimal_repo(tmp_path)
    sync_payload(tmp_path)

    payload = validate_distribution(tmp_path)

    assert payload["plugin_manifest"].endswith("plugins/codex-autoresearch/.codex-plugin/plugin.json")
    assert payload["skills_path"].endswith("plugins/codex-autoresearch/skills")
    assert payload["marketplace_entry"]["source"] == {
        "source": "local",
        "path": "./plugins/codex-autoresearch",
    }
