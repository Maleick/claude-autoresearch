import { resolve } from "path";
import { fileURLToPath } from "url";
import { writeFileSync, unlinkSync, existsSync, mkdirSync, rmSync } from "fs";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");

async function importHelpers() {
  return await import(resolve(REPO_ROOT, "dist/helpers.js"));
}

describe("normalizeDirection", () => {
  let mod: any;
  beforeAll(async () => { mod = await importHelpers(); });

  it("defaults to lower when undefined", () => {
    expect(mod.normalizeDirection(undefined)).toBe("lower");
  });
  it("defaults to lower when null", () => {
    expect(mod.normalizeDirection(null)).toBe("lower");
  });
  it("lower returns lower", () => {
    expect(mod.normalizeDirection("lower")).toBe("lower");
  });
  it("higher returns higher", () => {
    expect(mod.normalizeDirection("higher")).toBe("higher");
  });
  it("trims whitespace", () => {
    expect(mod.normalizeDirection("  lower  ")).toBe("lower");
  });
  it("throws on invalid", () => {
    expect(() => mod.normalizeDirection("sideways")).toThrow();
  });
});

describe("normalizeMode", () => {
  let mod: any;
  beforeAll(async () => { mod = await importHelpers(); });

  it("defaults to foreground when undefined", () => {
    expect(mod.normalizeMode(undefined)).toBe("foreground");
  });
  it("foreground returns foreground", () => {
    expect(mod.normalizeMode("foreground")).toBe("foreground");
  });
  it("background returns background", () => {
    expect(mod.normalizeMode("background")).toBe("background");
  });
  it("throws on unsupported mode", () => {
    expect(() => mod.normalizeMode("detached")).toThrow();
  });
});

describe("parseDurationSeconds", () => {
  let mod: any;
  beforeAll(async () => { mod = await importHelpers(); });

  it("returns null for undefined", () => {
    expect(mod.parseDurationSeconds(undefined)).toBeNull();
  });
  it("returns null for null", () => {
    expect(mod.parseDurationSeconds(null)).toBeNull();
  });
  it("parses raw number as seconds", () => {
    expect(mod.parseDurationSeconds("300")).toBe(300);
  });
  it("returns null for empty string", () => {
    expect(mod.parseDurationSeconds("")).toBeNull();
  });
  it("parses seconds", () => {
    expect(mod.parseDurationSeconds("5s")).toBe(5);
  });
  it("parses minutes", () => {
    expect(mod.parseDurationSeconds("3m")).toBe(180);
  });
  it("parses hours", () => {
    expect(mod.parseDurationSeconds("2h")).toBe(7200);
  });
  it("parses days", () => {
    expect(mod.parseDurationSeconds("1d")).toBe(86400);
  });
  it("parses compound durations", () => {
    expect(mod.parseDurationSeconds("1h30m")).toBe(5400);
  });
  it("parses compound with all units", () => {
    expect(mod.parseDurationSeconds("1d6h30m15s")).toBe(86400 + 21600 + 1800 + 15);
  });
  it("throws on zero", () => {
    expect(() => mod.parseDurationSeconds("0")).toThrow();
  });
  it("throws on negative", () => {
    expect(() => mod.parseDurationSeconds("-5m")).toThrow();
  });
  it("throws on invalid format", () => {
    expect(() => mod.parseDurationSeconds("abc")).toThrow();
  });
  it("throws on non-contiguous units", () => {
    expect(() => mod.parseDurationSeconds("1h30x")).toThrow();
  });
  it("throws on zero total from compound", () => {
    expect(() => mod.parseDurationSeconds("0h0m")).toThrow();
  });
});

describe("normalizeResultStatus", () => {
  let mod: any;
  beforeAll(async () => { mod = await importHelpers(); });

  it("pass returns pass", () => {
    expect(mod.normalizeResultStatus("pass", "verify_status")).toBe("pass");
  });
  it("fail returns fail", () => {
    expect(mod.normalizeResultStatus("fail", "verify_status")).toBe("fail");
  });
  it("skip returns skip", () => {
    expect(mod.normalizeResultStatus("skip", "verify_status")).toBe("skip");
  });
  it("throws on missing value", () => {
    expect(() => mod.normalizeResultStatus(null, "verify_status")).toThrow("Missing verify_status");
  });
  it("throws on unsupported value", () => {
    expect(() => mod.normalizeResultStatus("maybe", "guard_status")).toThrow("Unsupported guard_status");
  });
});

describe("normalizeLabels", () => {
  let mod: any;
  beforeAll(async () => { mod = await importHelpers(); });

  it("returns empty array for undefined", () => {
    expect(mod.normalizeLabels(undefined)).toEqual([]);
  });
  it("returns empty array for null", () => {
    expect(mod.normalizeLabels(null)).toEqual([]);
  });
  it("returns empty array for empty string", () => {
    expect(mod.normalizeLabels("")).toEqual([]);
  });
  it("returns empty array for empty array", () => {
    expect(mod.normalizeLabels([])).toEqual([]);
  });
  it("splits comma string", () => {
    expect(mod.normalizeLabels("a,b,c")).toEqual(["a", "b", "c"]);
  });
  it("trims whitespace", () => {
    expect(mod.normalizeLabels(" a , b , c ")).toEqual(["a", "b", "c"]);
  });
  it("deduplicates", () => {
    expect(mod.normalizeLabels("a,b,a")).toEqual(["a", "b"]);
  });
  it("filters empty values", () => {
    expect(mod.normalizeLabels("a,,b")).toEqual(["a", "b"]);
  });
  it("normalizes arrays", () => {
    expect(mod.normalizeLabels([" a ", " b "])).toEqual(["a", "b"]);
  });
  it("preserves order of first occurrence", () => {
    expect(mod.normalizeLabels(["b", "a", "b"])).toEqual(["b", "a"]);
  });
});

describe("missingRequiredLabels", () => {
  let mod: any;
  beforeAll(async () => { mod = await importHelpers(); });

  it("returns empty when all required are present", () => {
    expect(mod.missingRequiredLabels(["a", "b", "c"], ["a", "b"])).toEqual([]);
  });
  it("returns missing labels", () => {
    expect(mod.missingRequiredLabels(["a"], ["a", "b"])).toEqual(["b"]);
  });
  it("returns all when none match", () => {
    expect(mod.missingRequiredLabels(["x"], ["a", "b"])).toEqual(["a", "b"]);
  });
  it("returns empty for empty required", () => {
    expect(mod.missingRequiredLabels(["a"], [])).toEqual([]);
  });
});

describe("resolvePath", () => {
  let mod: any;
  beforeAll(async () => { mod = await importHelpers(); });

  it("uses value when absolute", () => {
    const result = mod.resolvePath(undefined, "/abs/path", "default.txt");
    expect(result).toBe("/abs/path");
  });
  it("resolves relative value against repo", () => {
    const result = mod.resolvePath("/my/repo", "rel/path", "default.txt");
    expect(result).toBe(resolve("/my/repo", "rel/path"));
  });
  it("falls back to default", () => {
    const result = mod.resolvePath(undefined, undefined, "default.txt");
    expect(result).toBe(resolve(".", "default.txt"));
  });
});

describe("readJsonFile", () => {
  let mod: any;
  beforeAll(async () => { mod = await importHelpers(); });

  const testFile = resolve(REPO_ROOT, ".autoresearch-test-read.json");

  afterEach(() => {
    try { unlinkSync(testFile); } catch {}
  });

  it("throws missing file error for nonexistent file", () => {
    expect(() => mod.readJsonFile("/nonexistent/autoresearch-test.json")).toThrow("Missing file");
  });

  it("reads valid JSON", () => {
    writeFileSync(testFile, JSON.stringify({ a: 1 }), "utf-8");
    expect(mod.readJsonFile(testFile)).toEqual({ a: 1 });
  });

  it("throws on invalid JSON", () => {
    writeFileSync(testFile, "not json", "utf-8");
    expect(() => mod.readJsonFile(testFile)).toThrow("Invalid JSON");
  });
});

describe("utcNow", () => {
  let mod: any;
  beforeAll(async () => { mod = await importHelpers(); });

  it("returns a string ending with Z", () => {
    expect(mod.utcNow().endsWith("Z")).toBe(true);
  });
  it("returns ISO-like timestamp", () => {
    expect(mod.utcNow()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});

describe("inferVerifyCommand", () => {
  let mod: any;
  beforeAll(async () => { mod = await importHelpers(); });

  const tmpBase = resolve(REPO_ROOT, ".autoresearch-test-infer");

  function createDir(name: string): string {
    const d = resolve(tmpBase, name);
    mkdirSync(d, { recursive: true });
    return d;
  }

  function cleanup() {
    try { rmSync(tmpBase, { recursive: true }); } catch {}
  }

  beforeAll(cleanup);
  afterAll(cleanup);

  it("returns '<set verify command>' for cwd with no test setup", () => {
    const result = mod.inferVerifyCommand("/tmp");
    expect(result).toBe("<set verify command>");
  });
  it("returns 'npm test' when package.json has test script", () => {
    const result = mod.inferVerifyCommand(resolve(REPO_ROOT));
    expect(result).toBe("npm test");
  });
  it("returns 'npm test' when package.json exists with any test script", () => {
    const d = createDir("with-pkg-test");
    writeFileSync(resolve(d, "package.json"), JSON.stringify({ scripts: { test: "jest" } }), "utf-8");
    expect(mod.inferVerifyCommand(d)).toBe("npm test");
  });
  it("returns '<set verify command>' when package.json has no test script", () => {
    const d = createDir("with-pkg-no-test");
    writeFileSync(resolve(d, "package.json"), JSON.stringify({}), "utf-8");
    expect(mod.inferVerifyCommand(d)).toBe("<set verify command>");
  });
  it("returns 'make test' when Makefile exists", () => {
    const d = createDir("with-makefile");
    writeFileSync(resolve(d, "Makefile"), "test:\n\techo test\n", "utf-8");
    expect(mod.inferVerifyCommand(d)).toBe("make test");
  });
  it("returns 'go test' when go.mod exists", () => {
    const d = createDir("with-gomod");
    writeFileSync(resolve(d, "go.mod"), "module test\n", "utf-8");
    expect(mod.inferVerifyCommand(d)).toBe("go test ./...");
  });
  it("returns 'cargo test' when Cargo.toml exists", () => {
    const d = createDir("with-cargo");
    writeFileSync(resolve(d, "Cargo.toml"), "[package]\n", "utf-8");
    expect(mod.inferVerifyCommand(d)).toBe("cargo test");
  });
  it("returns 'pytest' when pytest.ini exists", () => {
    const d = createDir("with-pytest");
    writeFileSync(resolve(d, "pytest.ini"), "[pytest]\n", "utf-8");
    expect(mod.inferVerifyCommand(d)).toBe("pytest");
  });
  it("returns 'pytest' when tests/ dir exists without other indicators", () => {
    const d = createDir("with-tests-dir");
    mkdirSync(resolve(d, "tests"));
    expect(mod.inferVerifyCommand(d)).toBe("pytest");
  });
  it("prioritizes package.json over Makefile", () => {
    const d = createDir("pkg-over-makefile");
    writeFileSync(resolve(d, "package.json"), JSON.stringify({ scripts: { test: "jest" } }), "utf-8");
    writeFileSync(resolve(d, "Makefile"), "test:\n\techo\n", "utf-8");
    expect(mod.inferVerifyCommand(d)).toBe("npm test");
  });
});
