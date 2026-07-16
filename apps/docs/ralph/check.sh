#!/usr/bin/env bash
#
# check.sh — the verification gate ("back-pressure") for the Ralph loop.
#
# For this repo — the hookli docs site (Next.js App Router + Tailwind) — green means:
#   1. ESLint passes             (npm run lint)
#   2. TypeScript typechecks     (npx tsc --noEmit)
#   3. Production build succeeds (npm run build)
# Ralph must see this exit 0 before it is allowed to commit.
#
# Usage:  bash ralph/check.sh
# Exit:   0 = green (safe to commit) · non-zero = a gate failed
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ ! -d node_modules ]]; then
  echo "── installing deps (node_modules missing)"
  npm install --no-audit --no-fund
fi

echo "── gate: lint"
npm run lint --silent

echo "── gate: typecheck (tsc --noEmit)"
npx tsc --noEmit

echo "── gate: build (next build)"
npm run build --silent >/dev/null

echo "✅ gates green"
