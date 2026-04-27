import { setStopRequested } from "./run-manager.js";
import { printJson } from "./helpers.js";

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  const get = (name: string): string | undefined =>
    args[args.indexOf(`--${name}`) + 1] ?? undefined;

  try {
    const state = await setStopRequested(get("repo"), get("state-path"));
    printJson({ status: "stop_requested", run_id: state.run_id });
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