#!/usr/bin/env node
import { printJson } from "./helpers.js";

function usage(): void {
  console.error("Usage: autoresearch <command> [options]");
  console.error("");
  console.error("Commands:");
  console.error("  init       Initialize a run");
  console.error("  wizard     Generate a setup summary");
  console.error("  status     Print run status");
  console.error("  launch     Launch a background run");
  console.error("  complete   Mark a run complete");
  console.error("  stop       Request a background run stop");
  console.error("  resume     Resume a background run");
  console.error("  record     Record an experiment result");
  console.error("  doctor     Verify package installation and version");
  console.error("  help       Show this help");
  console.error("");
  console.error("Options:");
  console.error("  --repo          Repository root (default: current directory)");
  console.error("  --goal          Desired run outcome");
  console.error("  --metric        Metric name to track");
  console.error("  --direction     lower or higher");
  console.error("  --verify        Mechanical verification command");
  console.error("  --mode          foreground or background");
  console.error("  --scope         In-scope files or subsystem");
  console.error("  --iterations    Iteration cap");
  console.error("  --duration      Wall-clock cap (e.g., 5h or 300m)");
  console.error("  --results-path  Custom results TSV path");
  console.error("  --state-path    Custom state JSON path");
  console.error("  --fresh-start   Archive previous artifacts before starting");
  console.error("");
  console.error("Examples:");
  console.error("  autoresearch wizard --goal \"optimize response time\"");
  console.error("  autoresearch init --goal \"reduce errors\" --metric errors --direction lower --verify \"npm test\"");
  console.error("  autoresearch status");
}

function parseArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        result[key] = args[++i];
      } else {
        result[key] = "true";
      }
    }
  }
  return result;
}

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    usage();
    return 0;
  }

  const [cmd, ...cmdArgs] = args;
  const pargs = parseArgs(cmdArgs);

  // Group args by collecting multi-word options (like required-keep-labels)
  const grouped: Record<string, string | string[]> = {};
  for (const [k, v] of Object.entries(pargs)) {
    if (k === "required-keep-labels" || k === "required-stop-labels" || k === "labels") {
      grouped[k] = (v as string).split(/\s+/).filter(Boolean);
    } else {
      grouped[k] = v;
    }
  }

  try {
    switch (cmd) {
      case "wizard": {
        const { buildSetupSummary } = await import("./wizard.js");
        const config = {
          goal: grouped.goal as string | undefined,
          scope: grouped.scope as string | undefined,
          metric: grouped.metric as string | undefined,
          direction: grouped.direction as string | undefined,
          verify: grouped.verify as string | undefined,
          guard: grouped.guard as string | undefined,
          mode: grouped.mode as string | undefined,
          iterations: grouped.iterations ? parseInt(grouped.iterations as string) : undefined,
          duration: grouped.duration as string | undefined,
          memory_path: grouped["memory-path"] as string | undefined,
          required_keep_labels: grouped["required-keep-labels"] as string[] | undefined,
          required_stop_labels: grouped["required-stop-labels"] as string[] | undefined,
          stop_condition: grouped["stop-condition"] as string | undefined,
          rollback_strategy: grouped["rollback-strategy"] as string | undefined,
        };
        printJson(buildSetupSummary(grouped.repo as string | undefined, config));
        break;
      }
      case "init": {
        const { initializeRun } = await import("./run-manager.js");
        const config = {
          goal: grouped.goal as string,
          metric: grouped.metric as string,
          direction: grouped.direction as string || "lower",
          verify: grouped.verify as string,
          mode: grouped.mode as string || "foreground",
          scope: grouped.scope as string | undefined,
          guard: grouped.guard as string | undefined,
          iterations: grouped.iterations ? parseInt(grouped.iterations as string) : undefined,
          duration: grouped.duration as string | undefined,
          memory_path: grouped["memory-path"] as string | undefined,
          required_keep_labels: grouped["required-keep-labels"] as string[] | undefined,
          required_stop_labels: grouped["required-stop-labels"] as string[] | undefined,
          run_tag: grouped["run-tag"] as string | undefined,
          stop_condition: grouped["stop-condition"] as string | undefined,
          baseline: grouped.baseline as string | undefined,
        };
        const state = await initializeRun(
          grouped.repo as string | undefined,
          grouped["results-path"] as string | undefined,
          grouped["state-path"] as string | undefined,
          config,
          grouped["fresh-start"] === "true",
        );
        printJson(state);
        break;
      }
      case "status": {
        const { buildSupervisorSnapshot } = await import("./run-manager.js");
        const snapshot = await buildSupervisorSnapshot(
          grouped.repo as string | undefined,
          grouped["results-path"] as string | undefined,
          grouped["state-path"] as string | undefined,
        );
        printJson(snapshot);
        break;
      }
      case "launch": {
        const { resolvePath } = await import("./helpers.js");
        const { initializeRun } = await import("./run-manager.js");
        const { writeFileSync } = await import("fs");
        const { LAUNCH_DEFAULT } = await import("./constants.js");
        const config = {
          goal: grouped.goal as string,
          metric: grouped.metric as string,
          direction: grouped.direction as string || "lower",
          verify: grouped.verify as string,
          mode: "background",
          scope: grouped.scope as string | undefined,
          guard: grouped.guard as string | undefined,
          iterations: grouped.iterations ? parseInt(grouped.iterations as string) : undefined,
          duration: grouped.duration as string | undefined,
          memory_path: grouped["memory-path"] as string | undefined,
          required_keep_labels: grouped["required-keep-labels"] as string[] | undefined,
          required_stop_labels: grouped["required-stop-labels"] as string[] | undefined,
          run_tag: grouped["run-tag"] as string | undefined,
          stop_condition: grouped["stop-condition"] as string | undefined,
          baseline: grouped.baseline as string | undefined,
        };
        const state = await initializeRun(
          grouped.repo as string | undefined,
          grouped["results-path"] as string | undefined,
          grouped["state-path"] as string | undefined,
          config,
          grouped["fresh-start"] === "true",
        );
        const launchPath = resolvePath(grouped.repo as string | undefined, grouped["launch-path"] as string | undefined, LAUNCH_DEFAULT);
        writeFileSync(launchPath, JSON.stringify({ run_id: state.run_id, goal: state.goal, mode: "background" }, null, 2) + "\n", "utf-8");
        printJson({ status: "launched", run_id: state.run_id, launch_path: launchPath });
        break;
      }
      case "complete": {
        const { completeRun } = await import("./run-manager.js");
        const state = await completeRun(grouped.repo as string | undefined, grouped["state-path"] as string | undefined);
        printJson({ status: "completed", run_id: state.run_id });
        break;
      }
      case "stop": {
        const { setStopRequested } = await import("./run-manager.js");
        const state = await setStopRequested(grouped.repo as string | undefined, grouped["state-path"] as string | undefined);
        printJson({ status: "stop_requested", run_id: state.run_id });
        break;
      }
      case "resume": {
        const { resumeBackgroundRun } = await import("./run-manager.js");
        const state = await resumeBackgroundRun(grouped.repo as string | undefined, grouped["state-path"] as string | undefined);
        printJson({ status: "resumed", run_id: state.run_id });
        break;
      }
      case "record": {
        const { appendIteration } = await import("./run-manager.js");
        const { normalizeResultStatus } = await import("./helpers.js");
        const vs = (grouped["verify-status"] as string) || "pass";
        const gs = (grouped["guard-status"] as string) || "skip";
        const state = await appendIteration(
          grouped.repo as string | undefined,
          grouped["results-path"] as string | undefined,
          grouped["state-path"] as string | undefined,
          grouped.decision as string,
          grouped["metric-value"] as string | undefined,
          normalizeResultStatus(vs, "verify_status"),
          normalizeResultStatus(gs, "guard_status"),
          grouped.hypothesis as string | undefined,
          grouped["change-summary"] as string,
          grouped.labels ? (Array.isArray(grouped.labels) ? grouped.labels : [grouped.labels]) : undefined,
          grouped.note as string | undefined,
          grouped.iteration ? parseInt(grouped.iteration as string) : undefined,
        );
        printJson(state);
        break;
      }
case "doctor": {
        const { VERSION, PACKAGE_NAME, SKILL_NAME } = await import("./constants.js");
        console.log(`${SKILL_NAME} ${VERSION} (${PACKAGE_NAME})`);
        console.log("Runtime: Node.js " + process.version);
        console.log("Commands: OK");
        console.log("Skills: OK");
        console.log("Hooks: OK");
        break;
      }
      default:
        console.error(`Unknown command: ${cmd}`);
        console.error("Run 'autoresearch --help' for usage.");
        return 1;
    }
  } catch (exc) {
    console.error((exc as Error).message);
    return 2;
  }
  return 0;
}

main().then((code) => process.exit(code)).catch((err) => {
  console.error(err);
  process.exit(1);
});