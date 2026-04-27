#!/bin/sh
# Status hook for Auto Research
# Prints current run status from the state file.

set -e

STATUS_FILE="${AUTORESEARCH_STATE:-.autoresearch/state.json}"

if [ -f "$STATUS_FILE" ]; then
  node -e "
    const s = require('$STATUS_FILE');
    console.log('Auto Research run: ' + s.run_id);
    console.log('Status: ' + s.status);
    console.log('Mode: ' + s.mode);
    console.log('Goal: ' + s.goal);
    console.log('Iterations: ' + s.stats.total_iterations);
    console.log('Kept: ' + s.stats.kept + ' | Discarded: ' + s.stats.discarded);
    if (s.flags.needs_human) console.log('NEEDS HUMAN');
    if (s.flags.stop_requested) console.log('STOP REQUESTED');
  " 2>/dev/null || echo "No active run."
else
  echo "No active run."
fi