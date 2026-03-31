# Predict Workflow

Multi-persona swarm prediction. Pre-analyze code from multiple expert perspectives using file-based knowledge representation.

## Phase 1: Scope Resolution
- Resolve file globs from `--scope`
- Read all matching files to build context

## Phase 2: Persona Assembly
- Based on `--depth` (or explicit `--personas N`):
  - shallow: 3 personas, 1 debate round
  - standard: 5 personas, 2 debate rounds
  - deep: 8 personas, 3 debate rounds
- Default personas: Security Analyst, Performance Engineer, API Designer, Test Engineer, DevOps Engineer
- If `--adversarial`: replace with red team personas (Attacker, Insider, Supply Chain, Infrastructure)

## Phase 3: Individual Analysis
- Each persona independently analyzes the code from their perspective
- Writes findings to a temporary knowledge file: `.autoresearch-predict/<persona-name>.md`
- Each finding includes: concern, severity, affected files, recommendation

## Phase 4: Cross-Persona Debate
- For each round (1 to `--rounds`):
  - Each persona reads all other personas' findings
  - Critiques, endorses, or refines findings from their perspective
  - Updates their knowledge file with revised findings

## Phase 5: Consensus Building
- Identify findings endorsed by 2+ personas (HIGH CONFIDENCE)
- Identify findings contested between personas (NEEDS DISCUSSION)
- Rank all findings by severity and consensus level

## Phase 6: Budget Enforcement
- If total findings exceed `--budget` (default 40), keep only the top N by severity × confidence
- Present trimmed results

## Phase 7: Output
- Structured findings report with per-persona attribution
- Summary table: findings by severity and category
- If `--fail-on` is set: exit non-zero if any finding meets or exceeds that severity
- Clean up `.autoresearch-predict/` temp directory

## Phase 8: Chain Handoff
- If `--chain` is set, hand findings to each chained command sequentially
- e.g., `--chain debug,fix` → run /autoresearch:debug with findings as context, then /autoresearch:fix
