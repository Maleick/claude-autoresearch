import { resolve } from "path";
import { fileURLToPath } from "url";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");

describe("Performance Benchmarks", () => {
  it("parses 1000 iterations in under 100ms", async () => {
    const { parseTsvFile } = await import(resolve(REPO_ROOT, "dist/helpers.js"));
    const lines = ["timestamp\titeration\tdecision\tmetric_value\tverify_status\tguard_status\thypothesis\tchange_summary\tlabels\tnote"];
    for (let i = 1; i <= 1000; i++) {
      lines.push(`2024-01-01T00:00:00Z\t${i}\tkeep\t${i}\tpass\tpass\thyp\tchange\tlabel\tnote`);
    }
    const tsv = lines.join("\n");
    
    const start = performance.now();
    const result = parseTsvFile(tsv);
    const elapsed = performance.now() - start;
    
    expect(result.length).toBe(1000);
    expect(elapsed).toBeLessThan(100);
  });

  it("builds subagent pool in under 50ms", async () => {
    const { buildSubagentPoolPlan } = await import(resolve(REPO_ROOT, "dist/subagent-pool.js"));
    
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      buildSubagentPoolPlan({ goal: "test goal", mode: "foreground" });
    }
    const elapsed = performance.now() - start;
    
    expect(elapsed).toBeLessThan(50);
  });

  it("resolves paths in under 10ms", async () => {
    const { resolvePath } = await import(resolve(REPO_ROOT, "dist/helpers.js"));
    
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      resolvePath(undefined, "rel/path", "default.txt");
    }
    const elapsed = performance.now() - start;
    
    expect(elapsed).toBeLessThan(10);
  });
});
