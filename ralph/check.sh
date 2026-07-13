#!/usr/bin/env bash
#
# check.sh — the verification gate ("back-pressure") for the Ralph loop.
# Green = typecheck + tests + build all pass.
#
# Usage:  bash ralph/check.sh   ·   Exit 0 = safe to commit
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ ! -d node_modules ]]; then
  echo "── installing deps (node_modules missing)"
  yarn install --silent
fi

echo "── gate: typecheck (tsc --noEmit)"
npx tsc --noEmit

echo "── gate: test (vitest)"
yarn test

echo "── gate: build (tsup)"
yarn build >/dev/null

echo "✅ gates green"
