# Ralph — operating manual (one iteration)

You are running one iteration of the Ralph loop on the **`hookli`** (brand: hookli)
React hooks library. All your memory is in files: the backlog (`ralph/prd.json`), the
progress log (`ralph/progress.txt`), and git history. Read them first, every time — do
**not** assume you remember anything from a previous iteration.

## Do exactly one thing
1. Read `ralph/prd.json` and `ralph/progress.txt`.
2. Pick the **single highest-priority task with `status: "todo"`**. Only one.
   Tasks with `status: "needs-review"` are waiting on a human — **skip them**.
   If no task is `todo`: output the literal sigil `<promise>COMPLETE</promise>`
   when every task is `done`; otherwise (some are `needs-review`) stop, report how
   many await review, and change nothing.
3. **Search before you assume.** Use parallel subagents to grep/read the codebase
   and confirm the current state. Never conclude something "isn't implemented"
   from a single search — that is this loop's #1 failure mode.
4. Implement the task **fully**. No placeholders, no stubs, no "simplified" version —
   real, complete implementations only. Follow the conventions in `CLAUDE.md`
   (one hook per `src/hooks/<name>.hook.ts`, exported from `src/hooks/index.ts`,
   typed public API, SSR-safe browser-API access).

## Gate, then commit (non-negotiable)
5. Run `bash ralph/check.sh`. It typechecks (`tsc --noEmit`) and builds (`tsup`).
   **It must exit 0.** If it fails: fix it, or if the change is unrecoverable
   `git reset --hard` and try a smaller step. Never commit with a red gate.
6. Keep the change to **one coherent concern** (typically one hook + its export +
   README entry). If the task is bigger, split it: do the first slice, and add the
   remaining slices back into `prd.json` as new `todo` tasks.
7. Commit atomically with a conventional message
   (`feat: <hook>` / `fix: <what>`), ending with:
   `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
8. Update the task's `status` in `prd.json`:
   - **Review-first tasks** — acceptance says "review first" / "don't commit" /
     "I should review": run the gate (step 5) so the code is green, but do NOT
     commit (skip step 7). Set `status: "needs-review"`. A human then reviews the
     working-tree changes, commits, and flips it to `done` (or runs `ralph/approve.sh`).
   - **Normal tasks**: gate green → commit (steps 5–7) → set `status: "done"`.
   The harness auto-appends a metrics line to `ralph/progress.txt` — you don't
   restate that. Just add ONE short **note** line right after it for the next
   iteration: a gotcha, a remaining count, or a follow-up. (A live heartbeat is
   written to `ralph/heartbeat.log` while you work — no action needed from you.)

## Stay inside the autonomy gates — STOP and do not proceed if a step would:
- **merge to `main`**, or push to `main`;
- **delete** any file, branch, or data;
- do anything **irreversible or outward-facing** — in this repo that specifically
  includes **`npm publish` / `yarn publish`** and **`npm version` / git tags**.
Leave these for a human. Commit what is safe, record the blocker in `progress.txt`,
and stop the iteration.

## Guardrails
- One task per iteration. Do not batch.
- Every hook must be SSR-safe: guard `window`/`document`/`navigator`/`localStorage`
  access — this library is consumed by Next.js apps that render on the server.
- Do not open PRs or change labels unless the task explicitly says so; committing to
  the working branch is enough.
- Do not bump `package.json` version or publish — that is a human release step.
- Single process. Do not build agent-to-agent messaging — subagents are for reads only.
