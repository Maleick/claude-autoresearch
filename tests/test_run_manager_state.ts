import { resolve } from "path";
import { fileURLToPath } from "url";
import { writeFileSync, readFileSync, mkdirSync, rmSync, existsSync } from "fs";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const TMP_DIR = resolve(REPO_ROOT, ".autoresearch-test-tmp");

interface RunState {
  schema_version: number;
  run_id: string;
  status: string;
  mode: string;
  goal: string;
  stats: { kept: number; discarded: number; needs_human: number; consecutive_discards: number; total_iterations: number };
  flags: { stop_requested: boolean; needs_human: boolean; background_active: boolean; stop_ready: boolean };
  [key: string]: unknown;
}

function createMinimalState(overrides: Partial<RunState> = {}): RunState {
  return {
    schema_version: 1,
    run_id: "test-run",
    status: "running",
    mode: "background",
    goal: "test",
    stats: { kept: 0, discarded: 0, needs_human: 0, consecutive_discards: 0, total_iterations: 0 },
    flags: { stop_requested: false, needs_human: false, background_active: true, stop_ready: false },
    ...overrides,
  } as RunState;
}

async function importRunManager() {
  // run-manager imports from helpers which imports from fs -- all ESM native
  return await import(resolve(REPO_ROOT, "dist/run-manager.js"));
}

async function importTypes() {
  return await import(resolve(REPO_ROOT, "dist/types.js"));
}

describe("makeStatePayload", () => {
  let mod: any;
  let types: any;
  beforeAll(async () => {
    mod = await importRunManager();
    types = await importTypes();
  });

  it("creates state with schema_version 1", () => {
    const config = { goal: "test", metric: "score", direction: "higher", verify: "npm test", mode: "foreground" };
    const state = mod.makeStatePayload(config, "results.tsv", "state.json");
    expect(state.schema_version).toBe(1);
    expect(state.status).toBe("initialized");
    expect(state.goal).toBe("test");
  });

  it("generates run_id from run_tag", () => {
    const config = { goal: "test", metric: "score", direction: "higher", verify: "npm test", mode: "foreground", run_tag: "my-run" };
    const state = mod.makeStatePayload(config, "results.tsv", "state.json");
    expect(state.run_id).toBe("my-run");
  });

  it("sets background_active when mode is background", () => {
    const config = { goal: "test", metric: "score", direction: "higher", verify: "npm test", mode: "background" };
    const state = mod.makeStatePayload(config, "results.tsv", "state.json");
    expect(state.flags.background_active).toBe(true);
  });

  it("does not set background_active in foreground", () => {
    const config = { goal: "test", metric: "score", direction: "higher", verify: "npm test", mode: "foreground" };
    const state = mod.makeStatePayload(config, "results.tsv", "state.json");
    expect(state.flags.background_active).toBe(false);
  });

  it("computes deadline_at from duration", () => {
    const config = { goal: "test", metric: "score", direction: "higher", verify: "npm test", mode: "foreground", duration: "1h" };
    const state = mod.makeStatePayload(config, "results.tsv", "state.json");
    expect(state.deadline_at).toBeDefined();
  });

  it("creates metric with name and direction", () => {
    const config = { goal: "test", metric: "coverage", direction: "higher", verify: "npm test", mode: "foreground" };
    const state = mod.makeStatePayload(config, "results.tsv", "state.json");
    expect(state.metric.name).toBe("coverage");
    expect(state.metric.direction).toBe("higher");
  });

  it("sets stop_ready to false initially", () => {
    const config = { goal: "test", metric: "score", direction: "higher", verify: "npm test", mode: "foreground" };
    const state = mod.makeStatePayload(config, "results.tsv", "state.json");
    expect(state.flags.stop_ready).toBe(false);
  });
});

describe("setStopRequested", () => {
  let mod: any;
  beforeAll(async () => { mod = await importRunManager(); });

  const stateDir = resolve(TMP_DIR, "setStopRequested");
  const stateFile = resolve(stateDir, "state.json");

  beforeEach(() => {
    rmSync(stateDir, { recursive: true, force: true });
    mkdirSync(stateDir, { recursive: true });
  });

  it("stops a background run", async () => {
    writeFileSync(stateFile, JSON.stringify(createMinimalState({ mode: "background" })), "utf-8");
    const result = await mod.setStopRequested(stateDir, "state.json");
    expect(result.flags.stop_requested).toBe(true);
    expect(result.flags.background_active).toBe(false);
    expect(result.status).toBe("stopping");
  });

  it("rejects stopping a foreground run", async () => {
    writeFileSync(stateFile, JSON.stringify(createMinimalState({ mode: "foreground" })), "utf-8");
    await expect(mod.setStopRequested(stateDir, "state.json")).rejects.toThrow("Only background runs can be stopped.");
  });
});

describe("resumeBackgroundRun", () => {
  let mod: any;
  beforeAll(async () => { mod = await importRunManager(); });

  const stateDir = resolve(TMP_DIR, "resumeBackgroundRun");
  const stateFile = resolve(stateDir, "state.json");

  beforeEach(() => {
    rmSync(stateDir, { recursive: true, force: true });
    mkdirSync(stateDir, { recursive: true });
  });

  it("resumes a stopped background run", async () => {
    writeFileSync(stateFile, JSON.stringify(createMinimalState({
      mode: "background",
      flags: { stop_requested: true, needs_human: false, background_active: false, stop_ready: true },
      status: "stopping",
    })), "utf-8");
    const result = await mod.resumeBackgroundRun(stateDir, "state.json");
    expect(result.flags.stop_requested).toBe(false);
    expect(result.flags.background_active).toBe(true);
    expect(result.status).toBe("running");
  });

  it("rejects resuming a completed run", async () => {
    writeFileSync(stateFile, JSON.stringify(createMinimalState({ status: "completed" })), "utf-8");
    await expect(mod.resumeBackgroundRun(stateDir, "state.json")).rejects.toThrow("Completed runs cannot be resumed");
  });

  it("rejects resuming a foreground run", async () => {
    writeFileSync(stateFile, JSON.stringify(createMinimalState({ mode: "foreground", status: "stopping" })), "utf-8");
    await expect(mod.resumeBackgroundRun(stateDir, "state.json")).rejects.toThrow("Only background runs can be resumed");
  });
});

describe("completeRun", () => {
  let mod: any;
  beforeAll(async () => { mod = await importRunManager(); });

  const stateDir = resolve(TMP_DIR, "completeRun");
  const stateFile = resolve(stateDir, "state.json");

  beforeEach(() => {
    rmSync(stateDir, { recursive: true, force: true });
    mkdirSync(stateDir, { recursive: true });
  });

  it("completes a running run", async () => {
    writeFileSync(stateFile, JSON.stringify(createMinimalState()), "utf-8");
    const result = await mod.completeRun(stateDir, "state.json");
    expect(result.status).toBe("completed");
    expect(result.flags.stop_requested).toBe(false);
    expect(result.flags.needs_human).toBe(false);
    expect(result.flags.background_active).toBe(false);
    expect(result.flags.stop_ready).toBe(false);
  });

  it("is idempotent on completed runs", async () => {
    writeFileSync(stateFile, JSON.stringify(createMinimalState({ status: "completed" })), "utf-8");
    const stateBefore = JSON.parse(readFileSync(stateFile, "utf-8"));
    const result = await mod.completeRun(stateDir, "state.json");
    expect(result.status).toBe("completed");
    expect(result.updated_at).toBe(stateBefore.updated_at);
  });
});

describe("buildSupervisorSnapshot", () => {
  let mod: any;
  beforeAll(async () => { mod = await importRunManager(); });

  const stateDir = resolve(TMP_DIR, "buildSupervisorSnapshot");

  beforeEach(() => {
    rmSync(stateDir, { recursive: true, force: true });
    mkdirSync(stateDir, { recursive: true });
  });

  it("returns stop when stop_requested is true", async () => {
    writeFileSync(resolve(stateDir, "state.json"), JSON.stringify(createMinimalState({
      flags: { stop_requested: true, needs_human: false, background_active: true, stop_ready: false },
    })), "utf-8");
    const snapshot = await mod.buildSupervisorSnapshot(stateDir, undefined, "state.json");
    expect(snapshot.decision).toBe("stop");
    expect(snapshot.reason).toBe("stop_requested");
  });

  it("returns needs_human when needs_human is true", async () => {
    writeFileSync(resolve(stateDir, "state.json"), JSON.stringify(createMinimalState({
      flags: { stop_requested: false, needs_human: true, background_active: true, stop_ready: false },
    })), "utf-8");
    const snapshot = await mod.buildSupervisorSnapshot(stateDir, undefined, "state.json");
    expect(snapshot.decision).toBe("needs_human");
  });

  it("returns stop when iteration cap reached", async () => {
    writeFileSync(resolve(stateDir, "state.json"), JSON.stringify(createMinimalState({
      stats: { kept: 5, discarded: 0, needs_human: 0, consecutive_discards: 0, total_iterations: 10 },
      iterations_cap: 10,
    })), "utf-8");
    const snapshot = await mod.buildSupervisorSnapshot(stateDir, undefined, "state.json");
    expect(snapshot.decision).toBe("stop");
    expect(snapshot.reason).toBe("iteration_cap_reached");
  });

  it("returns stop for completed status", async () => {
    writeFileSync(resolve(stateDir, "state.json"), JSON.stringify(createMinimalState({ status: "completed" })), "utf-8");
    const snapshot = await mod.buildSupervisorSnapshot(stateDir, undefined, "state.json");
    expect(snapshot.decision).toBe("stop");
    expect(snapshot.reason).toBe("state_completed");
  });

  it("returns relaunch for healthy running state", async () => {
    writeFileSync(resolve(stateDir, "state.json"), JSON.stringify(createMinimalState()), "utf-8");
    const snapshot = await mod.buildSupervisorSnapshot(stateDir, undefined, "state.json");
    expect(snapshot.decision).toBe("relaunch");
    expect(snapshot.reason).toBe("ready_for_next_iteration");
  });

  it("counts results rows from results file", async () => {
    writeFileSync(resolve(stateDir, "state.json"), JSON.stringify(createMinimalState()), "utf-8");
    const header = "timestamp\titeration\tdecision\tmetric_value\tverify_status\tguard_status\thypothesis\tchange_summary\tlabels\tnote\n";
    const row = "2024-01-01T00:00:00Z\t1\tkeep\t42\tpass\tpass\thyp\tchange\tlabel\tnote\n";
    writeFileSync(resolve(stateDir, "autoresearch-results.tsv"), header + row, "utf-8");
    const snapshot = await mod.buildSupervisorSnapshot(stateDir, "autoresearch-results.tsv", "state.json");
    expect(snapshot.results_rows).toBe(1);
  });

  it("counts zero rows when results file is empty", async () => {
    writeFileSync(resolve(stateDir, "state.json"), JSON.stringify(createMinimalState()), "utf-8");
    const header = "timestamp\titeration\tdecision\tmetric_value\tverify_status\tguard_status\thypothesis\tchange_summary\tlabels\tnote\n";
    writeFileSync(resolve(stateDir, "autoresearch-results.tsv"), header, "utf-8");
    const snapshot = await mod.buildSupervisorSnapshot(stateDir, "autoresearch-results.tsv", "state.json");
    expect(snapshot.results_rows).toBe(0);
  });
});
