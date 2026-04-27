#!/usr/bin/env node
import { existsSync } from "fs";
import { resolve } from "path";
import { printJson, resolveRepo } from "./helpers.js";
function usage() {
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
function parseArgs(args) {
    const result = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith("--")) {
            const key = args[i].slice(2);
            if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
                result[key] = args[++i];
            }
            else {
                result[key] = "true";
            }
        }
    }
    return result;
}
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
        usage();
        return 0;
    }
    const [cmd, ...cmdArgs] = args;
    const pargs = parseArgs(cmdArgs);
    // Group args by collecting multi-word options (like required-keep-labels)
    const grouped = {};
    for (const [k, v] of Object.entries(pargs)) {
        if (k === "required-keep-labels" || k === "required-stop-labels" || k === "labels") {
            grouped[k] = v.split(/\s+/).filter(Boolean);
        }
        else {
            grouped[k] = v;
        }
    }
    try {
        switch (cmd) {
            case "wizard": {
                const { buildSetupSummary } = await import("./wizard.js");
                const config = {
                    goal: grouped.goal,
                    scope: grouped.scope,
                    metric: grouped.metric,
                    direction: grouped.direction,
                    verify: grouped.verify,
                    guard: grouped.guard,
                    mode: grouped.mode,
                    iterations: grouped.iterations ? parseInt(grouped.iterations) : undefined,
                    duration: grouped.duration,
                    memory_path: grouped["memory-path"],
                    required_keep_labels: grouped["required-keep-labels"],
                    required_stop_labels: grouped["required-stop-labels"],
                    stop_condition: grouped["stop-condition"],
                    rollback_strategy: grouped["rollback-strategy"],
                };
                printJson(buildSetupSummary(grouped.repo, config));
                break;
            }
            case "init": {
                const { initializeRun } = await import("./run-manager.js");
                const config = {
                    goal: grouped.goal,
                    metric: grouped.metric,
                    direction: grouped.direction || "lower",
                    verify: grouped.verify,
                    mode: grouped.mode || "foreground",
                    scope: grouped.scope,
                    guard: grouped.guard,
                    iterations: grouped.iterations ? parseInt(grouped.iterations) : undefined,
                    duration: grouped.duration,
                    memory_path: grouped["memory-path"],
                    required_keep_labels: grouped["required-keep-labels"],
                    required_stop_labels: grouped["required-stop-labels"],
                    run_tag: grouped["run-tag"],
                    stop_condition: grouped["stop-condition"],
                    baseline: grouped.baseline,
                };
                const state = await initializeRun(grouped.repo, grouped["results-path"], grouped["state-path"], config, grouped["fresh-start"] === "true");
                printJson(state);
                break;
            }
            case "status": {
                const { buildSupervisorSnapshot } = await import("./run-manager.js");
                const snapshot = await buildSupervisorSnapshot(grouped.repo, grouped["results-path"], grouped["state-path"]);
                printJson(snapshot);
                break;
            }
            case "launch": {
                const { resolvePath } = await import("./helpers.js");
                const { initializeRun } = await import("./run-manager.js");
                const { writeFileSync } = await import("fs");
                const { LAUNCH_DEFAULT } = await import("./constants.js");
                const config = {
                    goal: grouped.goal,
                    metric: grouped.metric,
                    direction: grouped.direction || "lower",
                    verify: grouped.verify,
                    mode: "background",
                    scope: grouped.scope,
                    guard: grouped.guard,
                    iterations: grouped.iterations ? parseInt(grouped.iterations) : undefined,
                    duration: grouped.duration,
                    memory_path: grouped["memory-path"],
                    required_keep_labels: grouped["required-keep-labels"],
                    required_stop_labels: grouped["required-stop-labels"],
                    run_tag: grouped["run-tag"],
                    stop_condition: grouped["stop-condition"],
                    baseline: grouped.baseline,
                };
                const state = await initializeRun(grouped.repo, grouped["results-path"], grouped["state-path"], config, grouped["fresh-start"] === "true");
                const launchPath = resolvePath(grouped.repo, grouped["launch-path"], LAUNCH_DEFAULT);
                writeFileSync(launchPath, JSON.stringify({ run_id: state.run_id, goal: state.goal, mode: "background" }, null, 2) + "\n", "utf-8");
                printJson({ status: "launched", run_id: state.run_id, launch_path: launchPath });
                break;
            }
            case "complete": {
                const { completeRun } = await import("./run-manager.js");
                const state = await completeRun(grouped.repo, grouped["state-path"]);
                printJson({ status: "completed", run_id: state.run_id });
                break;
            }
            case "stop": {
                const { setStopRequested } = await import("./run-manager.js");
                const state = await setStopRequested(grouped.repo, grouped["state-path"]);
                printJson({ status: "stop_requested", run_id: state.run_id });
                break;
            }
            case "resume": {
                const { resumeBackgroundRun } = await import("./run-manager.js");
                const state = await resumeBackgroundRun(grouped.repo, grouped["state-path"]);
                printJson({ status: "resumed", run_id: state.run_id });
                break;
            }
            case "record": {
                const { appendIteration } = await import("./run-manager.js");
                const { normalizeResultStatus } = await import("./helpers.js");
                const vs = grouped["verify-status"] || "pass";
                const gs = grouped["guard-status"] || "skip";
                const state = await appendIteration(grouped.repo, grouped["results-path"], grouped["state-path"], grouped.decision, grouped["metric-value"], normalizeResultStatus(vs, "verify_status"), normalizeResultStatus(gs, "guard_status"), grouped.hypothesis, grouped["change-summary"], grouped.labels ? (Array.isArray(grouped.labels) ? grouped.labels : [grouped.labels]) : undefined, grouped.note, grouped.iteration ? parseInt(grouped.iteration) : undefined);
                printJson(state);
                break;
            }
            case "doctor": {
                const { VERSION, PACKAGE_NAME, SKILL_NAME } = await import("./constants.js");
                console.log(`${SKILL_NAME} ${VERSION} (${PACKAGE_NAME})`);
                console.log("Runtime: Node.js " + process.version);
                const base = resolveRepo(grouped.repo);
                const checks = [];
                checks.push({ name: "commands", ok: existsSync(resolve(base, "commands/autoresearch.md")) });
                checks.push({ name: "skills", ok: existsSync(resolve(base, "skills/autoresearch/SKILL.md")) });
                checks.push({ name: "hooks", ok: existsSync(resolve(base, "hooks/init.sh")) });
                for (const c of checks) {
                    console.log(`${c.name}: ${c.ok ? "OK" : "MISSING"}`);
                }
                const failed = checks.filter((c) => !c.ok).length;
                if (failed > 0) {
                    console.error(`${failed} checks failed. Reinstall with 'npm install -g opencode-autoresearch'.`);
                    return 1;
                }
                break;
            }
            default:
                console.error(`Unknown command: ${cmd}`);
                console.error("Run 'autoresearch --help' for usage.");
                return 1;
        }
    }
    catch (exc) {
        console.error(exc.message);
        return 2;
    }
    return 0;
}
main().then((code) => process.exit(code)).catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map