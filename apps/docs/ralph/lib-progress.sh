#!/usr/bin/env bash
#
# lib-progress.sh — progress tracking for the Ralph loop (sourced by _run.sh).
#
# Two things:
#   1. Live heartbeat — while the (headless, non-streaming) iteration runs, a
#      background watcher polls the working tree every 15s and appends to
#      ralph/heartbeat.log so you can `tail -f ralph/heartbeat.log` and see the
#      iteration's phase (searching → editing → done), elapsed time, and which
#      files it has touched.
#   2. Richer progress.txt — after the iteration, one structured line is appended:
#      <ISO-ts> · <sha|—> · <duration> · <N files> · gate:<green|—> · done <D>/<T> · <commit subject>
#      (gate:green is inferred from "a commit landed" — the model only commits on a
#      green gate per prompt.md; no commit ⇒ nothing landed this iteration.)
#
# Relies on RALPH_DIR / PRD_FILE / PROGRESS_FILE / REPO_ROOT set by _run.sh.
# Every command guarded so a failing probe never aborts the (set -e) runner.

RALPH_HB="$RALPH_DIR/heartbeat.log"

# Files changed vs the iteration's baseline snapshot, excluding ralph/ itself.
_ralph_changed() {
  local cur
  cur="$(cd "$REPO_ROOT" && git status --porcelain 2>/dev/null | awk '{print $NF}' | sort || true)"
  comm -13 <(printf '%s\n' "$RALPH_BASELINE") <(printf '%s\n' "$cur") 2>/dev/null \
    | grep -Ev '^(ralph/|$)' || true
}

_ralph_elapsed() { local s=$(( $(date +%s) - RALPH_START_TS )); printf '%dm%02ds' $((s/60)) $((s%60)); }

_ralph_heartbeat_loop() {
  while :; do
    local changed n names phase
    changed="$(_ralph_changed)"
    n="$(printf '%s\n' "$changed" | grep -c . || true)"; n="${n:-0}"
    if [[ "$n" -eq 0 ]]; then phase="searching"; names=""
    else phase="editing  "; names=" · $(printf '%s\n' "$changed" | sed 's#.*/##' | head -4 | paste -sd, - || true)"; fi
    printf '  %7s · %s · %s file(s)%s\n' "$(_ralph_elapsed)" "$phase" "$n" "$names" >> "$RALPH_HB" || true
    sleep 15
  done
}

# progress_begin — snapshot start state, reset heartbeat.log, launch the watcher.
progress_begin() {
  RALPH_START_TS=$(date +%s)
  RALPH_START_SHA="$(cd "$REPO_ROOT" && git rev-parse HEAD 2>/dev/null || echo none)"
  RALPH_BASELINE="$(cd "$REPO_ROOT" && git status --porcelain 2>/dev/null | awk '{print $NF}' | sort || true)"
  local task; task="$(jq -r 'first(.tasks[]|select(.status=="todo")) // empty | .id + "  " + .title' "$PRD_FILE" 2>/dev/null || true)"
  {
    echo "── Ralph iteration · $(date -u +%Y-%m-%dT%H:%MZ)"
    echo "   next task: ${task:-<none todo>}"
    echo "   watch:     tail -f ralph/heartbeat.log"
  } > "$RALPH_HB" 2>/dev/null || true
  _ralph_heartbeat_loop & RALPH_HB_PID=$!
  # detach from the job table so killing it at progress_end prints no
  # "Terminated: 15 · ralph heartbeat loop" job-control noise.
  disown "$RALPH_HB_PID" 2>/dev/null || true
}

# progress_end — stop the watcher, append the structured metrics line.
progress_end() {
  [[ -n "${RALPH_HB_PID:-}" ]] && kill "$RALPH_HB_PID" 2>/dev/null || true
  local dur end_sha n gate sha subj done review total
  dur="$(_ralph_elapsed)"
  end_sha="$(cd "$REPO_ROOT" && git rev-parse HEAD 2>/dev/null || echo none)"
  n="$(_ralph_changed | grep -c . || true)"; n="${n:-0}"
  if [[ "$end_sha" != "$RALPH_START_SHA" ]]; then
    gate="green"; sha="${end_sha:0:7}"
    subj="$(cd "$REPO_ROOT" && git log -1 --format='%s' 2>/dev/null || echo '')"
  elif [[ "$n" -gt 0 ]]; then
    # work landed in the tree but nothing was committed → a review-first iteration
    gate="review"; sha="—"; subj="(uncommitted changes — needs review before commit)"
  else
    gate="—"; sha="—"; subj="(no changes this iteration)"
  fi
  done="$(jq '[.tasks[]|select(.status=="done")]|length' "$PRD_FILE" 2>/dev/null || echo '?')"
  review="$(jq '[.tasks[]|select(.status=="needs-review")]|length' "$PRD_FILE" 2>/dev/null || echo '?')"
  total="$(jq '.tasks|length' "$PRD_FILE" 2>/dev/null || echo '?')"
  printf '%s · %s · %s · %s file(s) · gate:%s · done %s/%s · review %s · %s\n' \
    "$(date -u +%Y-%m-%dT%H:%MZ)" "$sha" "$dur" "$n" "$gate" "$done" "$total" "$review" "$subj" \
    >> "$PROGRESS_FILE" || true
  printf '  %7s · done · gate:%s · %s file(s)\n' "$dur" "$gate" "$n" >> "$RALPH_HB" 2>/dev/null || true
}
