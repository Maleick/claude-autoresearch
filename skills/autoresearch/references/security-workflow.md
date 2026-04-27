# Security Workflow

Use this when the user wants a structured security pass.

## Goal

Find concrete security issues with enough evidence to prioritize and fix them.

## Steps

1. Define the in-scope attack surface.
2. Review it through common categories such as input handling, authz/authn, secrets, injection, unsafe deserialization, file access, and dependency exposure.
3. Prefer reproducible evidence over broad claims.
4. Rank findings by severity and exploitability.
5. If the user wants remediation, hand the highest-value issue into the fix workflow.
