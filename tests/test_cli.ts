import { resolve } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { existsSync, readFileSync, rmSync } from "fs";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const CLI = resolve(REPO_ROOT, "dist/cli.js");

describe("CLI Commands", () => {
  describe("--verbose flag", () => {
    it("shows verbose output during init", () => {
      const out = execSync(`node ${CLI} init --goal "test" --metric "test" --verify "echo test" --verbose --dry-run 2>&1`, { encoding: "utf-8", cwd: REPO_ROOT });
      expect(out).toContain("[verbose]");
      expect(out).toContain("[dry-run]");
    });
  });

  describe("--dry-run flag", () => {
    it("prevents file creation in init", () => {
      const out = execSync(`node ${CLI} init --goal "test" --metric "test" --verify "echo" --dry-run 2>&1`, { encoding: "utf-8", cwd: REPO_ROOT });
      expect(out).toContain("Would initialize");
      expect(out).toContain("test");
    });
  });

  describe("--version flag", () => {
    it("outputs version info", () => {
      const out = execSync(`node ${CLI} --version`, { encoding: "utf-8" });
      expect(out).toContain("autoresearch");
      expect(out).toContain("3.3.0");
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

  describe("export command", () => {
    it("requires existing run data", () => {
      expect(() => {
        execSync(`node ${CLI} export --repo /tmp/nonexistent`, { encoding: "utf-8" });
      }).toThrow("No run data found");
    });
  });

  describe("completion command", () => {
    it("generates bash completion", () => {
      const out = execSync(`node ${CLI} completion --shell bash`, { encoding: "utf-8" });
      expect(out).toContain("_autoresearch()");
      expect(out).toContain("complete -F _autoresearch");
    });

    it("generates fish completion", () => {
      const out = execSync(`node ${CLI} completion --shell fish`, { encoding: "utf-8" });
      expect(out).toContain("complete -c autoresearch");
    });

    it("rejects unknown shell", () => {
      expect(() => {
        execSync(`node ${CLI} completion --shell powershell`, { encoding: "utf-8" });
      }).toThrow("Unknown shell");
    });
  });

  describe("explain command", () => {
    it("shows human-readable run state", () => {
      const out = execSync(`node ${CLI} explain`, { encoding: "utf-8", cwd: REPO_ROOT });
      expect(out).toContain("Auto Research Run:");
    });

    it("supports --json flag", () => {
      const out = execSync(`node ${CLI} explain --json`, { encoding: "utf-8", cwd: REPO_ROOT });
      const json = JSON.parse(out);
      expect(json.status).toBeDefined();
    });
  });

  describe("history command", () => {
    it("shows iteration history", () => {
      const out = execSync(`node ${CLI} history`, { encoding: "utf-8", cwd: REPO_ROOT });
      expect(out).toContain("records");
    });

    it("supports --json flag", () => {
      const out = execSync(`node ${CLI} history --json`, { encoding: "utf-8", cwd: REPO_ROOT });
      const json = JSON.parse(out);
      expect(json.count).toBeDefined();
    });
  });

  describe("config command", () => {
    it("shows run configuration", () => {
      const out = execSync(`node ${CLI} config`, { encoding: "utf-8", cwd: REPO_ROOT });
      expect(out).toContain("Run Configuration");
    });
  });

  describe("validate command", () => {
    it("validates configuration", () => {
      const out = execSync(`node ${CLI} validate --goal "test" --metric "test" --verify "echo test"`, { encoding: "utf-8", cwd: REPO_ROOT });
      expect(out).toContain("✓ Configuration is valid");
    });

    it("reports missing required fields", () => {
      expect(() => {
        execSync(`node ${CLI} validate`, { encoding: "utf-8", cwd: REPO_ROOT });
      }).toThrow("Missing required");
    });
  });

  describe("summary command", () => {
    it("shows aggregate stats", () => {
      const out = execSync(`node ${CLI} summary`, { encoding: "utf-8", cwd: REPO_ROOT });
      expect(out).toContain("Total iterations");
    });

    it("supports --json flag", () => {
      const out = execSync(`node ${CLI} summary --json`, { encoding: "utf-8", cwd: REPO_ROOT });
      const json = JSON.parse(out);
      expect(json.total_records).toBeDefined();
    });
  });

  describe("suggest command", () => {
    it("suggests goals from memory", () => {
      const out = execSync(`node ${CLI} suggest`, { encoding: "utf-8", cwd: REPO_ROOT });
      expect(out).toContain("Memory Patterns");
    });
  });

  describe("report command", () => {
    it("generates markdown report", () => {
      const out = execSync(`node ${CLI} report`, { encoding: "utf-8", cwd: REPO_ROOT });
      expect(out).toContain("# Auto Research Report");
    });
  });

  describe("init command", () => {
    const tmpDir = resolve(REPO_ROOT, ".autoresearch-test-init");
    const tmpState = resolve(tmpDir, ".autoresearch", "state.json");
    const tmpResults = resolve(tmpDir, "autoresearch-results.tsv");

    afterEach(() => {
      try { rmSync(tmpDir, { recursive: true }); } catch {}
    });

    it("creates state and results files", () => {
      execSync(`node ${CLI} init --goal "test goal" --metric "tests" --verify "npm test" --repo ${tmpDir}`, { encoding: "utf-8" });
      expect(existsSync(tmpState)).toBe(true);
      expect(existsSync(tmpResults)).toBe(true);
    });

    it("initializes with default mode foreground", () => {
      execSync(`node ${CLI} init --goal "test goal" --metric "tests" --verify "npm test" --repo ${tmpDir}`, { encoding: "utf-8" });
      const state = JSON.parse(readFileSync(tmpState, "utf-8"));
      expect(state.mode).toBe("foreground");
    });

    it("initializes with background mode", () => {
      execSync(`node ${CLI} init --goal "test goal" --metric "tests" --verify "npm test" --mode background --repo ${tmpDir}`, { encoding: "utf-8" });
      const state = JSON.parse(readFileSync(tmpState, "utf-8"));
      expect(state.mode).toBe("background");
    });

    it("supports --fresh-start to overwrite existing", () => {
      execSync(`node ${CLI} init --goal "first" --metric "m1" --verify "echo 1" --repo ${tmpDir}`, { encoding: "utf-8" });
      execSync(`node ${CLI} init --goal "second" --metric "m2" --verify "echo 2" --repo ${tmpDir} --fresh-start`, { encoding: "utf-8" });
      const state = JSON.parse(readFileSync(tmpState, "utf-8"));
      expect(state.goal).toBe("second");
    });
  });

  describe("record command", () => {
    const tmpDir = resolve(REPO_ROOT, ".autoresearch-test-record");
    const tmpState = resolve(tmpDir, ".autoresearch", "state.json");
    const tmpResults = resolve(tmpDir, "autoresearch-results.tsv");

    beforeEach(() => {
      try { rmSync(tmpDir, { recursive: true }); } catch {}
      execSync(`node ${CLI} init --goal "test" --metric "tests" --verify "echo test" --repo ${tmpDir}`, { encoding: "utf-8" });
    });

    afterEach(() => {
      try { rmSync(tmpDir, { recursive: true }); } catch {}
    });

    it("appends iteration to results", () => {
      execSync(`node ${CLI} record --decision keep --metric-value 42 --verify-status pass --guard-status pass --change-summary "test change" --repo ${tmpDir}`, { encoding: "utf-8" });
      const results = readFileSync(tmpResults, "utf-8");
      expect(results).toContain("keep");
      expect(results).toContain("42");
    });

    it("appends multiple iterations", () => {
      execSync(`node ${CLI} record --decision keep --metric-value 10 --verify-status pass --guard-status pass --change-summary "first" --repo ${tmpDir}`, { encoding: "utf-8" });
      execSync(`node ${CLI} record --decision keep --metric-value 20 --verify-status pass --guard-status pass --change-summary "second" --repo ${tmpDir}`, { encoding: "utf-8" });
      const results = readFileSync(tmpResults, "utf-8");
      const lines = results.trim().split("\n");
      expect(lines.length).toBeGreaterThanOrEqual(3); // header + 2 records
    });
  });

  describe("stop and resume commands", () => {
    const tmpDir = resolve(REPO_ROOT, ".autoresearch-test-stop");
    const tmpState = resolve(tmpDir, ".autoresearch", "state.json");

    beforeEach(() => {
      try { rmSync(tmpDir, { recursive: true }); } catch {}
      execSync(`node ${CLI} init --goal "test" --metric "tests" --verify "echo test" --mode background --repo ${tmpDir}`, { encoding: "utf-8" });
    });

    afterEach(() => {
      try { rmSync(tmpDir, { recursive: true }); } catch {}
    });

    it("sets stop_requested flag", () => {
      execSync(`node ${CLI} stop --repo ${tmpDir}`, { encoding: "utf-8" });
      const state = JSON.parse(readFileSync(tmpState, "utf-8"));
      expect(state.flags.stop_requested).toBe(true);
    });

    it("resumes background run", () => {
      execSync(`node ${CLI} stop --repo ${tmpDir}`, { encoding: "utf-8" });
      const out = execSync(`node ${CLI} resume --repo ${tmpDir} --json`, { encoding: "utf-8" });
      const json = JSON.parse(out);
      expect(json.status).toBe("resumed");
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
