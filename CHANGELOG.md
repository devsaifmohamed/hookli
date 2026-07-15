# Changelog

All notable changes are documented here. This project follows semantic-ish versioning.

## 1.3.20 — 2026-07-15
- README: add a Sponsor badge + "Support hookli" section (star + sponsor).

## 1.3.19 — 2026-07-13
- Packaging: `sideEffects: false` + `exports` map for better tree-shaking.
- Repo: per-hook folder structure (usehooks-ts style), vitest test suite, CI, and community-health files.

## 1.3.18 — 2026-07-13
- Rename hook files to kebab-case (`use-<name>.hook.ts`); exports unchanged.
- Verified all 11 hooks are SSR-safe.

## 1.3.16 — 2026-07-13
- Widen peer dependencies to support React 19 (`^18.2.0 || ^19.0.0`).

## 1.3.12–1.3.15 — 2026-07-11
- Rebrand and republish as **hookli** (from `@saif.dev/use-any-hook`).
- Fix `useDarkMode` (persist the correct theme value, SSR-safe).
- Fix `useLocalStorageWithExpiry` (return the inner value, honor expiry, SSR-safe).
- New README, banner, and brand.

_Earlier history is under the previous package name `@saif.dev/use-any-hook`._
