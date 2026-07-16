#!/usr/bin/env bash
#
# approve.sh — the human half of a review-first Ralph iteration.
#
# When a task lands in `status: "needs-review"` (the model did the work + ran the
# gate but did NOT commit, per its acceptance), you review the working tree, then
# run this to commit it, flip the task to `done`, and log a line to progress.txt —
# in one call instead of three manual steps.
#
#   ralph/approve.sh <task-id> [commit message]
#
# It does NOT push (leave that to your normal flow) and never merges/deletes.
set -euo pipefail

RALPH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$RALPH_DIR/.." && pwd)"
PRD="$RALPH_DIR/prd.json"
PROG="$RALPH_DIR/progress.txt"
cd "$REPO_ROOT"

TASK_ID="${1:-}"
[[ -n "$TASK_ID" ]] || { echo "usage: ralph/approve.sh <task-id> [commit message]" >&2; exit 1; }
shift
MSG="${*:-}"

command -v jq >/dev/null 2>&1 || { echo "Error: jq not found." >&2; exit 1; }

# Task must exist and be reviewable.
title="$(jq -r --arg id "$TASK_ID" 'first(.tasks[]|select(.id==$id))|.title // empty' "$PRD" 2>/dev/null || true)"
[[ -n "$title" ]] || { echo "Error: task '$TASK_ID' not found in $PRD" >&2; exit 1; }
status="$(jq -r --arg id "$TASK_ID" 'first(.tasks[]|select(.id==$id))|.status // empty' "$PRD" 2>/dev/null || true)"
[[ "$status" == "done" ]] && { echo "Error: task '$TASK_ID' is already done." >&2; exit 1; }
if [[ "$status" != "needs-review" ]]; then
  echo "⚠ task '$TASK_ID' is '$status', not 'needs-review' — approving anyway (Ctrl-C to abort)." >&2
fi
[[ -n "$MSG" ]] || MSG="feat(ralph): $title"

# There must be something to commit.
if [[ -z "$(git status --porcelain)" ]]; then
  echo "Nothing to commit — working tree is clean (did the iteration leave changes?)." >&2
  exit 1
fi

echo "── Approving $TASK_ID: $title"

# Flip status -> done FIRST so the prd.json change is part of the approved commit
# (atomic). Temp file cleaned up on any exit.
tmp="$(mktemp)"; trap 'rm -f "$tmp"' EXIT
jq --arg id "$TASK_ID" '(.tasks[]|select(.id==$id).status)="done"' "$PRD" > "$tmp"
mv "$tmp" "$PRD"

git add -A
git commit -m "$MSG

Human-approved review of Ralph task $TASK_ID.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
SHA="$(git rev-parse --short HEAD)"

printf '%s · %s · reviewed+approved · %s → done · %s\n' \
  "$(date -u +%Y-%m-%dT%H:%MZ)" "$SHA" "$TASK_ID" "$MSG" >> "$PROG"

echo "✅ $TASK_ID committed ($SHA) and marked done."
echo "   next: bash ralph/ralph-once.sh   (push when you're ready)"
