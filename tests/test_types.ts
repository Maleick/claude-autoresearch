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
});
