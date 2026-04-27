import { initializeRun } from "./run-manager.js";
import { printJson } from "./helpers.js";
async function main() {
    const args = process.argv.slice(2);
    const get = (name) => args[args.indexOf(`--${name}`) + 1] ?? undefined;
    const has = (name) => args.includes(`--${name}`);
    const goal = get("goal");
    const metric = get("metric");
    const direction = get("direction") ?? "lower";
    const verify = get("verify");
    const mode = get("mode") ?? "foreground";
    const repo = get("repo");
    if (!goal || !metric || !verify) {
        console.error("--goal, --metric, and --verify are required");
        return 2;
    }
    const config = {
        goal,
        metric,
        direction,
        verify,
        mode,
        scope: get("scope"),
        guard: get("guard"),
        iterations: get("iterations") ? parseInt(get("iterations")) : undefined,
        duration: get("duration"),
        memory_path: get("memory-path"),
        required_keep_labels: get("required-keep-labels")?.split(" "),
        required_stop_labels: get("required-stop-labels")?.split(" "),
        run_tag: get("run-tag"),
        stop_condition: get("stop-condition"),
        baseline: get("baseline"),
    };
    try {
        const state = await initializeRun(repo, get("results-path"), get("state-path"), config, has("fresh-start"));
        printJson(state);
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
//# sourceMappingURL=init.js.map