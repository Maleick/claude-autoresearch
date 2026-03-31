# Security Workflow

Autonomous security audit. STRIDE threat modeling + OWASP Top 10 + red-team with 4 adversarial personas.

## Phase 0: Setup

- If `--fix` is enabled, create branch `autoresearch/<timestamp>` before Phase 1. Read-only audits (no --fix) do not require branch isolation.
- If `--fix` is enabled, apply 300s timeout to all shell commands using the Bash tool's timeout parameter (300000ms). If a command times out, treat as crash — see autonomous-loop-protocol.

## Phase 1: Attack Surface Mapping

- Read files matching Scope glob
- Identify: entry points (HTTP endpoints, CLI args, file inputs, env vars), trust boundaries, data flows, authentication/authorization points, external dependencies
- Build a threat model diagram (text-based)

## Phase 2: STRIDE Analysis

- For each trust boundary crossing, evaluate:
  - **S**poofing: Can identity be faked?
  - **T**ampering: Can data be modified in transit/storage?
  - **R**epudiation: Can actions be denied?
  - **I**nformation Disclosure: Can data leak?
  - **D**enial of Service: Can availability be disrupted?
  - **E**levation of Privilege: Can permissions be escalated?

## Phase 3: OWASP Top 10 Scan

- Check for each category against the codebase:
  - Injection, Broken Authentication, Sensitive Data Exposure, XXE, Broken Access Control, Security Misconfiguration, XSS, Insecure Deserialization, Known Vulnerabilities, Insufficient Logging

## Phase 4: Red Team (4 Personas)

- **External Attacker**: No credentials, targets public-facing surfaces
- **Insider Threat**: Has valid credentials, targets internal APIs and data access
- **Supply Chain**: Targets dependencies, build pipeline, package integrity
- **Infrastructure**: Targets deployment, config, secrets management, network

Each persona independently analyzes the code from their perspective.

## Phase 5: Exploit PoC Writing

- For each confirmed finding (Critical/High severity):
  - Write a working exploit PoC to `autoresearch-security/poc-<vuln-slug>.{py,sh,js}`
  - The PoC must demonstrate the vulnerability
  - The PoC doubles as a regression test once the vuln is fixed
- ALL security artifacts go under `autoresearch-security/` (gitignored)

## Phase 6: Classification

- Severity: Critical / High / Medium / Low
- CVSS-like scoring: exploitability × impact
- Affected files with line references

## Phase 7: Report and Stop

- Write structured report to `autoresearch-security/report.md`
- Summary table by severity and STRIDE/OWASP category
- If `--fix` is set: auto-remediate Critical/High findings after PoC verification
- If `--fail-on` is set: exit non-zero for CI/CD gating
