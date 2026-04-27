export interface RunConfig {
    goal: string;
    metric: string;
    direction: string;
    verify: string;
    mode: string;
    scope?: string;
    guard?: string;
    iterations?: number;
    duration?: string;
    memory_path?: string;
    required_keep_labels?: string[];
    required_stop_labels?: string[];
    run_tag?: string;
    stop_condition?: string;
    baseline?: string;
}
export interface WizardConfig {
    goal?: string;
    scope?: string;
    metric?: string;
    direction?: string;
    verify?: string;
    guard?: string;
    mode?: string;
    iterations?: number;
    duration?: string;
    memory_path?: string;
    required_keep_labels?: string[];
    required_stop_labels?: string[];
    stop_condition?: string;
    rollback_strategy?: string;
}
export interface Metric {
    name: string;
    direction: string;
    baseline?: string;
    best?: string;
    latest?: string;
}
export interface RunStats {
    total_iterations: number;
    kept: number;
    discarded: number;
    needs_human: number;
    consecutive_discards: number;
    best_iteration?: number;
}
export interface RunFlags {
    stop_requested: boolean;
    needs_human: boolean;
    background_active: boolean;
    stop_ready: boolean;
}
export interface LastIteration {
    iteration: number;
    decision: string;
    metric_value?: string;
    change_summary: string;
    labels: string[];
    timestamp: string;
    keep_labels_satisfied: boolean;
    stop_labels_satisfied: boolean;
    missing_keep_labels: string[];
    missing_stop_labels: string[];
}
export interface RunState {
    schema_version: number;
    run_id: string;
    created_at: string;
    updated_at: string;
    status: string;
    mode: string;
    goal: string;
    scope: string;
    metric: Metric;
    verify: string;
    guard?: string;
    iterations_cap?: number;
    duration?: string;
    duration_seconds?: number;
    deadline_at?: string;
    memory?: Record<string, unknown>;
    subagent_pool?: Record<string, unknown>;
    continuation_policy?: Record<string, unknown>;
    label_requirements: {
        keep: string[];
        stop: string[];
    };
    stop_condition?: string;
    artifact_paths: {
        results: string;
        state: string;
    };
    stats: RunStats;
    flags: RunFlags;
    last_iteration?: LastIteration;
}
export interface SupervisorSnapshot {
    decision: string;
    reason: string;
    run_id: string;
    status: string;
    mode: string;
    goal: string;
    metric: Metric;
    stats: RunStats;
    last_iteration?: LastIteration;
    results_rows: number;
    artifact_paths: Record<string, string>;
    flags: RunFlags;
    label_requirements: Record<string, string[]>;
    subagent_pool?: Record<string, unknown>;
    continuation_policy?: Record<string, unknown>;
    subagent_guidance?: Record<string, unknown>;
}
export interface Result {
    timestamp: string;
    iteration: string;
    decision: string;
    metric_value: string;
    verify_status: string;
    guard_status: string;
    hypothesis: string;
    change_summary: string;
    labels: string;
    note: string;
}
//# sourceMappingURL=types.d.ts.map