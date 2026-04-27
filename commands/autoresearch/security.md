# /autoresearch:security

Run the security review workflow.

## Activation

1. Read `skills/autoresearch/references/security-workflow.md`
2. Read `skills/autoresearch/references/loop-workflow.md`

## When to Use

Use this when the user wants a structured security pass before shipping. Combines the improve-verify loop with a security-specialized subagent pool.

## Execution

1. Identify the attack surface.
2. Run the security-specific subagent pool.
3. Verify each finding mechanically.
4. Record and prioritize findings.

Follow the security workflow reference for output format and severity gates.