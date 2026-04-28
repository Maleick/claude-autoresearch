import { resolve } from "path";
import { fileURLToPath } from "url";
import { writeFileSync, unlinkSync } from "fs";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");

async function importHelpers() {
  return await import(resolve(REPO_ROOT, "dist/helpers.js"));
}

describe("Edge Cases", () => {
  describe("parseDurationSeconds", () => {
    let mod: any;
    beforeAll(async () => { mod = await importHelpers(); });

    it("handles whitespace-only string", () => {
      expect(mod.parseDurationSeconds("   ")).toBeNull();
    });

    it("handles mixed case units", () => {
      expect(mod.parseDurationSeconds("1H")).toBe(3600);
      expect(mod.parseDurationSeconds("30M")).toBe(1800);
    });

    it("throws on decimal values", () => {
      expect(() => mod.parseDurationSeconds("1.5h")).toThrow();
    });

    it("handles large values", () => {
      expect(mod.parseDurationSeconds("999d")).toBe(999 * 86400);
    });
  });

  describe("normalizeLabels", () => {
    let mod: any;
    beforeAll(async () => { mod = await importHelpers(); });

    it("handles numbers by converting to string", () => {
      expect(mod.normalizeLabels(123 as any)).toEqual(["123"]);
    });

    it("handles nested arrays by flattening", () => {
      expect(mod.normalizeLabels([["a"], ["b"]] as any)).toEqual(["a", "b"]);
    });
  });

  describe("readJsonFile", () => {
    let mod: any;
    beforeAll(async () => { mod = await importHelpers(); });

    it("throws on empty file", () => {
      const tmpFile = resolve(REPO_ROOT, ".autoresearch-test-empty.json");
      writeFileSync(tmpFile, "", "utf-8");
      expect(() => mod.readJsonFile(tmpFile)).toThrow("Invalid JSON");
      unlinkSync(tmpFile);
    });

    it("throws on malformed JSON", () => {
      const tmpFile = resolve(REPO_ROOT, ".autoresearch-test-malformed.json");
      writeFileSync(tmpFile, "{invalid", "utf-8");
      expect(() => mod.readJsonFile(tmpFile)).toThrow("Invalid JSON");
      unlinkSync(tmpFile);
    });
  });

  describe("normalizeDirection", () => {
    let mod: any;
    beforeAll(async () => { mod = await importHelpers(); });

    it("defaults empty string to lower", () => {
      expect(mod.normalizeDirection("")).toBe("lower");
    });

    it("handles mixed case valid values", () => {
      expect(mod.normalizeDirection("LoWeR")).toBe("lower");
      expect(mod.normalizeDirection("HiGhEr")).toBe("higher");
    });
  });

  describe("normalizeMode", () => {
    let mod: any;
    beforeAll(async () => { mod = await importHelpers(); });

    it("defaults empty string to foreground", () => {
      expect(mod.normalizeMode("")).toBe("foreground");
    });

    it("handles mixed case valid values", () => {
      expect(mod.normalizeMode("FoReGrOuNd")).toBe("foreground");
      expect(mod.normalizeMode("BaCkGrOuNd")).toBe("background");
    });
  });

  describe("parseDurationSeconds edge cases", () => {
    let mod: any;
    beforeAll(async () => { mod = await importHelpers(); });

    it("parses large numbers", () => {
      expect(mod.parseDurationSeconds("999999")).toBe(999999);
    });

    it("throws on negative compound", () => {
      expect(() => mod.parseDurationSeconds("-1h30m")).toThrow();
    });

    it("throws on space before unit", () => {
      expect(() => mod.parseDurationSeconds("1 h")).toThrow();
    });
  });

  describe("normalizeResultStatus", () => {
    let mod: any;
    beforeAll(async () => { mod = await importHelpers(); });

    it("normalizes pass", () => {
      expect(mod.normalizeResultStatus("pass", "status")).toBe("pass");
    });

    it("normalizes fail", () => {
      expect(mod.normalizeResultStatus("fail", "status")).toBe("fail");
    });

    it("normalizes skip", () => {
      expect(mod.normalizeResultStatus("skip", "status")).toBe("skip");
    });

    it("throws on missing value", () => {
      expect(() => mod.normalizeResultStatus(null, "status")).toThrow("Missing status");
    });

    it("throws on invalid value", () => {
      expect(() => mod.normalizeResultStatus("unknown", "status")).toThrow("Unsupported status");
    });
  });

  describe("missingRequiredLabels", () => {
    let mod: any;
    beforeAll(async () => { mod = await importHelpers(); });

    it("returns empty when all present", () => {
      expect(mod.missingRequiredLabels(["a", "b"], ["a"])).toEqual([]);
    });

    it("returns missing labels", () => {
      expect(mod.missingRequiredLabels(["a"], ["a", "b"])).toEqual(["b"]);
    });

    it("returns all when none present", () => {
      expect(mod.missingRequiredLabels(["x"], ["a", "b"])).toEqual(["a", "b"]);
    });

    it("returns empty for empty required", () => {
      expect(mod.missingRequiredLabels(["a"], [])).toEqual([]);
    });
  });

  describe("countTsvDataRows", () => {
    let mod: any;
    beforeAll(async () => { mod = await importHelpers(); });

    it("counts multiple rows", () => {
      expect(mod.countTsvDataRows("h\n1\n2\n3")).toBe(3);
    });

    it("returns 0 for empty content", () => {
      expect(mod.countTsvDataRows("")).toBe(0);
    });

    it("ignores whitespace lines", () => {
      expect(mod.countTsvDataRows("h\n1\n   \n2")).toBe(2);
    });
  });
});
