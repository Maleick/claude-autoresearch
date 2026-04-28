import { resolve } from "path";
import { fileURLToPath } from "url";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");

describe("Index Exports", () => {
  it("exports all public APIs", async () => {
    const index = await import(resolve(REPO_ROOT, "dist/index.js"));
    expect(index.VERSION).toBeDefined();
    expect(index.PACKAGE_NAME).toBeDefined();
    expect(index.SKILL_NAME).toBeDefined();
    expect(index.PRODUCT_BRAND).toBeDefined();
  });

  it("exports type definitions", async () => {
    const types = await import(resolve(REPO_ROOT, "dist/types.js"));
    expect(types).toBeDefined();
  });
});