#!/usr/bin/env node
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
function runCommand(script, args) {
    return new Promise((resolve) => {
        const child = spawn("node", [script, ...args], { stdio: "inherit" });
        child.on("close", (code) => resolve(code ?? 0));
    });
}
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("Usage: autoresearch <command> [options]");
        console.error("Commands: init, wizard, status, launch, complete, stop, resume, record");
        return 1;
    }
    const [cmd, ...rest] = args;
    const distDir = __dirname + "/..";
    switch (cmd) {
        case "init": return runCommand(distDir + "/dist/init.js", rest);
        case "wizard": return runCommand(distDir + "/dist/wizard.js", rest);
        case "status": return runCommand(distDir + "/dist/status.js", rest);
        case "launch": return runCommand(distDir + "/dist/launch.js", rest);
        case "complete": return runCommand(distDir + "/dist/complete.js", rest);
        case "stop": return runCommand(distDir + "/dist/stop.js", rest);
        case "resume": return runCommand(distDir + "/dist/resume.js", rest);
        case "record": return runCommand(distDir + "/dist/record.js", rest);
        default:
            console.error(`Unknown command: ${cmd}`);
            return 1;
    }
}
main().then((code) => process.exit(code)).catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map