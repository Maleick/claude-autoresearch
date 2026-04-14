#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
from dataclasses import dataclass
from typing import Any


ROLE_LIMIT = 6
WHITESPACE_RE = re.compile(r"\s+")
RESOURCE_TIERS: dict[str, tuple[str, ...]] = {
    "lite": ("orchestrator", "scout", "verifier"),
    "balanced": ("orchestrator", "scout", "analyst", "verifier"),
    "full": ("orchestrator", "scout", "analyst", "verifier", "synthesizer"),
}


class SubagentPlanError(RuntimeError):
    pass


@dataclass(frozen=True)
class RoleTemplate:
    role_id: str
    name: str
    focus: str
    triggers: tuple[str, ...] = ()


BASE_ROLE_TEMPLATES: tuple[RoleTemplate, ...] = (
    RoleTemplate(
        "orchestrator",
        "Orchestrator",
        "Keep the goal, scope, and mode aligned; route work and merge results.",
    ),
    RoleTemplate(
        "scout",
        "Scout",
        "Locate the relevant files, docs, commands, and prior context in the repo.",
    ),
    RoleTemplate(
        "analyst",
        "Analyst",
        "Turn evidence into options, tradeoffs, and a clear next-step recommendation.",
    ),
    RoleTemplate(
        "verifier",
        "Verifier",
        "Check claims with commands, tests, or log reads before the pool settles.",
    ),
    RoleTemplate(
        "synthesizer",
        "Synthesizer",
        "Condense the best evidence into a stable summary the orchestrator can reuse.",
    ),
)

SPECIAL_ROLE_TEMPLATES: tuple[RoleTemplate, ...] = (
    RoleTemplate(
        "security_reviewer",
        "Security Reviewer",
        "Look for safety, abuse, auth, and data-handling risks.",
        ("security", "vuln", "threat", "auth", "permission", "secret", "pii", "compliance"),
    ),
    RoleTemplate(
        "debugger",
        "Debugger",
        "Reproduce failures, isolate causes, and narrow the repair path.",
        ("debug", "fix", "bug", "error", "fail", "failing", "broken", "crash", "regression"),
    ),
    RoleTemplate(
        "release_guard",
        "Release Guard",
        "Check ship-readiness, rollout risk, and user-visible regressions.",
        ("ship", "release", "deploy", "rollout", "publish", "handoff"),
    ),
    RoleTemplate(
        "research_tracker",
        "Research Tracker",
        "Collect background, comparisons, and scenario coverage for the loop.",
        ("learn", "research", "predict", "scenario", "compare", "baseline"),
    ),
)


def normalize_text(value: str | None) -> str | None:
    if value is None:
        return None
    collapsed = WHITESPACE_RE.sub(" ", value.strip())
    return collapsed or None


def normalize_required_text(value: str | None, field_name: str) -> str:
    normalized = normalize_text(value)
    if normalized is None:
        raise SubagentPlanError(f"{field_name} is required")
    return normalized


def normalize_mode(value: str | None) -> str:
    normalized = normalize_required_text(value, "mode")
    return normalized.lower()


def choose_special_role(goal: str, scope: str | None, mode: str) -> RoleTemplate | None:
    lowered = " ".join(part for part in (goal, scope or "", mode) if part).lower()
    for template in SPECIAL_ROLE_TEMPLATES:
        if any(trigger in lowered for trigger in template.triggers):
            return template
    return None


def choose_resource_tier(
    goal: str,
    scope: str | None,
    mode: str,
    special_role: RoleTemplate | None,
) -> tuple[str, str]:
    combined = " ".join(part for part in (goal, scope or "", mode) if part)
    token_count = len(combined.split())
    if mode == "background":
        return (
            "full",
            "Background runs benefit from a standing pool that stays aligned across setup, iteration, and resume.",
        )
    if special_role is not None:
        return (
            "full",
            f"Goal and scope need {special_role.name.lower()} coverage, so keep the full standing pool active.",
        )
    if token_count <= 8 and scope is None:
        return (
            "lite",
            "Short, narrow work can start with a smaller standing pool while keeping the same orchestrator contract.",
        )
    if token_count <= 20:
        return (
            "balanced",
            "Moderate work benefits from scout, analyst, and verifier coverage without maxing out the pool.",
        )
    return (
        "full",
        "Broader or more ambiguous work benefits from the full standing pool from the start.",
    )


def build_active_role_ids(
    *,
    resource_tier: str,
    special_role: RoleTemplate | None,
) -> list[str]:
    active_role_ids = list(RESOURCE_TIERS[resource_tier])
    if special_role is not None and special_role.role_id not in active_role_ids:
        active_role_ids.append(special_role.role_id)
    return active_role_ids[:ROLE_LIMIT]


def build_pool_key(goal: str, scope: str | None, mode: str, role_ids: list[str]) -> str:
    payload = {
        "goal": goal,
        "scope": scope,
        "mode": mode,
        "roles": role_ids,
    }
    digest = hashlib.sha256(
        json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()[:12]
    return f"autoresearch-pool-{digest}"


def build_role_handoff_prompt(
    *,
    template: RoleTemplate,
    goal: str,
    scope: str | None,
    mode: str,
) -> str:
    scope_text = scope or "current repository"
    return (
        f"You are the {template.name}. Focus: {template.focus} "
        f"Goal: {goal}. Scope: {scope_text}. Mode: {mode}. "
        "Do not mutate autoresearch state. Return evidence, risks, and one next-step recommendation."
    )


def build_reanchor_checklist() -> list[str]:
    return [
        "Restate the goal, scope, metric, and verify command before the next handoff.",
        "Summarize the latest kept or discarded iteration before asking the pool for more work.",
        "Reuse the current role ownership unless drift, timeout, or repeated discards force a reset.",
        "Ask non-orchestrator roles for evidence, objections, verification, and one next-step recommendation.",
    ]


def build_handoff_contract() -> list[str]:
    return [
        "Only the orchestrator records iterations or mutates autoresearch-state.json.",
        "Non-orchestrator roles return evidence, objections, verification results, and concise recommendations.",
        "Keep the pool stable across iterations; replace or drop roles only when they stop adding value.",
    ]


def template_to_role(
    *,
    template: RoleTemplate,
    goal: str,
    scope: str | None,
    mode: str,
    active_role_ids: list[str],
) -> dict[str, Any]:
    return {
        "id": template.role_id,
        "name": template.name,
        "focus": template.focus,
        "active_by_default": template.role_id in active_role_ids,
        "handoff_prompt": build_role_handoff_prompt(
            template=template,
            goal=goal,
            scope=scope,
            mode=mode,
        ),
    }


def build_subagent_pool_plan(
    *,
    goal: str,
    scope: str | None = None,
    mode: str,
) -> dict[str, Any]:
    normalized_goal = normalize_required_text(goal, "goal")
    normalized_scope = normalize_text(scope)
    normalized_mode = normalize_mode(mode)

    special_role = choose_special_role(normalized_goal, normalized_scope, normalized_mode)
    resource_tier, activation_reason = choose_resource_tier(
        normalized_goal,
        normalized_scope,
        normalized_mode,
        special_role,
    )
    active_role_ids = build_active_role_ids(
        resource_tier=resource_tier,
        special_role=special_role,
    )

    templates = list(BASE_ROLE_TEMPLATES)
    if special_role is not None:
        templates.append(special_role)
    roles = [
        template_to_role(
            template=template,
            goal=normalized_goal,
            scope=normalized_scope,
            mode=normalized_mode,
            active_role_ids=active_role_ids,
        )
        for template in templates[:ROLE_LIMIT]
    ]
    pool_key = build_pool_key(
        normalized_goal,
        normalized_scope,
        normalized_mode,
        [role["id"] for role in roles],
    )

    plan: dict[str, Any] = {
        "kind": "autoresearch_subagent_pool",
        "version": 1,
        "pool_key": pool_key,
        "role_limit": ROLE_LIMIT,
        "standing_pool": True,
        "reuse_across_iterations": True,
        "orchestrator_role_id": "orchestrator",
        "state_owner": "orchestrator",
        "fallback_mode": "serial",
        "resource_tier": resource_tier,
        "recommended_active_role_ids": active_role_ids,
        "activation": {
            "during_setup": resource_tier != "lite",
            "during_iterations": True,
            "during_resume": True,
            "reason": activation_reason,
        },
        "handoff_contract": build_handoff_contract(),
        "reanchor_checklist": build_reanchor_checklist(),
        "goal": normalized_goal,
        "scope": normalized_scope,
        "mode": normalized_mode,
        "roles": roles,
    }
    if special_role is not None:
        plan["specialization"] = special_role.role_id
    return plan


def render_subagent_pool_plan(
    *,
    goal: str,
    scope: str | None = None,
    mode: str,
) -> str:
    return json.dumps(
        build_subagent_pool_plan(goal=goal, scope=scope, mode=mode),
        indent=2,
        sort_keys=True,
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Emit a stable JSON plan for a standing autoresearch subagent pool."
    )
    parser.add_argument("--goal", required=True, help="Primary outcome for the pool.")
    parser.add_argument("--scope", help="Optional repo scope or subsystem label.")
    parser.add_argument("--mode", required=True, help="Execution mode or workflow label.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    print(render_subagent_pool_plan(goal=args.goal, scope=args.scope, mode=args.mode))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
