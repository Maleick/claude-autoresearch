import {
  VERSION,
  PACKAGE_NAME,
  PRODUCT_BRAND,
  SKILL_NAME,
} from "./constants.js";

export const id = SKILL_NAME;
export const repoRoot = "/Users/maleick/Projects/AutoResearch";
export const version = VERSION;
export { VERSION, PACKAGE_NAME, PRODUCT_BRAND, SKILL_NAME };
export type {
  RunConfig,
  WizardConfig,
  Metric,
  RunStats,
  RunFlags,
  LastIteration,
  RunState,
  SupervisorSnapshot,
  LabelRequirements,
  ArtifactPaths,
} from "./types.js";
