# Quick Start Guide

## Installation

```bash
npm install -g opencode-autoresearch
autoresearch doctor
```

## Basic Usage

### 1. Initialize a run

```bash
autoresearch init \
  --goal "Improve response time" \
  --metric "response_time_ms" \
  --direction "lower" \
  --verify "npm test"
```

### 2. Check status

```bash
autoresearch status
```

### 3. Record an iteration

```bash
autoresearch record \
  --decision keep \
  --metric-value "120" \
  --verify-status pass \
  --change-summary "Optimized database queries" \
  --labels "perf,database"
```

### 4. View history

```bash
autoresearch history
```

### 5. Complete the run

```bash
autoresearch complete
```

## Background Runs

For overnight or long-running improvements:

```bash
autoresearch init \
  --goal "Refactor codebase" \
  --metric "complexity" \
  --direction "lower" \
  --verify "npm test" \
  --mode background \
  --iterations 20

autoresearch launch
# ... work on other things ...
autoresearch status
```

## Self-Improvement

Run AutoResearch on itself:

```bash
autoresearch init \
  --goal "Improve test coverage" \
  --metric "test_count" \
  --direction "higher" \
  --verify "npm test" \
  --mode background
```

## Shell Completion

```bash
# Bash
autoresearch completion --shell bash >> ~/.bashrc

# Zsh
autoresearch completion --shell zsh >> ~/.zshrc

# Fish
autoresearch completion --shell fish >> ~/.config/fish/completions/autoresearch.fish
```

## Exporting Results

```bash
# JSON export
autoresearch export --format json > results.json

# Markdown report
autoresearch report > report.md
```
