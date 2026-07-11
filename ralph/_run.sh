#!/usr/bin/env bash
#
# _run.sh — one Ralph iteration (shared core used by ralph-once.sh and afk-ralph.sh).
#
# Each iteration is STATELESS: all memory lives in files (prd.json + progress.txt +
# git history). The model reads them, picks ONE task, implements it, runs the gate,
# commits, and appends to progress.txt. Fresh context every time.
#
#   Flags:  --mode <name>  prepend the overlay ralph/modes/<name>.md to the prompt
#                          (e.g. convention-sweep, review-apply)
#           --sandbox      run the CLI inside `docker sandbox` (isolation)
#           --allow-dirty  silence the dirty-working-tree warning
set -euo pipefail

RALPH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$RALPH_DIR/.." && pwd)"
PROMPT_FILE="$RALPH_DIR/prompt.md"
PRD_FILE="$RALPH_DIR/prd.json"
PROGRESS_FILE="$RALPH_DIR/progress.txt"
cd "$REPO_ROOT"

# Progress tracking: live heartbeat (ralph/heartbeat.log) + a structured line
# appended to progress.txt after the iteration.
# shellcheck source=/dev/null
source "$RALPH_DIR/lib-progress.sh"

SANDBOX=0
ALLOW_DIRTY=0
MODE_NAME=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --sandbox) SANDBOX=1 ;;
    --allow-dirty) ALLOW_DIRTY=1 ;;
    --mode) MODE_NAME="${2:-}"; shift ;;
    --mode=*) MODE_NAME="${1#--mode=}" ;;
    *) echo "Unknown flag: $1" >&2; exit 1 ;;
  esac
  shift
done

MODE_FILE=""
if [[ -n "$MODE_NAME" ]]; then
  MODE_FILE="$RALPH_DIR/modes/$MODE_NAME.md"
  [[ -f "$MODE_FILE" ]] || { echo "Error: mode overlay not found: $MODE_FILE"; exit 1; }
fi

[[ -f "$PRD_FILE" ]] || { echo "Error: $PRD_FILE not found."; exit 1; }
touch "$PROGRESS_FILE"   # Ralph relies on it for continuity

# Ralph often runs on top of in-progress work, so a dirty tree is allowed — but warn,
# because the model's `git add -A` commit can sweep in pre-existing changes. Pass
# --allow-dirty to silence; commit/stash first if you want strictly atomic iterations.
if [[ "$ALLOW_DIRTY" -eq 0 && -n "$(git status --porcelain)" ]]; then
  echo "⚠ working tree is dirty — an iteration's commit may include pre-existing changes." >&2
fi

# Choose CLI runner.
RUNNER="claude"
if [[ "$SANDBOX" -eq 1 ]]; then
  if command -v docker >/dev/null 2>&1; then
    RUNNER="docker sandbox run claude"
  else
    echo "Error: --sandbox requested but docker not found."; exit 1
  fi
else
  command -v claude >/dev/null 2>&1 || { echo "Error: claude CLI not found in PATH."; exit 1; }
fi

# The prompt: operating manual + optional mode overlay + @-references to backlog/progress.
PROMPT="$(cat "$PROMPT_FILE")"
if [[ -n "$MODE_FILE" ]]; then
  PROMPT="$PROMPT

## Mode: $MODE_NAME
$(cat "$MODE_FILE")"
fi
PROMPT="$PROMPT

Backlog:  @ralph/prd.json
Progress: @ralph/progress.txt"

# acceptEdits keeps the loop from stalling on file-write prompts; the model still
# stops at the human gates spelled out in prompt.md (no merge / delete / master push).
progress_begin
# progress_end always runs — records the metrics line and kills the heartbeat — on a
# clean exit, a red claude exit, OR Ctrl-C/SIGTERM, via the EXIT trap. The script
# exits with claude's own status.
trap progress_end EXIT
$RUNNER --permission-mode acceptEdits -p "$PROMPT"
