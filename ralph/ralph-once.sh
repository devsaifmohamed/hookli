#!/usr/bin/env bash
#
# ralph-once.sh — run a SINGLE Ralph iteration, human-in-the-loop.
# Watch it work, build intuition, then re-run. This is how you start.
#
#   ./ralph/ralph-once.sh            # one iteration
#   ./ralph/ralph-once.sh --sandbox  # one iteration inside docker sandbox
set -euo pipefail
exec "$(dirname "${BASH_SOURCE[0]}")/_run.sh" "$@"
