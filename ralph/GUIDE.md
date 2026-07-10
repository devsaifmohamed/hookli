# Ralph — Dev Guide

A working dev's guide to running the Ralph loop. Ported from the Nzmly-platform harness;
the `prd.json` examples below still show that monorepo's apps/globs — in this repo the gate
is `ralph/check.sh` (`tsc --noEmit` + `tsup build`) and tasks target `src/hooks/*`.
For the architectural overview and file map, see [`README.md`](./README.md).

---

## 1. Mental model (30 seconds)

Ralph is a **stateless loop that does one gated task at a time**. Each iteration it:
reads `prd.json` + `progress.txt` → picks the top `todo` → implements it → runs
`check.sh` (the gate) → commits **only if green** → logs a line → forgets everything →
repeats. All memory is in files, so you can kill it anytime and it resumes cleanly.

It produces **commits on your release branch — nothing else.** It never opens PRs, flips
labels, merges, deletes, or pushes to master. You do all of that.

---

## 2. The rules (non-negotiable)

| Rule | Why |
|------|-----|
| **Run on a `release/<feature>` branch, never master** | Ralph commits directly to the checked-out branch. |
| **One task = one ≤15-file slice** | Same as our PR discipline. Bigger work gets split back into `prd.json`. |
| **The gate is law** | No green `check.sh` → no commit. Don't weaken the gate to "make it pass." |
| **Human gates stall the loop** | master merge/push, any delete, `rm -rf`, bare `--force` are blocked by a hook + the prompt. It stops, you decide. |
| **Watch before you trust** | Always `ralph-once.sh` first on a new backlog. Only `afk-ralph.sh N` once you've seen it behave. |
| **The cap is your cost ceiling** | `afk-ralph.sh 10` = at most 10 iterations = bounded spend. |
| **Commit hygiene** | It runs `git add -A`. Start from a **clean tree** (or accept the dirty-tree warning) so an iteration doesn't sweep in unrelated changes. |

---

## 3. How to run

```bash
# 0. Clean tree on a fresh release branch
git switch -c release/my-feature origin/master

# 1. Write your backlog into ralph/prd.json  (see §5)

# 2. Watch ONE iteration
./ralph/ralph-once.sh

# 3. In another terminal, watch it live
tail -f ralph/heartbeat.log

# 4. When you trust it, let it run (cap = 10 here)
./ralph/afk-ralph.sh 10
#    --sandbox       run inside docker sandbox
#    --mode <name>   convention-sweep | review-apply
```

---

## 4. What happens when you run — 1 task vs 10 tasks

**One iteration (`ralph-once.sh`)** does exactly this:

1. Reads `prd.json` + `progress.txt`.
2. Picks the **single highest-priority `todo`** (skips `needs-review` / `blocked` / `done`).
3. Searches the codebase to confirm real state (parallel read subagents).
4. Implements the task fully — no stubs.
5. Runs `bash ralph/check.sh`. **Red → it fixes or resets; never commits red.**
6. **Branch on task type:**
   - *Normal task* → commits atomically → sets `status: "done"`.
   - *Review-first task* (acceptance says "don't commit / I should review") → gate green but
     **no commit** → sets `status: "needs-review"`.
7. Harness appends one audit line to `progress.txt`.

**The loop over 10 tasks (`afk-ralph.sh 10`)** is just that iteration, up to 10 times,
**fresh context each time**:

```
iter 1 → task T1 (todo→done, commit #1)
iter 2 → task T2 (todo→done, commit #2)
...
iter k → no `todo` left:
          • all done            → prints <promise>COMPLETE</promise> → loop STOPS early
          • some needs-review   → stops, reports "N await review", changes nothing
iter 10 → hits the cap → stops, tells you to re-run or inspect progress.txt
```

Key facts about the loop:
- **One task per iteration.** 10 tasks ≠ one big run; it's 10 small, independently-gated commits.
- **Stops early** when the backlog is drained (doesn't waste your cap).
- A **red or transient iteration doesn't abort the batch** — the next one starts fresh.
- `needs-review` tasks are **invisible to the loop** — they wait for you.

---

## 5. How to write the perfect `prd.json`

**Shape** — one object, a `tasks[]` array. Add work by appending task objects.

```jsonc
{
  "feature": "storefront-v2-quiz-cleanup",
  "description": "One-line what this backlog is.",
  "release_branch": "release/quiz-cleanup",
  "constraints": {
    "max_files_per_commit": 15,
    "target_apps": ["frontend/storefront-v2"],
    "never": ["merge to master", "delete files/branches", "push to master"]
  },
  "tasks": [
    {
      "id": "T1",
      "title": "Short imperative summary of the slice",
      "app": "frontend/storefront-v2",
      "priority": 1,
      "acceptance": [
        "Concrete, checkable outcome #1",
        "Concrete, checkable outcome #2",
        "bash ralph/check.sh is green"
      ],
      "status": "todo"
    }
  ]
}
```

**The anatomy of a good task:**

| Field | Rule |
|-------|------|
| `id` | stable, unique (`T1`, `T2`, …) — the loop and `approve.sh` key on it. |
| `title` | one imperative line, one concern. |
| `priority` | lower = picked first. |
| `app` | the target app, so the right gate runs. |
| `acceptance[]` | **the contract.** Concrete, verifiable bullets. Always end with `"bash ralph/check.sh is green"`. Add `"Don't commit — I review first"` to make it a review-first task. |
| `status` | start every real task at `"todo"`. |

**The 6 rules of a perfect PRD:**

1. **Bounded** — each task fits in ≤15 files. If it can't, it's two tasks.
2. **Verifiable** — acceptance is checkable, not vibes. "Uses `QuizQuestionType` enum, no raw
   string compares" ✅ · "make quizzes better" ❌.
3. **Self-contained** — a task must be doable from a **cold read** of the repo. Don't rely on
   context only you have.
4. **Deterministic where possible** — encode conventions as lint rules (`convention-sweep`
   mode) so the gate enforces them, not prose.
5. **Ordered** — use `priority` so dependencies land first (e.g. shared enum before its call sites).
6. **Explicit on review** — anything risky/creative → mark **review-first** ("I review before
   commit") so it lands in `needs-review` instead of auto-committing.

**Good vs bad task:**

```jsonc
// ✅ GOOD — bounded, verifiable, self-contained
{ "id":"T3", "title":"Extract quiz-status strings into QuizQuestionType enum",
  "app":"frontend/storefront-v2", "priority":1,
  "acceptance":[
    "New enum in src/modules/account/quiz/types.ts",
    "Replace all 'multi_select'/'single_select' raw compares in that module",
    "No behaviour change",
    "bash ralph/check.sh is green"
  ], "status":"todo" }

// ❌ BAD — unbounded, unverifiable, needs hidden context
{ "id":"T4", "title":"Improve the quiz UX", "status":"todo" }
```

---

## 6. The review-first flow (for creative / risky tasks)

Add `"Don't commit — I should review first"` to acceptance → the loop does the work +
greens the gate but **stops without committing** and sets `needs-review`. Then you:

```bash
git diff                              # inspect the working tree
./ralph/approve.sh T1 "feat(...): …"  # flips T1→done, commits (with trailer), logs
# approve.sh never pushes/merges/deletes — your normal flow does that
```

---

## 7. Reading progress

- **Live:** `tail -f ralph/heartbeat.log` → phase (searching → editing + files) + elapsed.
- **After each run** in `progress.txt`:
  ```
  ts · sha|— · duration · N files · gate:green|review|— · done D/T · review R · subject
  ```
  `gate:green` = committed · `gate:review` = changed but held for review · `—` = landed nothing.

---

## 8. Modes (optional overlays)

- `--mode convention-sweep` — each task is a **rule** (`rule` + `scope` + `good`/`bad`); the
  loop finds & fixes every violation, one slice per iteration.
- `--mode review-apply` — each task is one **unresolved PR comment**; seed it with
  `./ralph/seed-review-comments.sh <PR> > ralph/prd.json`.

---

## TL;DR

> Branch off master → write small, verifiable, ≤15-file tasks in `prd.json` →
> `ralph-once.sh` to watch, then `afk-ralph.sh N` → each iteration does one task and commits
> only on a green gate → the loop stops when the backlog drains → you review `needs-review`
> tasks with `approve.sh`, then open PRs the normal way.
