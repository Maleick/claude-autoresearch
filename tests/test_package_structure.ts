import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");

function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, unknown>;
}

describe("package.json", () => {
  it("declares name as opencode-autoresearch", () => {
    expect(readJson(resolve(REPO_ROOT, "package.json")).name).toBe("opencode-autoresearch");
  });

  it("has bin entry for autoresearch", () => {
    const bin = readJson(resolve(REPO_ROOT, "package.json")).bin as Record<string, string>;
    expect(bin.autoresearch).toBeDefined();
  });

  it("has type module", () => {
    expect(readJson(resolve(REPO_ROOT, "package.json")).type).toBe("module");
  });

  it("files array excludes scripts/", () => {
    const files = readJson(resolve(REPO_ROOT, "package.json")).files as string[];
    expect(files).not.toContain("scripts/");
  });

  it("has build and typecheck scripts", () => {
    const scripts = readJson(resolve(REPO_ROOT, "package.json")).scripts as Record<string, string>;
    expect(scripts.build).toBeDefined();
    expect(scripts.typecheck).toBeDefined();
  });
});

describe(".opencode-plugin/plugin.json", () => {
  it("declares name as autoresearch", () => {
    expect(readJson(resolve(REPO_ROOT, ".opencode-plugin/plugin.json")).name).toBe("autoresearch");
  });

  it("declares skills path", () => {
    expect(readJson(resolve(REPO_ROOT, ".opencode-plugin/plugin.json")).skills).toBe("./skills/");
  });

  it("declares commands path", () => {
    expect(readJson(resolve(REPO_ROOT, ".opencode-plugin/plugin.json")).commands).toBe("./commands/");
  });
});

describe("commands/", () => {
  it("has main autoresearch.md", () => {
    const content = readFileSync(resolve(REPO_ROOT, "commands/autoresearch.md"), "utf-8");
    expect(content).toContain("/autoresearch");
  });

  it("has mode command files", () => {
    const modes = ["plan", "debug", "fix", "learn", "predict", "scenario", "security", "ship"];
    for (const mode of modes) {
      const path = resolve(REPO_ROOT, `commands/autoresearch/${mode}.md`);
      expect(existsSync(path)).toBe(true);
      const content = readFileSync(path, "utf-8");
      expect(content).toContain(`autoresearch:${mode}`);
    }
  });
});

describe("skills/autoresearch/", () => {
  it("has SKILL.md", () => {
    const content = readFileSync(resolve(REPO_ROOT, "skills/autoresearch/SKILL.md"), "utf-8");
    expect(content).toContain("Auto Research");
    expect(content).toContain("/autoresearch");
  });

  it("has loop-workflow.md reference", () => {
    expect(existsSync(resolve(REPO_ROOT, "skills/autoresearch/references/loop-workflow.md"))).toBe(true);
  });

  it("has core-principles.md reference", () => {
    expect(existsSync(resolve(REPO_ROOT, "skills/autoresearch/references/core-principles.md"))).toBe(true);
  });
});

describe("hooks/", () => {
  it("has init.sh", () => {
    const content = readFileSync(resolve(REPO_ROOT, "hooks/init.sh"), "utf-8");
    expect(content).toContain("#!/bin/sh");
  });

  it("has status.sh", () => {
    const content = readFileSync(resolve(REPO_ROOT, "hooks/status.sh"), "utf-8");
    expect(content).toContain("state.json");
  });

  it("has stop.sh", () => {
    const content = readFileSync(resolve(REPO_ROOT, "hooks/stop.sh"), "utf-8");
    expect(content).toContain("stop_requested");
  });
});

describe("No legacy Claude/Codex artifacts remain", () => {
  it("no plugins/codex-autoresearch directory", () => {
    expect(existsSync(resolve(REPO_ROOT, "plugins/codex-autoresearch"))).toBe(false);
  });

  it("no plugins/autoresearch directory", () => {
    expect(existsSync(resolve(REPO_ROOT, "plugins/autoresearch"))).toBe(false);
  });

  it("no .claude-plugin directory", () => {
    expect(existsSync(resolve(REPO_ROOT, ".claude-plugin"))).toBe(false);
  });

  it("no agents directory", () => {
    expect(existsSync(resolve(REPO_ROOT, "agents"))).toBe(false);
  });

  it("no root SKILL.md", () => {
    expect(existsSync(resolve(REPO_ROOT, "SKILL.md"))).toBe(false);
  });

  it("no Python scripts in scripts/", () => {
    const scriptsDir = resolve(REPO_ROOT, "scripts");
    if (existsSync(scriptsDir)) {
      const files = (() => {
        try {
          const { readdirSync } = require("fs");
          return readdirSync(scriptsDir).filter((f: string) => f.endsWith(".py"));
        } catch {
          return [];
        }
      })();
      expect(files.length).toBe(0);
    }
  });
});

describe("docs/", () => {
  it("has OPENCODE_INSTALL.md", () => {
    const content = readFileSync(resolve(REPO_ROOT, "docs/OPENCODE_INSTALL.md"), "utf-8");
    expect(content).toContain("opencode-autoresearch");
    expect(content).toContain("/autoresearch");
  });

  it("has RELEASE.md", () => {
    const content = readFileSync(resolve(REPO_ROOT, "docs/RELEASE.md"), "utf-8");
    expect(content).toContain("npm publish");
  });
});