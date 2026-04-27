import type { RunConfig, RunState } from "./types.js";
export declare function initializeRun(repo: string | undefined, resultsPathValue: string | undefined, statePathValue: string | undefined, config: RunConfig, freshStart: boolean): Promise<RunState>;
export declare function appendIteration(repo: string | undefined, resultsPathValue: string | undefined, statePathValue: string | undefined, decision: string, metricValue: string | undefined, verifyStatus: string, guardStatus: string, hypothesis: string | undefined, changeSummary: string, labels: string[] | undefined, note: string | undefined, iteration: number | undefined): Promise<RunState>;
export declare function makeStatePayload(config: RunConfig, resultsPath: string, statePath: string): RunState;
export declare function setStopRequested(repo: string | undefined, statePathValue: string | undefined): Promise<RunState>;
export declare function resumeBackgroundRun(repo: string | undefined, statePathValue: string | undefined): Promise<RunState>;
export declare function completeRun(repo: string | undefined, statePathValue: string | undefined): Promise<RunState>;
export declare function buildSupervisorSnapshot(repo: string | undefined, resultsPathValue: string | undefined, statePathValue: string | undefined): Promise<Record<string, unknown>>;
//# sourceMappingURL=run-manager.d.ts.map