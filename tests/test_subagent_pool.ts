import { resolve } from "path";
import { fileURLToPath } from "url";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");

async function importSubagentPool() {
  return await import(resolve(REPO_ROOT, "dist/subagent-pool.js"));
}

describe("buildContinuationPolicy", () => {
  let mod: any;
  beforeAll(async () => { mod = await importSubagentPool(); });

  it("sets completion_requires_review true for foreground", () => {
    const policy = mod.buildContinuationPolicy("foreground");
    expect(policy.completion_requires_review).toBe(true);
    expect(policy.approval_boundary).toBe("pre_launch");
    expect(policy.post_launch_default).toBe("continue");
    expect(policy.stop_conditions).toEqual(["user_stop", "configured_stop_condition", "needs_human"]);
  });

  it("sets completion_requires_review false for background", () => {
    const policy = mod.buildContinuationPolicy("background");
    expect(policy.completion_requires_review).toBe(false);
  });

  it("sets completion_requires_review false for any other mode", () => {
    const policy = mod.buildContinuationPolicy("batch");
    expect(policy.completion_requires_review).toBe(false);
  });
});

describe("buildSubagentPoolPlan", () => {
  let mod: any;
  beforeAll(async () => { mod = await importSubagentPool(); });

  it("returns a valid pool plan with required keys", () => {
    const plan = mod.buildSubagentPoolPlan({ goal: "test goal", mode: "foreground" });
    expect(plan.kind).toBe("autoresearch_subagent_pool");
    expect(plan.version).toBe(1);
    expect(plan.pool_key).toMatch(/^autoresearch-pool-/);
    expect(plan.role_limit).toBe(6);
    expect(plan.standing_pool).toBe(true);
    expect(plan.orchestrator_role_id).toBe("orchestrator");
    expect(plan.state_owner).toBe("orchestrator");
  });

  it("includes orch/scout/analyst/verify/synth roles for full tier", () => {
    const plan = mod.buildSubagentPoolPlan({ goal: "improve backend performance and reduce latency for high throughput production system processing with multiple concurrent users and large datasets requiring optimization", mode: "foreground" });
    expect(plan.resource_tier).toBe("full");
    const ids = plan.roles.map((r: any) => r.id);
    expect(ids).toContain("orchestrator");
    expect(ids).toContain("scout");
    expect(ids).toContain("analyst");
    expect(ids).toContain("verifier");
    expect(ids).toContain("synthesizer");
  });

  it("selects lite tier for short narrow tasks without scope", () => {
    const plan = mod.buildSubagentPoolPlan({ goal: "simple cleanup", mode: "foreground" });
    expect(plan.resource_tier).toBe("lite");
    const activeIds = plan.roles.filter((r: any) => r.active_by_default).map((r: any) => r.id);
    expect(activeIds).toContain("orchestrator");
    expect(activeIds).toContain("scout");
    expect(activeIds).toContain("verifier");
    expect(activeIds).not.toContain("analyst");
  });

  it("selects balanced tier for moderate tasks", () => {
    const plan = mod.buildSubagentPoolPlan({ goal: "improve the data processing pipeline efficiency", mode: "foreground", scope: "." });
    expect(plan.resource_tier).toBe("balanced");
    const activeIds = plan.roles.filter((r: any) => r.active_by_default).map((r: any) => r.id);
    expect(activeIds).toContain("orchestrator");
    expect(activeIds).toContain("scout");
    expect(activeIds).toContain("analyst");
    expect(activeIds).toContain("verifier");
    expect(activeIds).not.toContain("synthesizer");
  });

  it("always selects full tier for background mode", () => {
    const plan = mod.buildSubagentPoolPlan({ goal: "fix bug", mode: "background" });
    expect(plan.resource_tier).toBe("full");
    expect(plan.activation.reason).toBe("Background runs need full standing pool alignment.");
  });

  it("activates debugger role when goal contains bug keyword", () => {
    const plan = mod.buildSubagentPoolPlan({ goal: "fix critical bug in payment processing", mode: "foreground" });
    const ids = plan.roles.map((r: any) => r.id);
    expect(ids).toContain("debugger");
    expect(plan.specialization).toBe("debugger");
  });

  it("activates security_reviewer when goal contains auth keyword", () => {
    const plan = mod.buildSubagentPoolPlan({ goal: "review auth system security", mode: "foreground" });
    const ids = plan.roles.map((r: any) => r.id);
    expect(ids).toContain("security_reviewer");
    expect(plan.specialization).toBe("security_reviewer");
  });

  it("activates release_guard when goal contains deploy keyword", () => {
    const plan = mod.buildSubagentPoolPlan({ goal: "prepare deploy pipeline", mode: "foreground" });
    const ids = plan.roles.map((r: any) => r.id);
    expect(ids).toContain("release_guard");
  });

  it("activates meta_orchestrator when goal contains self-improve keyword", () => {
    const plan = mod.buildSubagentPoolPlan({ goal: "self-improve the autoresearch engine", mode: "foreground" });
    const ids = plan.roles.map((r: any) => r.id);
    expect(ids).toContain("meta_orchestrator");
    expect(plan.specialization).toBe("meta_orchestrator");
  });

  it("activates test_designer when goal contains coverage keyword", () => {
    const plan = mod.buildSubagentPoolPlan({ goal: "improve test coverage", mode: "foreground" });
    const ids = plan.roles.map((r: any) => r.id);
    expect(ids).toContain("test_designer");
    expect(plan.specialization).toBe("test_designer");
  });

  it("activates doc_reviewer when goal contains documentation keyword", () => {
    const plan = mod.buildSubagentPoolPlan({ goal: "improve documentation", mode: "foreground" });
    const ids = plan.roles.map((r: any) => r.id);
    expect(ids).toContain("doc_reviewer");
  });

  it("clamps allocated roles at role_limit 6", () => {
    const plan = mod.buildSubagentPoolPlan({ goal: "review auth security and debug errors in documentation", mode: "foreground" });
    expect(plan.roles.length).toBeLessThanOrEqual(6);
  });

  it("each role has a handoff_prompt containing the goal", () => {
    const plan = mod.buildSubagentPoolPlan({ goal: "optimize search", mode: "foreground" });
    for (const role of plan.roles) {
      expect(role.handoff_prompt).toContain("optimize search");
      expect(role.handoff_prompt).toMatch(/^You are the /);
    }
  });

  it("carries goal, scope, and mode in output", () => {
    const plan = mod.buildSubagentPoolPlan({ goal: "my goal", scope: "src/", mode: "background" });
    expect(plan.goal).toBe("my goal");
    expect(plan.scope).toBe("src/");
    expect(plan.mode).toBe("background");
  });

  it("defaults scope to null when not provided", () => {
    const plan = mod.buildSubagentPoolPlan({ goal: "test", mode: "foreground" });
    expect(plan.scope).toBeNull();
  });

  it("uses unique pool keys per invocation", () => {
    const plan1 = mod.buildSubagentPoolPlan({ goal: "a", mode: "foreground" });
    const plan2 = mod.buildSubagentPoolPlan({ goal: "b", mode: "foreground" });
    expect(plan1.pool_key).not.toBe(plan2.pool_key);
  });
});
