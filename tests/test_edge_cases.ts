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
  });
});
