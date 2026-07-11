#!/usr/bin/env bash
#
# check.sh — the verification gate ("back-pressure") for the Ralph loop.
#
# For this repo — the hookli (hookli) React hooks library — a green gate means:
#   1. TypeScript typechecks with no errors (npx tsc --noEmit)
#   2. The tsup build succeeds (CJS + ESM + .d.ts all emit)
# Ralph must see this exit 0 before it is allowed to commit. Red gates block the
# commit — that is the whole point: the model may wander, but it cannot land
# un-gated code.
#
# Usage:  bash ralph/check.sh
# Exit:   0 = green (safe to commit) · non-zero = a gate failed
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Ensure deps are present so tsc/tsup resolve (first run on a fresh clone).
if [[ ! -d node_modules ]]; then
  echo "── installing deps (node_modules missing)"
  yarn install --silent
fi

echo "── gate: typecheck (tsc --noEmit)"
npx tsc --noEmit

echo "── gate: build (tsup)"
yarn build >/dev/null

echo "✅ gates green"
