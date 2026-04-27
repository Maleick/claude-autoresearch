import { appendIteration } from "./run-manager.js";
import { printJson, normalizeResultStatus } from "./helpers.js";

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  const get = (name: string): string | undefined =>
    args[args.indexOf(`--${name}`) + 1] ?? undefined;

  const decision = get("decision");
  const changeSummary = get("change-summary");
  if (!decision || !changeSummary) {
    console.error("--decision and --change-summary are required");
    return 2;
  }

  try {
    const state = await appendIteration(
      get("repo"),
      get("results-path"),
      get("state-path"),
      decision,
      get("metric-value"),
      normalizeResultStatus(get("verify-status") ?? "pass", "verify_status"),
      normalizeResultStatus(get("guard-status") ?? "skip", "guard_status"),
      get("hypothesis"),
      changeSummary,
      get("labels")?.split(" "),
      get("note"),
      get("iteration") ? parseInt(get("iteration")!) : undefined,
    );
    printJson(state);
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