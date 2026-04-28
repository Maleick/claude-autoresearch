import { resolve } from "path";
import { fileURLToPath } from "url";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");

describe("Type Definitions", () => {
  it("types file exists and exports helpers", async () => {
    const types = await import(resolve(REPO_ROOT, "dist/types.js"));
    expect(types).toBeDefined();
  });

  it("has valid Metric structure", async () => {
    const metric = {
      name: "test",
      direction: "lower" as const,
      baseline: "100",
      best: "90",
      latest: "95",
    };
    expect(metric.name).toBe("test");
    expect(metric.direction).toBe("lower");
  });

  it("has valid RunState structure", async () => {
    const state = {
      schema_version: 1,
      run_id: "test",
      status: "running" as const,
      mode: "foreground" as const,
      goal: "test goal",
      stats: { kept: 0, discarded: 0, needs_human: 0, consecutive_discards: 0, total_iterations: 0 },
      flags: { stop_requested: false, needs_human: false, background_active: false, stop_ready: false },
    };
    expect(state.schema_version).toBe(1);
    expect(state.status).toBe("running");
  });

  it("validates RunConfig structure", () => {
    const config = {
      goal: "test goal",
      metric: "tests",
      direction: "higher",
      verify: "npm test",
      mode: "background",
      scope: "src/",
      guard: "npm run lint",
      iterations: 20,
      duration: "2h",
      required_keep_labels: ["pass"],
      required_stop_labels: ["stop"],
    };
    expect(config.goal).toBe("test goal");
    expect(config.iterations).toBe(20);
    expect(config.required_keep_labels).toContain("pass");
  });

  it("validates SubagentPoolPlan structure", () => {
    const plan = {
      kind: "autoresearch_subagent_pool",
      version: 1,
      pool_key: "test-pool",
      role_limit: 6,
      standing_pool: true,
      orchestrator_role_id: "orchestrator",
      state_owner: "orchestrator",
      roles: [],
      goal: "test",
      scope: "src/",
      mode: "foreground",
    };
    expect(plan.kind).toBe("autoresearch_subagent_pool");
    expect(plan.role_limit).toBe(6);
  });

  it("validates ContinuationPolicy structure", () => {
    const policy = {
      approval_boundary: "pre_launch",
      post_launch_default: "continue",
      completion_requires_review: false,
      stop_conditions: ["user_stop"],
    };
    expect(policy.approval_boundary).toBe("pre_launch");
    expect(policy.completion_requires_review).toBe(false);
  });

  it("validates SupervisorSnapshot structure", () => {
    const snapshot = {
      run_id: "test-run",
      status: "running",
      mode: "foreground",
      goal: "test",
      metric: { name: "tests", direction: "higher", best: "100", latest: "95" },
      stats: { total_iterations: 5, kept: 5, discarded: 0 },
      last_iteration: { iteration: 5, decision: "keep", metric_value: "95" },
      flags: { stop_ready: true },
      results_rows: 5,
    };
    expect(snapshot.run_id).toBe("test-run");
    expect(snapshot.stats.total_iterations).toBe(5);
  });

  it("validates ArtifactPaths structure", () => {
    const paths = {
      results: "/path/to/results.tsv",
      state: "/path/to/state.json",
    };
    expect(paths.results).toBe("/path/to/results.tsv");
  });

  it("validates LabelRequirements structure", () => {
    const reqs = {
      keep: ["pass", "verified"],
      stop: ["blocker"],
    };
    expect(reqs.keep).toContain("verified");
    expect(reqs.stop).toContain("blocker");
  });

  it("validates WizardConfig structure", () => {
    const config = {
      goal: "test",
      metric: "tests",
      direction: "higher",
      verify: "npm test",
      mode: "background",
      scope: "src/",
      guard: "npm run lint",
      iterations: 20,
      duration: "2h",
      required_keep_labels: ["pass"],
      required_stop_labels: ["stop"],
      run_tag: "v1",
      baseline: "100",
      memory_path: "/path/to/memory",
      rollback_strategy: "discard",
      stop_condition: "10 iterations",
    };
    expect(config.goal).toBe("test");
    expect(config.iterations).toBe(20);
    expect(config.duration).toBe("2h");
  });

  it("validates RoleTemplate structure", () => {
    const role = {
      id: "test",
      name: "Test Role",
      focus: "Testing",
      triggers: ["test", "coverage"],
    };
    expect(role.id).toBe("test");
    expect(role.name).toBe("Test Role");
    expect(role.triggers).toContain("test");
  });

  it("validates LastIteration structure", () => {
    const iter = {
      iteration: 5,
      decision: "keep",
      metric_value: "95",
      change_summary: "test change",
      labels: ["progress"],
      timestamp: "2024-01-01T00:00:00Z",
    };
    expect(iter.iteration).toBe(5);
    expect(iter.decision).toBe("keep");
    expect(iter.metric_value).toBe("95");
  });

  it("validates RunFlags structure", () => {
    const flags = {
      stop_requested: false,
      needs_human: false,
      background_active: true,
      stop_ready: true,
    };
    expect(flags.stop_requested).toBe(false);
    expect(flags.background_active).toBe(true);
  });

  it("validates RunStats structure", () => {
    const stats = {
      total_iterations: 10,
      kept: 8,
      discarded: 2,
      needs_human: 0,
      consecutive_discards: 0,
    };
    expect(stats.total_iterations).toBe(10);
    expect(stats.kept).toBe(8);
    expect(stats.discarded).toBe(2);
  });
});
