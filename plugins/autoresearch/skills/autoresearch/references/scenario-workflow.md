# Scenario Workflow

Scenario-driven use case generator. Explores situations, edge cases, and derivative scenarios from a seed scenario.

## Setup

- Persist state to `autoresearch-state.json` after each phase completes (see state-management.md protocol).
- Log each iteration/finding to `autoresearch-results.tsv` (see results-logging.md for format).

## Phase 1: Seed Analysis

- Parse the seed scenario description
- Identify: actors, actions, preconditions, postconditions, data flows
- Determine domain (from `--domain` or auto-detect): software, product, business, security, marketing

## Phase 2: Dimension Mapping

- Map the scenario across dimensions:
  - **Happy path**: normal expected flow
  - **Error paths**: what can go wrong at each step
  - **Edge cases**: boundary conditions, empty inputs, max values
  - **Concurrency**: what if multiple actors do this simultaneously
  - **Scale**: what happens at 10x, 100x, 1000x load
  - **Security**: what if an adversary controls each input

## Phase 3: Scenario Generation

- For each dimension, generate concrete scenarios
- Format based on `--format`:
  - **use-cases**: Given/When/Then format
  - **user-stories**: As a [role], I want [goal], so that [benefit]
  - **test-scenarios**: Test case with setup, action, assertion
  - **threat-scenarios**: Attacker profile, attack vector, impact, mitigation
- If `--focus` is set, weight generation toward that area

## Phase 4: Derivative Exploration

- For each generated scenario, ask "what if?" to find second-order scenarios
- Chain scenarios: "if scenario A fails, what does scenario B look like?"
- Track exploration depth to avoid infinite recursion

## Phase 5: Deduplication

- Remove scenarios that are semantically equivalent
- Group related scenarios into clusters

## Phase 6: Prioritization

- Rank by: likelihood × impact × novelty
- If `--depth shallow`: output top 10
- If `--depth standard`: output top 25
- If `--depth deep`: output 50+

## Phase 7: Output

- Structured scenario document organized by dimension
- Summary table: count by dimension and priority
- If code scope was provided: map scenarios to relevant code paths
