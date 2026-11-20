# Changelog

All notable changes are documented here. This project follows semantic versioning.
Releases are also published at https://github.com/devsaifmohamed/hookli/releases.

## 1.7.0 — 2026-11-20
- `useEventListener`, `useHover` and `useResizeObserver` accept the element itself as well as a ref (`RefObject<T> | T | null`). Keep the element in state with `ref={setEl}` to follow an element that a child component mounts with its own state, which a `useRef` cannot report. `null` attaches nothing. Refs work as before.
- Docs: a "mounted by a child component" example for each of the three hooks.

## 1.6.8 — 2026-11-20
- Fix: `useEventListener`, `useHover` and `useResizeObserver` follow elements that mount after the first render or replace another element (#12).
- Behaviour change: `useEventListener` with a ref listens only on the ref's element and attaches nothing while it is `null`. It no longer falls back to `window`. Without a ref it still listens on `window`.

## 1.6.7 — 2026-11-20
- Types: `useClickOutside`, `useHover`, `useIntersectionObserver` and `useResizeObserver` accept `RefObject<T | null>`, so React 19 refs type-check.
- Fix: `useNetworkState` returns `{ online: true }` during server rendering on Node 21+.
- `hookli/package.json` is exported.

## 1.3.21 – 1.6.6
- Grew from 11 to 66 hooks, with docs at https://hookli.vercel.app. These versions were not logged here.

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
