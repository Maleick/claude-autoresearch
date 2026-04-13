# Commands

## `/autoresearch` — Core Optimization Loop

Run with no arguments to launch the guided wizard, or provide parameters directly:

```bash
/autoresearch Goal: "Reduce bundle size" Scope: "src/**/*.ts" Metric: "bundle size KB" \
  Verify: "npm run build 2>&1 | grep size | awk '{print \$3}'" Direction: minimize --iterations 50
```

**Flags:** `--iterations N`, `--resume`, `--force-branch`, `--no-limit`, `--dry-run`, `--notify`

---

## `/autoresearch:plan` — Setup Wizard

Interactively builds Goal, Scope, Metric, and Verify from a description.

```bash
/autoresearch:plan "I want to speed up my test suite"
```

---

## `/autoresearch:debug` — Bug Hunter

Scientific-method investigation surfacing multiple bugs.

```bash
/autoresearch:debug --scope "src/**/*" --symptom "intermittent timeout in auth module" --iterations 10
```

**Flags:** `--fix`, `--scope`, `--symptom`, `--severity`, `--technique`, `--iterations`, `--output`

---

## `/autoresearch:fix` — Error Repair Loop

Fixes errors one at a time until zero remain.

```bash
/autoresearch:fix --target "npm test" --scope "src/**/*.ts" --iterations 20
```

**Flags:** `--target`, `--guard`, `--scope`, `--category`, `--skip-lint`, `--from-debug`, `--force-branch`, `--iterations`, `--max-attempts-per-error`

---

## `/autoresearch:security` — Security Audit

STRIDE threat model, OWASP Top 10, red-team personas.

```bash
/autoresearch:security --scope "src/**/*" --depth standard --fail-on high
```

**Flags:** `--diff`, `--fix`, `--fail-on`, `--scope`, `--depth`, `--iterations`, `--baseline`

---

## `/autoresearch:learn` — Documentation Generator

Analyzes your codebase and produces or updates docs.

```bash
/autoresearch:learn "API reference" --scope "src/api/**/*" --mode init --depth standard
```

**Flags:** `--mode`, `--scope`, `--depth`, `--file`, `--scan`, `--topics`, `--no-fix`, `--format`, `--iterations`, `--audience`

---

## `/autoresearch:predict` — Expert Analysis

Multi-persona debate across expert viewpoints.

```bash
/autoresearch:predict "error handling gaps" --scope "src/**/*" --depth standard
```

**Flags:** `--scope`, `--chain`, `--depth`, `--personas`, `--rounds`, `--adversarial`, `--budget`, `--fail-on`, `--iterations`, `--export`

---

## `/autoresearch:scenario` — Edge Case Explorer

Generates derivative scenarios from a seed.

```bash
/autoresearch:scenario "user uploads a 10GB file" --scope "src/upload/**/*" --depth deep
```

**Flags:** `--scope`, `--depth`, `--domain`, `--format`, `--focus`, `--iterations`, `--seed-from-tests`

---

## `/autoresearch:ship` — Shipping Workflow

8-phase checklist from readiness check to post-ship monitoring.

```bash
/autoresearch:ship --type code-pr --auto
```

**Flags:** `--dry-run`, `--auto`, `--force`, `--rollback`, `--monitor`, `--type`, `--target`, `--checklist-only`, `--iterations`, `--changelog`
