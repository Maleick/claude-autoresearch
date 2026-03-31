# Security Workflow — Offensive Security Audit

Full offensive audit with exploit proof-of-concepts. STRIDE + OWASP Top 10 + adversarial personas.

## Argument Parsing

Extract from $ARGUMENTS:

- `Scope:` — file globs to audit (REQUIRED)
- `--fix` — auto-remediate confirmed findings after writing PoC
- `--fail-on <severity>` — exit non-zero if findings at or above severity (for CI/CD)
- `Iterations:` — max iterations (default: 30)
- `Duration:` — max wall-clock time (optional)

If Scope is missing, FAIL with: "ERROR: Missing Scope. Usage: /autoresearch:security Scope: <glob>"

## Adversarial Personas

Every iteration adopts one of 4 attacker perspectives:

1. **External Attacker** — no credentials, probing from outside. Focuses on: input validation, injection, authentication bypass, information disclosure, API abuse.
2. **Insider Threat** — has valid credentials, authorized access. Focuses on: privilege escalation, data exfiltration, audit log evasion, access control gaps.
3. **Supply Chain Attacker** — targets dependencies and build pipeline. Focuses on: dependency vulnerabilities, build script injection, artifact tampering, typosquatting.
4. **Infrastructure Attacker** — targets deployment and runtime. Focuses on: misconfigurations, secrets in code/env, container escape, network segmentation, SSRF.

## The Security Loop

### Phase 0: Reconnaissance

1. Map the attack surface within Scope:
   - Entry points (API routes, CLI args, file inputs, env vars)
   - Authentication/authorization boundaries
   - Data flows (where sensitive data enters, moves, exits)
   - Dependencies and their versions
   - Secrets handling (how credentials are stored/accessed)
2. Build STRIDE threat model:
   - **S**poofing: identity verification weaknesses
   - **T**ampering: data integrity gaps
   - **R**epudiation: audit logging gaps
   - **I**nformation disclosure: data leak vectors
   - **D**enial of service: resource exhaustion paths
   - **E**levation of privilege: access control weaknesses
3. Map to OWASP Top 10 categories
4. Create output directory: `autoresearch-security/`
5. Write initial `autoresearch-security/threat-model.md`

### Phase 1: Select Attack Vector

1. Choose a persona for this iteration
2. Select an untested attack vector from the threat model
3. Prioritize: high-likelihood + high-impact first

### Phase 2: Analyze & Exploit

1. Read the relevant code carefully
2. Trace the vulnerability through the code path
3. Determine if the vulnerability is exploitable
4. If exploitable: write a proof-of-concept

### Phase 3: Write Exploit PoC

For every confirmed vulnerability, write a working exploit:

- File: `autoresearch-security/poc-<vuln-slug>.{py,sh,js}`
- The PoC must be:
  - Self-contained and runnable
  - Demonstrate the vulnerability clearly
  - Include comments explaining each step
  - Include cleanup/teardown if it modifies state
  - Usable as a regression test after the fix

Example PoC structure:

```python
#!/usr/bin/env python3
"""PoC: SQL injection in /api/users endpoint
Severity: Critical
OWASP: A03:2021 Injection
Vector: user_id parameter not parameterized
"""

import requests

# Exploit
response = requests.get("http://localhost:3000/api/users", params={
    "user_id": "1 OR 1=1; DROP TABLE users; --"
})

# Verify exploitation
assert response.status_code == 200, "Endpoint rejected payload"
assert len(response.json()) > 1, "Injection did not return extra rows"
print(f"VULNERABLE: Returned {len(response.json())} rows instead of 1")
```

### Phase 4: Classify

Record each finding:

- **Severity:** Critical / High / Medium / Low
- **OWASP category**
- **STRIDE category**
- **Persona** that found it
- **File:line** of the vulnerability
- **PoC path**
- **Remediation** recommendation

### Phase 5: Fix (if --fix)

If `--fix` flag is set:

1. Implement the remediation
2. Commit: `autoresearch-security: fix <vuln-slug>`
3. Run the PoC — it should now FAIL (vulnerability patched)
4. If PoC still succeeds: revert fix, log as incomplete remediation

### Phase 6: Log

Append to `autoresearch-security/findings.md`:

```markdown
### <VULN-SLUG>: <title>

- **Severity:** <level>
- **OWASP:** <category>
- **STRIDE:** <category>
- **Persona:** <name>
- **Location:** <file>:<line>
- **PoC:** `autoresearch-security/poc-<slug>.py`
- **Status:** confirmed | fixed | fix-incomplete
- **Description:** <detailed description>
- **Remediation:** <how to fix>
```

### Phase 7: Repeat or Stop

Stop conditions:

- Iterations exhausted
- Duration exceeded
- All attack vectors tested
- 10 consecutive iterations with no new findings

### End of Run

1. Write `autoresearch-security/report.md` with:
   - Executive summary (total findings by severity)
   - Coverage matrix (STRIDE x OWASP tested combinations)
   - All findings with PoC references
   - Remediation roadmap (prioritized)
2. Terminal summary
3. Discord notification: `autoresearch:security complete: <N> findings (<critical> critical, <high> high, <medium> medium, <low> low). <pocs> PoCs written. See autoresearch-security/report.md`
4. If `--fail-on`: exit non-zero if any finding meets or exceeds the threshold
