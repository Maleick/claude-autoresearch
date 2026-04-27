import { resolve } from "path";
import { fileURLToPath } from "url";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");

async function importWizard() {
  return await import(resolve(REPO_ROOT, "dist/wizard.js"));
}

describe("buildSetupSummary", () => {
  let mod: any;
  beforeAll(async () => { mod = await importWizard(); });

  it("returns default scope from repo basename", () => {
    const result = mod.buildSetupSummary("/my/repo", { goal: "improve speed" });
    expect(result.scope).toBe("repo");
    expect(result.goal).toBe("improve speed");
  });

  it("falls back to current working directory basename when repo is undefined", () => {
    const result = mod.buildSetupSummary(undefined, { goal: "improve speed" });
    expect(result.scope).toBe("AutoResearch");
  });

  it("uses provided scope", () => {
    const result = mod.buildSetupSummary(undefined, { goal: "improve", scope: "src/" });
    expect(result.scope).toBe("src/");
  });

  it("infers verify from repo when not provided", () => {
    const result = mod.buildSetupSummary(REPO_ROOT, { goal: "improve" });
    expect(result.verify).toBe("npm test");
  });

  it("uses provided verify when set", () => {
    const result = mod.buildSetupSummary(undefined, { goal: "improve", verify: "make test" });
    expect(result.verify).toBe("make test");
  });

  it("defaults direction to lower", () => {
    const result = mod.buildSetupSummary(undefined, { goal: "improve" });
    expect(result.direction).toBe("lower");
  });

  it("uses provided direction", () => {
    const result = mod.buildSetupSummary(undefined, { goal: "improve", direction: "higher" });
    expect(result.direction).toBe("higher");
  });

  it("defaults mode to foreground", () => {
    const result = mod.buildSetupSummary(undefined, { goal: "improve" });
    expect(result.mode).toBe("foreground");
  });

  it("uses provided mode", () => {
    const result = mod.buildSetupSummary(undefined, { goal: "improve", mode: "background" });
    expect(result.mode).toBe("background");
  });

  it("parses duration string", () => {
    const result = mod.buildSetupSummary(undefined, { goal: "improve", duration: "2h" });
    expect(result.duration_seconds).toBe(7200);
    expect(result.duration).toBe("2h");
  });

  it("reports missing goal in missing_required and questions", () => {
    const result = mod.buildSetupSummary(undefined, {});
    expect(result.missing_required).toContain("goal");
    const qIds = result.questions.map((q: any) => q.id);
    expect(qIds).toContain("goal");
  });

  it("reports missing verify when inference fails", () => {
    const result = mod.buildSetupSummary("/nonexistent", {});
    expect(result.missing_required).toContain("verify");
  });

  it("includes subagent_pool in summary", () => {
    const result = mod.buildSetupSummary(undefined, { goal: "improve", mode: "foreground" });
    expect(result.subagent_pool.kind).toBe("autoresearch_subagent_pool");
    expect(result.subagent_pool.goal).toBe("improve");
  });

  it("includes continuation_policy in summary", () => {
    const result = mod.buildSetupSummary(undefined, { goal: "improve", mode: "foreground" });
    expect(result.continuation_policy.approval_boundary).toBe("pre_launch");
  });

  it("defaults metric to 'primary verify metric'", () => {
    const result = mod.buildSetupSummary(undefined, { goal: "improve" });
    expect(result.metric).toBe("primary verify metric");
  });

  it("defaults rollback_strategy", () => {
    const result = mod.buildSetupSummary(undefined, { goal: "improve" });
    expect(result.rollback_strategy).toContain("discard current");
  });

  it("normalizes required keep labels", () => {
    const result = mod.buildSetupSummary(undefined, { goal: "improve", required_keep_labels: "a,b" });
    expect(result.required_keep_labels).toEqual(["a", "b"]);
  });

  it("generates stop_condition from provided config", () => {
    const result = mod.buildSetupSummary(undefined, { goal: "improve", verify: "npm test", iterations: 10 });
    expect(result.stop_condition).toContain("10 iterations complete");
  });

  it("includes guard in output when provided", () => {
    const result = mod.buildSetupSummary(undefined, { goal: "improve", guard: "npm run lint" });
    expect(result.guard).toBe("npm run lint");
  });
});
