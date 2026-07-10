# Ralph — a gated, self-driving task loop for `@saif.dev/use-any-hook`

> Ported into this repo from the original Nzmly-platform harness. The mechanics below are
> general; the concrete examples (apps, globs, gate steps) still describe that monorepo —
> in **this** repo the gate is `ralph/check.sh` = `tsc --noEmit` + `tsup build`, and the
> backlog lives in `ralph/prd.json`. See the repo root `CLAUDE.md` for local conventions.

> A small, auditable harness that lets an AI agent grind through a **bounded backlog**
> one verified slice at a time — never landing a line of code that hasn't passed the
> same gates a human PR would. Built and hardened for this repo by **@saifmohamedsv**.

---

## What this is

Ralph is an adaptation of the ["Ralph technique"](https://ghuntley.com/ralph/): a
**stateless** agent loop where *all* memory lives in files — the backlog (`prd.json`),
a durable progress log (`progress.txt`), and git history — and where **hard verification
gates supply the back-pressure**. Every iteration the agent starts with a blank context,
reads the backlog, does **exactly one** task, must pass `check.sh`, commits atomically,
and appends what it learned. Then it forgets everything and does it again.

Vanilla Ralph is a greenfield bootstrapper that writes a whole app from nothing. This
harness is deliberately re-pointed at an **existing, production** codebase, so it is
aimed at **bounded, well-specified backlogs** — the work where a tireless, gate-checked
loop genuinely outperforms a human doing it by hand:

- convention / lint / format sweeps at scale
- applying a batch of PR review comments
- mechanical migrations (enum extraction, symbol consolidation, dead-code removal)
- backend test-coverage backfill

The design goal throughout: **the loop may wander, but it can never land un-gated,
un-reviewed, or out-of-policy code.** Everything below exists to make that guarantee hold.

> **New here? Read [`GUIDE.md`](./GUIDE.md)** — the hands-on dev guide: the rules, how to
> run it, what happens across 1–10 tasks, and how to write the perfect `prd.json`.

---

## Design principles

1. **Files are the only memory.** No hidden state, no long-lived process assumptions.
   Anyone can read `prd.json` + `progress.txt` + `git log` and know exactly where the loop
   is. Kill it at any point and the next iteration picks up cleanly.
2. **The gate is the contract.** `check.sh` runs the *real* per-app toolchain. If it
   isn't green, nothing is committed. A convention you care about → make it a deterministic
   lint rule the loop cannot fudge.
3. **One coherent concern per iteration, ≤15 files.** Same discipline as our PRs. Bigger
   tasks are split back into the backlog rather than landed as a mega-commit.
4. **Human gates are non-negotiable and hook-backstopped.** Merges to master, deletions,
   and anything irreversible are stopped in the prompt *and* by a repo hook — belt and
   suspenders.
5. **Every iteration is observable.** A live heartbeat while it works; a structured audit
   line after. You are never guessing what it did.

---

## File map

| File | Role |
|------|------|
| `prompt.md` | the operating manual the agent executes each iteration (the "one iteration" contract) |
| `prd.json` | the backlog — one task per ≤15-file slice; `status: todo \| needs-review \| blocked \| done` |
| `progress.txt` | durable cross-iteration memory — the harness appends one structured line per run |
| `check.sh` | **the gate** — format + lint + typecheck + i18n + (backend) build/test, scoped to the apps that changed |
| `_run.sh` | one iteration (shared core): dirty-tree warning → runner select → prompt assembly → `claude -p`, wrapped in progress tracking |
| `lib-progress.sh` | progress tracking — live `heartbeat.log` while a run works + the structured `progress.txt` line after |
| `ralph-once.sh` | run a single iteration, human-in-the-loop — **start here** |
| `afk-ralph.sh` | bounded autonomous loop: `./ralph/afk-ralph.sh 20` |
| `approve.sh` | the human half of a review-first task — commit + flip to `done` + log, in one call |
| `seed-review-comments.sh` | build a review-apply backlog from a PR's unresolved review threads |
| `modes/*.md` | optional prompt overlays that specialise a run (`--mode <name>`) |
| `heartbeat.log` | ephemeral live progress of the current iteration (gitignored) — `tail -f` it |

---

## Quick start

```bash
# 1. Work on a release/<feature> branch — never master. A dirty tree is allowed
#    (you get a warning); commit or stash first if you want strictly atomic iterations.
git switch -c release/<feature> origin/master

# 2. Write your backlog into ralph/prd.json (replace the example tasks).

# 3. Watch ONE iteration first — build intuition before you let it run.
./ralph/ralph-once.sh

# 4. When you trust it, let it run. The cap is your cost ceiling.
./ralph/afk-ralph.sh 20
#    --sandbox       run the CLI inside `docker sandbox`
#    --mode <name>   apply a prompt overlay (see Modes)
```

**Authoring `prd.json`** — it is a JSON object with a `tasks` array; each task is one
`≤15-file` slice with a `status`. Add work by appending objects to `tasks` (a normal
growing backlog), not by keeping a parallel array. Give review-first tasks acceptance text
that says "review first" / "don't commit".

---

## The gate (`check.sh`) — the whole point

The agent is free to explore, but it **cannot commit code that isn't green**. `check.sh`
inspects both staged and unstaged changes, figures out which apps were touched, and runs
**only those** gates (trailing-slash matching so `storefront/` never triggers on
`storefront-v2/`):

- **storefront-v2 / dashboard** — `eslint --fix` (convention + format), `tsc --noEmit`
  (ignoring the known stale `.next/types/validator.ts` artifact), `i18n:lint` (AR/EN key
  coverage), and a **Chakra-types drift check** (`gen-chakra-types` must leave the tree clean).
- **storefront** — `next lint && tsc`.
- **backend** — `prettier` + `eslint --fix` + `nest build`, then scoped `test:all apps/$app`
  for **every** changed app. Never a bare `npm test` — that OOMs the monorepo.

> Make every convention you can into a deterministic fixer. The loop respects rules it
> can't argue with far better than prose in the prompt.

---

## Modes — prompt overlays

A **mode** is a Markdown overlay (`ralph/modes/<name>.md`) prepended to `prompt.md` to
specialise a run. Pass `--mode <name>` to `ralph-once.sh` / `afk-ralph.sh`. Two ship today:

**`convention-sweep`** — each task states a **convention rule** with a `scope` and
`good`/`bad` examples; the loop finds every violation in scope and refactors one ≤15-file
slice per iteration, behaviour-preserving and gate-green.

```jsonc
// a convention-sweep task:
{ "rule": "no raw quiz-type string compares — use QuizQuestionType",
  "scope": "frontend/storefront-v2/src/modules/account",
  "good": "type === QuizQuestionType.MultiSelect",
  "bad":  "type === 'multi_select'",
  "status": "todo" }
```

**`review-apply`** — each task is one **unresolved PR review comment**; the loop reacts,
fixes, gates, and moves on (mirrors `/watch-prs`). Seed the backlog straight from a PR:

```bash
./ralph/seed-review-comments.sh 424 > ralph/prd.json   # inspect first — prints to stdout
./ralph/afk-ralph.sh 20 --mode review-apply
```

`seed-review-comments.sh` pulls **only unresolved inline review threads** (resolved ones
skipped; conversation comments excluded) via `gh api graphql`, one task per comment
(`id`, `file`, `line`, `body`, `author`), and stamps the PR's base branch as the release branch.

---

## Progress & the review-first workflow

**Live heartbeat.** While a (headless, non-streaming) iteration runs, a background watcher
polls the working tree every 15s and appends to `ralph/heartbeat.log`. `tail -f` it to see
the phase (`searching → editing + files touched → done`) and elapsed time in real time. It
is gitignored and `disown`'d, so it never leaves terminal noise or a job-control artifact.

**Structured `progress.txt`.** After each iteration the harness appends one audit line:

```
<ISO-ts> · <sha|—> · <duration> · <N files> · gate:<green|review|—> · done <D>/<T> · review <R> · <subject>
```

`gate:green` is inferred from "a commit landed" (the model only commits on a green gate);
`gate:review` means files changed but nothing was committed (a review-first task);
`—` means the iteration landed nothing.

**Review-first tasks.** A task whose acceptance says *"review first" / "don't commit" /
"I should review"* runs the gate so the code is green **but does not commit**. It moves
`todo → needs-review`, and the loop **skips** `needs-review` tasks (they're waiting on you).
You inspect the working tree, then:

```bash
./ralph/approve.sh <task-id> ["commit message"]
```

`approve.sh` flips the task to `done` **first** (so the status change is part of the
approved commit — atomic), then `git add -A` + commits with the repo trailer, and logs a
`reviewed+approved` line to `progress.txt`. It **never pushes, merges, or deletes** — your
normal flow does that.

**Status vocabulary:** `todo` → `needs-review` (awaiting your review) / `blocked`
(recorded, can't proceed) → `done`.

---

## Safety — it stays inside our way-of-working

- **≤ 15 files per commit.** Bigger tasks are split back into `prd.json` as new `todo` slices.
- **Autonomy gates are hook-backstopped** (`.claude/hooks/guard-destructive-git.cjs`).
  A release→master merge / push to master, any branch/worktree/file deletion, `rm -rf`, or
  a bare `--force` push all resolve to an "ask" — which a headless run can't answer, so they
  **stall instead of executing**. Best-effort and fail-open (covers `git` / `gh` / `rm`); the
  same rules are also spelled out in `prompt.md` so the agent stops on its own.
- **Commits to the working branch only.** Humans open the PRs, flip the labels, and merge —
  exactly per `CLAUDE.md`. The loop never touches the delivery gates.
- **`acceptEdits` permission mode** keeps the loop from stalling on file-write prompts while
  leaving every human gate above fully in force.

---

## How it fits the delivery lifecycle

Ralph produces **commits on a release/feature branch** — nothing more. From there the work
re-enters the normal Nzmly flow described in `CLAUDE.md` and `/way-of-working`: small PRs
(≤15 files), `claude-is-working` → `ready-for-manual-review`, the CEO's review labels, and
release→master only after a clean audit. Ralph is an accelerant for the *implementation*
step; it is intentionally blind to everything downstream of the commit.

---

## Authorship

Designed, built, and hardened for the Nzmly platform monorepo by **@saifmohamedsv** —
including the progress-tracking layer (live heartbeat + structured `progress.txt`), the
review-first / `needs-review` workflow and `approve.sh`, the per-app scoped gate, the
review-comment seeder, the mode-overlay system, and the unattended-safety pass that wired
the loop into our autonomy gates. Iterations are co-authored with Claude and land under the
repo's standard commit trailer:

```
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```
