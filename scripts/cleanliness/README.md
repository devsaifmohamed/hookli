# Cleanliness score

Measures how clean the hook docs setup is, from 0 to 100, so we can compare **before** and **after** the
"one source of truth per hook" work ([RFC](../../docs/plans/2026-11-21-single-source.md)). Target: 90 or more.

```bash
pnpm score --results scripts/cleanliness/before-results.json
```

## The three files

| File | What it does | Stays in `main`? |
|---|---|---|
| `scripts/score.mjs` | Prints the score table. It adds up 5 metrics: how many places each hook fact is hand-written (M1), how many files you edit for common changes (M2), how many common mistakes CI catches (M3), how many generated files are committed (M4), how many generator scripts exist (M5). | Yes, so the score can be checked again later. |
| `scripts/cleanliness/before-replay.mjs` | Measures **today's** setup once. In a throwaway copy of the repo it really does each change (add, fix, rename, delete a hook…) and each mistake (forgot the docs entry, wrong type…), runs CI, and counts the files touched and the mistakes caught. Takes about 9 minutes. | No. Deleted before the release merges. |
| `scripts/cleanliness/before-results.json` | The saved output of that replay, so the score can be printed without re-running it. | No. Its numbers go into the release PR. |

## Today's result (before)

**40.6 / 100.** Adding a hook takes 15 hand-edited files (ideal 7), and 7 of 15 common mistakes pass CI
silently. After the refactor, the scenario and mistake tests that live next to the generator produce the
"after" results, and the same `pnpm score` prints the after score.
