import { resolve } from "path";
import { fileURLToPath } from "url";
import { mkdirSync, rmSync, existsSync } from "fs";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");

async function initializeRun(repo: string, config: { goal: string; metric: string; direction: string; verify: string; mode: string }): Promise<void> {
  const { initializeRun } = await import(resolve(REPO_ROOT, "dist/run-manager.js"));
  const state = await initializeRun(repo, undefined, undefined, config, false);
  expect(state.status).toBe("initialized");
}

describe("run-manager", () => {
  const tmpDir = resolve(REPO_ROOT, ".autoresearch-test-tmp");

  beforeAll(() => {
    mkdirSync(tmpDir, { recursive: true });
  });

  afterAll(() => {
    try { rmSync(tmpDir, { recursive: true }); } catch { /* ignore */ }
  });

  describe("initializeRun", () => {
    it("writes state.json and results.tsv", async () => {
      const config = {
        goal: "Test goal",
        metric: "defects",
        direction: "lower",
        verify: "echo 0",
        mode: "foreground",
      };
      await initializeRun(tmpDir, config);
      expect(existsSync(resolve(tmpDir, ".autoresearch/state.json"))).toBe(true);
      expect(existsSync(resolve(tmpDir, "autoresearch-results.tsv"))).toBe(true);
    });

    it("rejects duplicate run without fresh-start", async () => {
      const config = {
        goal: "Test goal 2",
        metric: "defects",
        direction: "lower",
        verify: "echo 0",
        mode: "foreground",
      };
      await expect(initializeRun(tmpDir, config)).rejects.toThrow();
    });
  });
});