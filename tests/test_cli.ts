import { resolve } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const CLI = resolve(REPO_ROOT, "dist/cli.js");

describe("CLI Commands", () => {
  describe("--version flag", () => {
    it("outputs version info", () => {
      const out = execSync(`node ${CLI} --version`, { encoding: "utf-8" });
      expect(out).toContain("autoresearch");
      expect(out).toContain("3.2.0");
    });

    it("accepts -v shorthand", () => {
      const out = execSync(`node ${CLI} -v`, { encoding: "utf-8" });
      expect(out).toContain("autoresearch");
    });
  });

  describe("--help flag", () => {
    it("shows usage", () => {
      const out = execSync(`node ${CLI} --help 2>&1`, { encoding: "utf-8" });
      expect(out).toContain("Usage:");
      expect(out).toContain("init");
      expect(out).toContain("status");
    });

    it("accepts -h shorthand", () => {
      const out = execSync(`node ${CLI} -h 2>&1`, { encoding: "utf-8" });
      expect(out).toContain("Usage:");
    });
  });

  describe("doctor command", () => {
    it("runs without error in repo root", () => {
      const out = execSync(`node ${CLI} doctor`, { encoding: "utf-8", cwd: REPO_ROOT });
      expect(out).toContain("autoresearch");
      expect(out).toContain("✓");
    });
  });

  describe("wizard command", () => {
    it("generates setup summary with goal", () => {
      const out = execSync(`node ${CLI} wizard --goal "test goal"`, { encoding: "utf-8", cwd: REPO_ROOT });
      const json = JSON.parse(out);
      expect(json.goal).toBe("test goal");
      expect(json.subagent_pool).toBeDefined();
    });
  });

  describe("unknown command", () => {
    it("exits with error for unknown command", () => {
      expect(() => {
        execSync(`node ${CLI} unknowncmd`, { encoding: "utf-8" });
      }).toThrow();
    });
  });
});
