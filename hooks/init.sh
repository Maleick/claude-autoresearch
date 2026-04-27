#!/bin/sh
# SessionStart hook for Auto Research
# Reads the current run state and emits a checklist if a managed run is active.

set -e

checklist() {
  echo "Auto Research checklist:"
  echo "- If this is a fresh managed run, baseline first, then initialize results/state artifacts."
  echo "- Record every completed experiment before starting the next one."
  echo "- Keep retain/stop label gates satisfied before marking an iteration as kept."
  echo "- Respect iteration and duration caps."
  echo "- After launch approval, continue by default unless the user stops the run."
}

if [ -f ".autoresearch/state.json" ]; then
  status=$(node -e "try{const s=require('.autoresearch/state.json');console.log(s.status||'')}catch{e}''" 2>/dev/null || true)
  if [ "$status" = "running" ] || [ "$status" = "initialized" ]; then
    checklist
  fi
fi