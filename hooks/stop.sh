#!/bin/sh
# Stop hook for Auto Research
# Marks the background run as stopping if one is active.

set -e

STATUS_FILE="${AUTORESEARCH_STATE:-.autoresearch/state.json}"

if [ -f "$STATUS_FILE" ]; then
  mode=$(node -e "try{const s=require('$STATUS_FILE');console.log(s.mode||'')}catch{e}''" 2>/dev/null || true)
  if [ "$mode" = "background" ]; then
    node -e "
      const fs = require('fs');
      const s = JSON.parse(fs.readFileSync('$STATUS_FILE','utf8'));
      s.updated_at = new Date().toISOString();
      s.flags.stop_requested = true;
      s.flags.background_active = false;
      s.status = 'stopping';
      fs.writeFileSync('$STATUS_FILE', JSON.stringify(s, null, 2) + '\n');
      console.log('Stop requested for run: ' + s.run_id);
    " 2>/dev/null || echo "Could not update state."
  else
    echo "Only background runs can be stopped."
  fi
else
  echo "No active run."
fi