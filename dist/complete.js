import { completeRun, buildSupervisorSnapshot } from "./run-manager.js";
import { resolvePath, printJson } from "./helpers.js";
import { REPORT_DEFAULT } from "./constants.js";
import { writeFileSync } from "fs";
async function main() {
    const args = process.argv.slice(2);
    const get = (name) => args[args.indexOf(`--${name}`) + 1] ?? undefined;
    try {
        const state = await completeRun(get("repo"), get("state-path"));
        printJson({ status: "completed", run_id: state.run_id });
        const reportPath = resolvePath(get("repo") ?? ".", get("report-path"), REPORT_DEFAULT);
        await buildSupervisorSnapshot(get("repo"), get("results-path"), get("state-path"));
        const lines = [
            "# Auto Research Report",
            "",
            `Run: ${state.run_id}`,
            `Status: ${state.status}`,
            `Goal: ${state.goal}`,
            `Metric: ${state.metric?.name ?? "unknown"}`,
            `Iterations: ${state.stats?.total_iterations ?? 0}`,
            `Kept: ${state.stats?.kept ?? 0} | Discarded: ${state.stats?.discarded ?? 0}`,
        ];
        writeFileSync(reportPath, lines.join("\n") + "\n", "utf-8");
        printJson({ report_path: reportPath });
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
//# sourceMappingURL=complete.js.map