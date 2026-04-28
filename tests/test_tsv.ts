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

    it("handles whitespace-only lines", () => {
      const tsv = "header\nrow1\n   \nrow2\n";
      expect(mod.countTsvDataRows(tsv)).toBe(2);
    });

    it("handles single row", () => {
      const tsv = "header\nrow1";
      expect(mod.countTsvDataRows(tsv)).toBe(1);
    });
  });

  describe("parseTsvFile edge cases", () => {
    it("handles extra tabs in rows", () => {
      const tsv = "col1\tcol2\nval1\tval2\tval3";
      const result = mod.parseTsvFile(tsv);
      expect(result[0].col1).toBe("val1");
      expect(result[0].col2).toBe("val2");
    });

    it("handles rows with fewer columns", () => {
      const tsv = "col1\tcol2\tcol3\nval1\tval2";
      const result = mod.parseTsvFile(tsv);
      expect(result[0].col1).toBe("val1");
      expect(result[0].col2).toBe("val2");
      expect(result[0].col3).toBe("");
    });

    it("handles newline at end", () => {
      const tsv = "col1\tcol2\nval1\tval2\n";
      const result = mod.parseTsvFile(tsv);
      expect(result.length).toBe(1);
    });

    it("handles multiple newlines at end", () => {
      const tsv = "col1\tcol2\nval1\tval2\n\n\n";
      const result = mod.parseTsvFile(tsv);
      expect(result.length).toBe(1);
    });

    it("preserves special characters in values", () => {
      const tsv = "col1\tcol2\nhello world\t@test#123";
      const result = mod.parseTsvFile(tsv);
      expect(result[0].col1).toBe("hello world");
      expect(result[0].col2).toBe("@test#123");
    });
  });
});
