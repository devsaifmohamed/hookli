#!/usr/bin/env bash
#
# check.sh — the verification gate for the hookli MONOREPO ("back-pressure").
#
# SCOPED (Nzmly pattern): runs only the workspace(s) whose files changed, so an agent
# touching one package doesn't pay for the whole repo. Ralph must see this exit 0 before
# it is allowed to commit.
#
#   packages/hookli/**  →  turbo typecheck + test + build   (--filter=hookli)
#   apps/docs/**        →  turbo lint + typecheck + build    (--filter=hookli-docs; builds the library first)
#
# Usage:  bash ralph/check.sh
# Exit:   0 = green (safe to commit) · non-zero = a gate failed
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

[[ -d node_modules ]] || { echo "── installing deps"; pnpm install; }

# staged + unstaged, so it works pre- or post-`git add`
changed="$(git diff --name-only; git diff --cached --name-only)"
touches() { grep -q "^$1" <<<"$changed"; }

any=0
if touches packages/hookli/; then
  echo "── gate: library (packages/hookli)"
  pnpm exec turbo run typecheck test build --filter=hookli
  any=1
fi
if touches apps/docs/; then
  echo "── gate: docs (apps/docs)"
  # --filter=hookli-docs pulls in the library's ^build first (docs imports it)
  pnpm exec turbo run lint typecheck build --filter=hookli-docs
  any=1
fi
# Root tooling changed but no workspace source → sanity-build everything.
if [[ "$any" == 0 ]] && [[ -n "$changed" ]]; then
  echo "── gate: root tooling changed — full build"
  pnpm exec turbo run typecheck test lint build
  any=1
fi

[[ "$any" == 0 ]] && echo "ℹ no changes — nothing to gate"
echo "✅ gates green"
