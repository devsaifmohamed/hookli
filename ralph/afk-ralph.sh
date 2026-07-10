#!/usr/bin/env bash
#
# afk-ralph.sh — the "away-from-keyboard" loop. Runs up to N iterations, stopping
# early when the model reports the backlog is drained (<promise>COMPLETE</promise>).
#
# The iteration CAP is your cost ceiling — Ralph is "deterministically bad in a
# non-deterministic world": it improves across many small loops, so bound it.
#
#   ./ralph/afk-ralph.sh 20            # up to 20 iterations
#   ./ralph/afk-ralph.sh 20 --sandbox  # ...inside docker sandbox
set -euo pipefail

MAX="${1:-10}"; shift || true
RALPH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for (( i=1; i<=MAX; i++ )); do
  echo "═══════════════════ Ralph iteration $i/$MAX ═══════════════════"
  # Capture + echo (no /dev/tty, so this works under nohup/cron); `|| true` so a red
  # or transient iteration doesn't abort the batch — the next one starts fresh.
  out="$("$RALPH_DIR/_run.sh" "$@" 2>&1)" || true
  printf '%s\n' "$out"
  if grep -q "<promise>COMPLETE</promise>" <<<"$out"; then
    echo "✅ Backlog drained at iteration $i. Stopping."
    exit 0
  fi
done
echo "⏹ Reached iteration cap ($MAX). Re-run to continue, or inspect progress.txt."
