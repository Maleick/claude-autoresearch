from __future__ import annotations

import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from scripts.autoresearch_helpers import RunConfig, append_iteration, initialize_run


def test_initialize_run_writes_both_results_logs(tmp_path: Path) -> None:
    config = RunConfig(
        goal="Improve docs",
        metric="defects",
        direction="lower",
        verify="pytest",
        mode="foreground",
    )

    initialize_run(
        repo=str(tmp_path),
        results_path_value=None,
        state_path_value=None,
        config=config,
        fresh_start=False,
    )

    research = tmp_path / "research-results.tsv"
    autoresearch = tmp_path / "autoresearch-results.tsv"
    assert research.exists()
    assert autoresearch.exists()
    assert research.read_text(encoding="utf-8") == autoresearch.read_text(encoding="utf-8")


def test_append_iteration_keeps_compatibility_logs_in_sync(tmp_path: Path) -> None:
    config = RunConfig(
        goal="Improve docs",
        metric="defects",
        direction="lower",
        verify="pytest",
        mode="foreground",
    )
    initialize_run(
        repo=str(tmp_path),
        results_path_value=None,
        state_path_value=None,
        config=config,
        fresh_start=False,
    )

    append_iteration(
        repo=str(tmp_path),
        results_path_value=None,
        state_path_value=None,
        decision="discard",
        metric_value="5",
        verify_status="pass",
        guard_status="skip",
        hypothesis="docs cleanup may help",
        change_summary="Rewrite install copy",
        labels=["docs"],
        note="kept for compatibility test",
        iteration=1,
    )

    research = tmp_path / "research-results.tsv"
    autoresearch = tmp_path / "autoresearch-results.tsv"
    assert research.read_text(encoding="utf-8") == autoresearch.read_text(encoding="utf-8")
