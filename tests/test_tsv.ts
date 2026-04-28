import { resolve } from "path";
import { fileURLToPath } from "url";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");

async function importHelpers() {
  return await import(resolve(REPO_ROOT, "dist/helpers.js"));
}

describe("TSV Utilities", () => {
  let mod: any;
  beforeAll(async () => { mod = await importHelpers(); });

  describe("parseTsvFile", () => {
    it("parses simple TSV", () => {
      const tsv = "col1\tcol2\nval1\tval2";
      const result = mod.parseTsvFile(tsv);
      expect(result).toEqual([{ col1: "val1", col2: "val2" }]);
    });

    it("handles empty values", () => {
      const tsv = "col1\tcol2\n\tval2";
      const result = mod.parseTsvFile(tsv);
      expect(result[0].col1).toBe("");
      expect(result[0].col2).toBe("val2");
    });

    it("handles multiple rows", () => {
      const tsv = "col1\tcol2\na\tb\nc\td";
      const result = mod.parseTsvFile(tsv);
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ col1: "a", col2: "b" });
      expect(result[1]).toEqual({ col1: "c", col2: "d" });
    });

    it("returns empty array for header-only", () => {
      const tsv = "col1\tcol2";
      const result = mod.parseTsvFile(tsv);
      expect(result).toEqual([]);
    });

    it("returns empty array for empty string", () => {
      const result = mod.parseTsvFile("");
      expect(result).toEqual([]);
    });
  });

  describe("countTsvDataRows", () => {
    it("counts data rows", () => {
      const tsv = "header\nrow1\nrow2";
      expect(mod.countTsvDataRows(tsv)).toBe(2);
    });

    it("returns 0 for header-only", () => {
      const tsv = "header";
      expect(mod.countTsvDataRows(tsv)).toBe(0);
    });

    it("returns 0 for empty string", () => {
      expect(mod.countTsvDataRows("")).toBe(0);
    });

    it("ignores empty lines", () => {
      const tsv = "header\nrow1\n\nrow2\n";
      expect(mod.countTsvDataRows(tsv)).toBe(2);
    });
  });
});
