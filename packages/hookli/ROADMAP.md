# hookli — Roadmap

Tracking doc for growing the hook catalog and the package DX. Work proceeds in **tiers**;
check items off as they land. Each hook has three tracks:

- **lib** — hook + colocated vitest test + barrel + manifest entry (ships to npm)
- **docs** — rich doc-page entry in `apps/docs/lib/hook-docs.ts` (usage, API tables, live demo)
- *(the docs sidebar/index/count auto-derive from the manifest — a hook appears the moment `lib` lands; `docs` just adds the demo + usage)*

> Count today: **41 → target ~55** after Tiers 1–2.

---

## Tier 1 — expected-pair gaps (the "why isn't this here?" hooks)

| hook | category | lib | docs | notes |
|---|---|:--:|:--:|---|
| `useThrottle` | effects | ✅ | ⬜ | the twin of `useDebounce` |
| `usePrevious` | state | ✅ | ⬜ | previous render's value |
| `useUpdateEffect` | effects | ✅ | ⬜ | effect that skips first render |
| `useEffectOnce` | effects | ✅ | ⬜ | run-once effect |
| `useList` | state | ✅ | ⬜ | array state (push/remove/clear) — sibling of `useMap` |
| `useSet` | state | ✅ | ⬜ | Set state — completes map/set/list trio |
| `useKeyPress` | dom | ✅ | ⬜ | true while a key is held |
| `useWindowScroll` | dom | ✅ | ⬜ | reactive `{ x, y }` scroll position |

> **Tier 1 lib: ✅ shipped** (41 → 49 hooks, +20 tests, gate green). Docs demos pending.

## Tier 2 — fill the thin `data` category (only 2 today)

| hook | category | lib | docs | notes |
|---|---|:--:|:--:|---|
| `useAsync` | data | ⬜ | ⬜ | run an async fn → `{ loading, error, value }` |
| `useMutation` | data | ⬜ | ⬜ | async write action with status |
| `usePagination` | data | ⬜ | ⬜ | page/limit/offset state helper |
| `useNetworkState` | data | ⬜ | ⬜ | online/offline + connection info |
| `usePageVisibility` | effects | ⬜ | ⬜ | tab focus/blur via `visibilitychange` |
| `useIdle` | dom | ⬜ | ⬜ | user-inactivity detection |

## Tier 3 — rounding-out (backlog)
`useQueue` · `useDefault` · `useLongPress` · `useFullscreen` · `useTextSelection` ·
`useRafState` · `useDeepCompareEffect` · `useBattery` · `usePermission` · `useHotkeys`

---

## Package & DX enhancements (not hooks)

- ⬜ `size-limit` in CI + a per-hook gzipped-size badge ("every hook < 0.5 kB")
- ⬜ Hook generator script (`pnpm new:hook use-foo`) — scaffolds folder + test + manifest entry
- ⬜ Per-hook subpath exports (`import { useToggle } from "hookli/use-toggle"`)
- ⬜ Changesets — automated versioning + changelog (also fixes git-tag ↔ npm drift)
- ⬜ "Compare vs react-use / usehooks-ts" table in the docs
- ⬜ StackBlitz "open in playground" per hook page
