export {
  id,
  repoRoot,
  version,
} from "../dist/index.js";

export async function server() {
  return {
    event() {
      return undefined;
    },
  };
}
