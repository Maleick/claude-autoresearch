#!/bin/sh
# Stop hook for Auto Research
# Marks the background run as stopping if one is active.

set -e

STATUS_FILE="${AUTORESEARCH_STATE:-.autoresearch/state.json}"

if [ -f "$STATUS_FILE" ]; then
  mode=$(node --input-type=module -e "
    import { readFileSync } from 'fs';
    const s = JSON.parse(readFileSync('$STATUS_FILE', 'utf8'));
    console.log(s.mode || '');
  " 2>/dev/null || true)
  if [ "$mode" = "background" ]; then
    node --input-type=module -e "
      import { readFileSync, writeFileSync } from 'fs';
      const s = JSON.parse(readFileSync('$STATUS_FILE', 'utf8'));
      s.updated_at = new Date().toISOString();
      s.flags.stop_requested = true;
      s.flags.background_active = false;
      s.status = 'stopping';
      writeFileSync('$STATUS_FILE', JSON.stringify(s, null, 2) + '\n');
      console.log('Stop requested for run: ' + s.run_id);
    " 2>/dev/null || echo "Could not update state."
  else
    echo "Only background runs can be stopped."
  fi
else
  echo "No active run."
fi
