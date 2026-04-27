export interface RoleTemplate {
    id: string;
    name: string;
    focus: string;
    triggers?: string[];
}
export declare function buildSubagentPoolPlan(params: {
    goal: string;
    scope?: string;
    mode: string;
}): Record<string, unknown>;
export declare function buildContinuationPolicy(mode: string): Record<string, unknown>;
//# sourceMappingURL=subagent-pool.d.ts.map