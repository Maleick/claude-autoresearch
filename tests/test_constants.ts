import { resolve } from "path";
import { fileURLToPath } from "url";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");

describe("Constants", () => {
  it("has correct version", async () => {
    const { VERSION } = await import(resolve(REPO_ROOT, "dist/constants.js"));
    expect(VERSION).toBe("3.3.0");
  });

  it("has correct package name", async () => {
    const { PACKAGE_NAME } = await import(resolve(REPO_ROOT, "dist/constants.js"));
    expect(PACKAGE_NAME).toBe("opencode-autoresearch");
  });

  it("has correct skill name", async () => {
    const { SKILL_NAME } = await import(resolve(REPO_ROOT, "dist/constants.js"));
    expect(SKILL_NAME).toBe("autoresearch");
  });

  it("has correct results default", async () => {
    const { RESULTS_DEFAULT } = await import(resolve(REPO_ROOT, "dist/constants.js"));
    expect(RESULTS_DEFAULT).toBe("autoresearch-results.tsv");
  });

  it("has correct state default", async () => {
    const { STATE_DEFAULT } = await import(resolve(REPO_ROOT, "dist/constants.js"));
    expect(STATE_DEFAULT).toBe(".autoresearch/state.json");
  });

  it("has correct launch default", async () => {
    const { LAUNCH_DEFAULT } = await import(resolve(REPO_ROOT, "dist/constants.js"));
    expect(LAUNCH_DEFAULT).toBe(".autoresearch/launch.json");
  });

  it("has correct memory default", async () => {
    const { MEMORY_DEFAULT } = await import(resolve(REPO_ROOT, "dist/constants.js"));
    expect(MEMORY_DEFAULT).toBe("autoresearch-memory.md");
  });
});
