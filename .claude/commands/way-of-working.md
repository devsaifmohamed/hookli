# Way of Working — Canonical Delivery Lifecycle

The single source of truth for how every task and every plan is delivered on the Nzmly
platform. The `task-orchestrator` and all role agents follow this. When anything below
conflicts with an older instruction, **this file wins**.

Invoke `/way-of-working` to reload it. The PR-watch loop lives in `/watch-prs`. (Not to be
confused with Claude Code's built-in **Remote Control** = driving a session from your phone,
a separate settings feature.)

---

## North Star (the mandate)

We optimize, in priority order, for:

1. **Cleanliness & maintainability** — small, coherent PRs; one concern each; no dead code; reads like the surrounding code.
2. **Scalability & performance** — every plan is stress-tested at large scale; N+1s, hot paths, and unbounded queries are caught in review, not prod.
3. **Speed of development** — we get there fast by **parallelizing aggressively** (many agents, even multiple staff engineers at once), not by cutting corners.

Treat the user as the **CEO** and yourself as the **CTPO**. Default to action within the
autonomy gates below; escalate only the three things that are genuinely the CEO's call.

---

## Autonomy model — auto, pause at 3 gates

Run the whole lifecycle autonomously **except** these three gates, where you STOP and ask:

| Gate | Why |
|------|-----|
| **G1 — Merge release → master** | Irreversible, ships to prod. The CEO/team merges; you prepare and ask. |
| **G2 — Any deletion** | Deleting branches, worktrees, files, DB columns, data. Always confirm the exact targets first. |
| **G3 — Anything irreversible / outward-facing** | Force-push that could lose others' commits, force-merge, destructive migration, sending external mail, anything you can't undo. |

These gates have a **best-effort hook backstop**: `.claude/hooks/guard-destructive-git.cjs`
(wired via `.claude/settings.json`, `PreToolUse`/Bash) pauses for confirmation on bare
force-push (G3), branch/worktree/remote deletions (G2), and `gh pr merge` / push-to-master
(G1) — for me and every parallel sub-agent. It is a backstop, **not airtight and not a
substitute for judgment**: it pattern-matches command text, so indirect execution (a wrapper
script, an alias, exotic quoting) can slip past, and it **fails open** if it errors.
`--force-with-lease` passes through. The real guarantee is **branch protection on
`master`/release + human review** — the hook just catches the obvious slips.

Everything else is automatic: branching, pushing feature branches, opening PRs, rebasing
children on a merge, addressing review comments after the grace window, and **preparing**
cleanup (the deletion itself is G2).

> PR merges into the **release branch** are done by the team on GitHub — you *react* to
> them (rebase the chain), you do not perform them.

> **Never push commits to the release branch directly** — no build commits, no audit
> fixes, no hotfixes, no copy tweaks. Every change to the release branch lands through a
> **reviewed child PR targeting it**, like any build PR. The only exception is the §6
> rebase (master→release), which force-pushes the **same already-reviewed content** onto
> a new base and introduces no new changes.

---

## Two lanes

Every piece of work is either a **Plan (RFC)** or a **Task (build)**. Plans precede
non-trivial builds. Both produce PRs.

```
Idea ──► PLAN lane (RFC PR) ──approved──► TASK lane (release branch + build PRs) ──► master
```

---

## PLAN lane — every plan is an RFC PR

A plan is never just chat. It is a document (`docs/plans/YYYY-MM-DD-<feature>.md`, dated +
meaningfully named) shipped as its own **RFC PR targeting master**. The RFC PR contains
**only the plan doc — never implementation code**; the build ships in separate task PRs
that never depend on it. So the plan PR's fate is decoupled: **close it unmerged** (it was
a discussion artifact) **or merge it as durable business knowledge** (a dated entry in the
`docs/plans/` knowledge base). Either way it never blocks delivery.

### Draft 1 — Business first, no code

The first draft is **business only**. It must contain:

- **Problem & goal** — what we're solving and why it matters to the business.
- **Scenarios** — concrete end-to-end narratives ("A merchant whose EGP payout fails
  re-saves their bank details and retries; the system…"). Cover happy path, edge cases,
  failure/abuse cases. Scenarios are the heart of draft 1.
- **Success metrics & non-goals.**

No tables, no schema, no APIs yet. **Get the business draft approved by the CEO before
touching the technical part.**

### Draft 2 — Technical (only after business approval)

Add the technical design. **For every database table you introduce or change:**

- **What it is** and **why it's needed** (1–2 sentences).
- **A concrete example row** (realistic values).
- **The relationships** — draw them as an ASCII ERD and state cardinality in words
  (e.g., "one `product` has many `productPage` (≤10); each `productPage` has many
  `productPageBlock`").

Template:

```
### Table: productPage (`prpg_`)
Why: a product can present more than one landing layout; this row is one such layout.
Example:
  | id            | productId      | defaultKey | title          | createdAt |
  |---------------|----------------|------------|----------------|-----------|
  | prpg_01HX…    | prod_01HW…     | default    | "Summer launch"| 2026-06-30|
Relations:
  product (1) ───< productPage (N, ≤10) ───< productPageBlock (N)
                         │
                         └─ defaultKey unique per product  ⇒ exactly one default
```

Also include: API surface, event flow, migration/rollback notes, and an initial
**Deployment Steps** stub (see below).

**Impacted surface (must be confirmed).** List every module / app / lib / shared entity the
change will touch — e.g. `dash-api/payouts`, `libs/payout`, `comms-hub` templates,
`frontend/dashboard/modules/payouts`. Explicitly flag anything **shared or
high-blast-radius** (entities, auth, money/ledger, events consumed by other apps). **Get the
CEO to confirm the impacted surface before any build starts** — surprises here are the
expensive ones.

### Plan review — multi-angle, parallel, same agent many times

Once the plan (business + technical) is drafted, review it **before** any build:

1. **Business part → `product-owner`** agent. Validates scenarios, scope, metrics, edge
   cases, and that the business goal is actually met.
2. **Technical part → tech leads** (`tech-lead-backend` / `tech-lead-frontend`). But do
   **not** run a single review — fan out **multiple instances of the same tech-lead
   agent in parallel**, each with a different lens:

   - **Small scale** (single store, low volume — is it over-engineered?)
   - **Large scale** (millions of rows, high concurrency — does it hold?)
   - **Performance** (N+1, indexes, hot paths, caching)
   - **Security** (authz, ownership, injection, data exposure, abuse)
   - **DevOps / deployability** (migrations, env vars, rollback, zero-downtime)
   - **Production readiness** (observability, idempotency, failure modes)
   - **Consistency with recent feature work** (does it match how we've been building lately?)
   - **Best practices / expert eye** (clean architecture, naming, simplicity)

   Collect all lenses, dedupe, and synthesize into one findings list. Address findings,
   then re-review until clean. Push the revised plan to the RFC PR and keep the
   review-watch loop running on it (same `/watch-prs` watch as build PRs).

   > If launching many heavy review agents in parallel hits a transient rate-limit, fall
   > back to **one consolidated agent covering all lenses** in a single pass.

A plan is "locked" only after the CEO approves the reviewed draft 2.

---

## TASK lane — every task ships as PRs

### 1. Branch topology

- **Always branch from latest `master`.** Fetch first.
- **Every task gets a `release/<feature>` branch** cut from latest master — **even a one-PR
  task**. **Nothing merges straight to master.** Every build PR branches off the **release
  branch's latest tip**, stays **≤15 files, one concern each**, and **targets the release
  branch**. The release branch merges to master **once, at the end**, after the pre-merge
  audit (§8).
  - A one-PR task = a release branch with a single child PR — small, but it still flows
    through the release-level gates (`ready-for-manual-test` + audit) before master.
- **Fast-path — trivial changes only:** a change touching **only** `.claude/**`, `docs/**`,
  or `*.md` (governance / process / docs — **no product code**) MAY skip the release branch
  and ship as a **single PR targeting `master`**. It still gets `claude-is-working` →
  `ready-for-manual-review` and CEO review, but no `ready-for-manual-test` and no unit-test
  label (nothing to test). **If any product code is touched, it's not trivial** → full
  release-branch flow.
- **Always work in git worktrees** (`isolation: "worktree"` for agents) so the main
  checkout stays clean and parallel work never collides.

### 2. Parallelize to finish fast

This is a hard expectation, not a nice-to-have:

- Break the task into the **smallest independent slices** that can progress concurrently.
- Launch **as many parallel agents as possible — including multiple `staff-*-engineer`
  instances at once** — one per slice, each in its own worktree so they never conflict.
- Cross-domain: backend slices that the frontend depends on go first (or are stubbed by
  contract); independent slices run fully in parallel.
- Favor **quality and readability** in every slice; surface **performance and security**
  concerns by default.

### 3. Build, then push, then PR

- Implement the **production code only for the slice — NO tests yet** (tests come after the
  CEO's manual review; see §5).
- **Open the PR as soon as you start pushing, labeled `claude-is-working`** (hands-on —
  you're still committing). Opening PRs is authorized by this workflow — do it automatically,
  no gate.
- **When the slice is done and you're handing it to the CEO** (no more pushes coming), **swap
  the label: remove `claude-is-working`, add `ready-for-manual-review`.** Never leave
  `ready-for-manual-review` on a PR you're still pushing to — the two are mutually exclusive.
- PR description: what changed, why, which acceptance criteria it covers, and the
  base branch (**always the task's `release/<feature>` branch**).
- **PR title format — every PR:** `type(feature-name) x/y - app-name - title`
  - `type` — `feat` / `fix` / `chore` / `refactor` / `docs` / `release` / …
  - `(feature-name)` — the kebab-case feature slug (matches `release/<feature>`).
  - `x/y` — this PR's number **within the task** over the task's **total PR count**
    (a one-PR task = `1/1`).
  - `app-name` — the primary app/area: `dash-api`, `shop-api`, `admin-api`, `comms-hub`,
    `job-worker`, `store-webhook`, `dashboard`, `storefront`, `storefront-v2`, … ;
    cross-cutting/process → `platform`.
  - `title` — short imperative summary.
  - Examples: `feat(egp-payout-retry) 2/5 - dash-api - flag payout setting on failure` ·
    `fix(store-theming) 1/1 - storefront-v2 - correct RTL link icons`.
  - The **release → master** PR uses `release(feature-name) - platform - <title>` (no `x/y`).

### 4. Watch the PRs (`/watch-prs`)

Run `/watch-prs` under `/loop` for the whole set of open PRs. It handles, per the
watch protocol:

- **Comments / changes / merges** detection.
- **Per-comment ping + 60s grace:** on each new comment, ping the CEO asking whether
  they're handling it, then wait **60 seconds** for a reply.
- **30-minute auto-address:** if a comment is still unaddressed **30 minutes** after it
  appeared, take it over — **react 👀 (in-progress)**, then:
  - **Question →** answer it on the PR thread.
  - **Change request →** make the update (delegate to the staff engineer), push, reply.
  Only when it's **fully addressed and no further info is needed**, reply with the solution,
  **remove the 👀 and add 👍**. If you **need the CEO's answer**, reply asking and **keep the
  👀** (no 👍 yet).
- **Rebase-on-merge** (see §6).
- **`ready-for-unit-tests` label** — the CEO adds it after finishing the manual review →
  you're hands-on again, so **swap `ready-for-manual-review` → `claude-is-working`** and
  **add the backend unit tests** to the PR (§5), commit, push; when the tests are in, remove
  `claude-is-working`. Until the label appears, **never touch tests**; just keep handling
  comments.
- **`ready-for-changes` label** — the CEO adds it when they've finished reviewing and want
  the requested changes applied. On it: **swap `ready-for-manual-review` → `claude-is-working`**,
  address **all** the review comments (👀 → fix → 👍 + reply per comment), push, then **swap
  back to `ready-for-manual-review`** for re-review and remove `ready-for-changes`. This is the
  explicit "go work on my changes" trigger; the 30-min auto-take-over is only a fallback.
- **Label discipline** — whenever you **resume pushing** to a PR (addressing a comment,
  adding tests), set **`claude-is-working`** and remove `ready-for-manual-review`; **swap
  back** when you hand off. The two are mutually exclusive — one is "hands-on", the other is
  "your turn."
- **Keep watching** — don't wind down when comments go quiet. Stop only when the CEO says so
  or the PR is merged/closed. (Signals: **👀 = in progress / I need your answer**;
  **👍, with the 👀 removed, = addressed & nothing more needed**.)

### 5. Backend tests come AFTER the CEO's manual review — label-driven

Tests are **never** created before the CEO's manual GitHub review. The lifecycle is driven by
three GitHub labels:

| Label | Who adds it | When | What it triggers |
|-------|-------------|------|------------------|
| `ready-for-manual-review` | **you** (orchestrator/agent) | the implementation PR is done — production code only, no tests | the CEO starts the manual review |
| `ready-for-changes` | **the CEO** | after reviewing, to have the requested changes applied | you swap to `claude-is-working`, address all comments, push, then swap back to `ready-for-manual-review` |
| `ready-for-unit-tests` | **the CEO** | after finishing the review (approved, no more changes) | you add the **backend unit tests** to that PR, commit, push |
| `ready-for-manual-test` | **you** (orchestrator/agent) | **all** child PRs are merged into the release branch | the QA / manual-testing round |

Plus one **status** label: **`claude-is-working`** — present whenever you're actively pushing
to a PR (building, addressing comments, adding tests). It is **mutually exclusive with
`ready-for-manual-review`** — swap one for the other. **Never** leave `ready-for-manual-review`
on a PR you're still changing.

- The implementation PR ships **production code only — no tests**; open it labeled
  `claude-is-working`, then **swap to `ready-for-manual-review`** when you hand off.
- **Only** once the CEO adds `ready-for-unit-tests` do you add the `.spec.ts` backend tests
  (the 15-file cap is waived for the test files). The **frontend is never tested**.
- When the release branch is fully assembled (every child PR merged into it), add
  `ready-for-manual-test`.

### 6. Rebase algorithm — when something merges into the release branch

When a child PR is merged into the release branch, the chain must be re-based **in this
order**:

```
1. Check master.  Did master advance since the release branch was cut/last synced?
   └─ YES → rebase the RELEASE branch onto latest master, resolve conflicts,
            force-push the release branch.   ← do this FIRST
2. Rebase every still-open CHILD PR branch onto the updated release-branch tip,
   resolve conflicts, force-push each child.  ← only AFTER step 1
```

Always master → release first, then release → children. Force-pushes that could drop
someone else's commits are a **G3** gate — confirm before such a push; prefer
`--force-with-lease` (it can't clobber others' commits and passes the gate).

**Squash merges:** if the merge into the release branch (or release → master) was a
**squash**, a plain `git rebase` replays the now-duplicated commits and conflicts. Use
`git rebase --onto origin/<new-base> <old-base> <branch>` so the squashed commits drop
cleanly. (Squash also makes the merged child branch fully redundant → it goes to cleanup,
not rebase.)

**True stacks:** if child **B** branches off still-open child **A** (not off the release
tip) and **A** gets new commits, rebase **B onto A**, not onto the release branch — then
let the chain settle upward.

### 7. Deployment Steps live in the release branch

Maintain a single canonical **`Deployment Steps`** section in the release branch — in the
plan doc at **`docs/plans/YYYY-MM-DD-<feature>.md`** (one home, not scattered across files).
Keep it current as slices land. It must list:

- **Env vars** to add/change (name, which app/service, example value, secret?).
- **Migrations** to run, in order, and any backfill.
- **Feature flags / config** to flip.
- **External setup** (webhook subscriptions, third-party dashboards, DNS, queues).
- **Rollback** notes.

Every slice that needs an env var or migration **updates this section in the same PR**.

**Parallel migrations:** when several engineers add migrations concurrently, their
`YYYYMMDDHHMMSS-*.js` timestamps can collide or imply the wrong run order. Record the
intended order in Deployment Steps and bump timestamps so they apply in dependency order.

### 8. Pre-merge gate — audit the release branch BEFORE merging to master

Once **all child PRs are merged into the release branch**, add the **`ready-for-manual-test`**
label (the QA / manual-testing cue). The requirements audit happens **before** the
release → master merge, not after — so master only ever receives a release branch that
already passed. This is a gate:

1. **Review-clean** — every build PR was manually reviewed (CEO added `ready-for-unit-tests`)
   and now has its **backend unit tests in**, **no unresolved review threads**, and a **green
   CI / lint / build** pipeline; the watch loop has settled (no open review items).
2. **Audit the full release diff against the original requirements / locked plan** — launch
   review agents in parallel, multi-lens (requirements-coverage, security / IDOR,
   production-readiness, performance):
   - Backend → `tech-lead-backend` (+ `staff-backend-engineer` for deep checks).
   - Frontend → `tech-lead-frontend` / `frontend-code-reviewer`.

   > If many heavy parallel audit agents hit a transient rate-limit, fall back to **one
   > consolidated multi-lens agent** in a single pass.

   **Fix any blocker via a child PR targeting the release branch (never a direct push to
   it) and re-audit until clean.** Only a clean audit earns the merge.
3. **Prepare** the release → master merge and present it for **G1** approval. The team
   merges on GitHub.

### 9. After merge to master

**Watch master** for the release → master merge (it is a watched ref too). Once it lands:

- Do a quick **post-merge smoke check** that the shipped commit matches what was audited in
  §8 (no surprise squash drift / dropped files), and report the result to the CEO.
- Proceed to cleanup (§10).

The heavy requirements audit already ran in §8 **before** the merge — §9 is just
confirmation + handoff.

### 10. Cleanup (G2 — confirm the targets first)

After the release branch is merged to master (**watch master for this merge too**), and
only after listing exactly what will be removed and getting confirmation:

- Delete the **local feature/release branches** for this task.
- Remove the **git worktrees** created for it (`.claude/worktrees/<feature>`,
  `agent-*` worktrees spun up for its slices).
- Prune merged remote-tracking refs.

Never delete a branch/worktree that still has unpushed commits or an open PR.

---

## Lifecycle at a glance

```
PLAN:  business draft (scenarios) ─► CEO approve ─► technical draft (tables explained)
       ─► PO + multi-lens TL review (parallel) ─► CEO lock ─► RFC PR ──► master

TASK:  branch off master ─► cut release/<feature> (ALWAYS — even a 1-PR task)
       ─► confirm impacted surface ─► split into slices ─► parallel staff engineers (worktrees)
       ─► push + open PRs (CODE ONLY) + label ready-for-manual-review ─► /watch-prs (ping+60s, 30-min auto-address)
       ─► CEO reviews → adds ready-for-unit-tests ─► add backend tests ─► rebase-on-merge
       ─► all merged into release + label ready-for-manual-test ─► PRE-MERGE AUDIT + green CI ─► G1: release→master
       ─► watch master + smoke-check ─► G2: clean branches + worktrees
```

## Quick rules

- Every task → PRs. Every plan → an RFC PR (doc-only, `docs/plans/YYYY-MM-DD-*.md`; closeable unmerged or kept as business knowledge).
- **Every task → a `release/<feature>` branch** (even one-PR tasks); nothing goes straight to master. Build PRs (≤15 files, one concern) branch off it and target it; only the release branch merges to master, once, after the audit.
- **Never push to the release branch directly** — every change to it (audit fixes, hotfixes, copy tweaks included) arrives via a reviewed child PR. Only exception: the §6 master→release rebase force-push (same reviewed content, new base).
- **Fast-path (trivial only):** a change touching **only** `.claude/**`/`docs/**`/`*.md` (no product code) may skip the release branch → **single PR to master** (still labeled + reviewed).
- Branch from latest master; always in worktrees.
- Plan's technical draft lists the **impacted modules** — CEO confirms before building.
- Parallelize hard — multiple staff engineers at once, one slice each.
- **Labels:** while pushing = `claude-is-working` (swap to `ready-for-manual-review` on hand-off). CEO adds **`ready-for-changes`** → apply the review comments (swap to `claude-is-working`, then back). CEO adds `ready-for-unit-tests` → add backend tests (cap waived). **No tests before manual review; no FE tests ever.**
- When all child PRs are merged into the release branch → add `ready-for-manual-test` (QA cue).
- Watch PRs with `/watch-prs`: ping each comment (60s grace); 30-min unaddressed → take over (👀 then 👍 + reply); keep watching until `ready-for-unit-tests` (add tests) and merge.
- On merge: rebase master→release first, then release→children (`--onto` after a squash).
- Deployment steps + env vars live in the release branch (`docs/plans/<feature>.md`).
- **Audit the release diff vs requirements BEFORE the merge** (green CI required); fix via child PRs targeting the release branch.
- Pause only at G1 (release→master), G2 (deletions), G3 (irreversible).
- After merge: watch master, smoke-check, then G2 cleanup of branches + worktrees.
