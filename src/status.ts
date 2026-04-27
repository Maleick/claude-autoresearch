import { buildSupervisorSnapshot } from "./run-manager.js";
import { printJson } from "./helpers.js";

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  const get = (name: string): string | undefined =>
    args[args.indexOf(`--${name}`) + 1] ?? undefined;

  try {
    const snapshot = await buildSupervisorSnapshot(get("repo"), get("results-path"), get("state-path"));
    printJson(snapshot);
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