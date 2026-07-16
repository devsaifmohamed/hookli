# Ralph — operating manual (one iteration)

You are running one iteration of the Ralph loop on **hookli-docs** — the docs + landing
site for the `hookli` React hooks library (npm: `hookli`, GitHub: saifmohamedsv/hookli).
All your memory is in files: the backlog (`ralph/prd.json`), the progress log
(`ralph/progress.txt`), and git history. Read them first, every time — do **not**
assume you remember anything from a previous iteration. Also read `CLAUDE.md` and, once
it exists, `docs/DESIGN.md` (T1's research output) — it is the design source of truth.

## Do exactly one thing
1. Read `ralph/prd.json` and `ralph/progress.txt` (and `docs/DESIGN.md` if present).
2. Pick the **single highest-priority task with `status: "todo"`**. Only one.
   Tasks with `status: "needs-review"` are waiting on a human — **skip them**.
   If no task is `todo`: output the literal sigil `<promise>COMPLETE</promise>`
   when every task is `done`; otherwise stop and report.
3. **Search before you assume.** Read the existing app code first; never re-create
   something that exists. Reuse components across pages.
4. Implement the task **fully** — premium quality, no placeholders except where the
   task explicitly says "placeholder". Real copy, real demos, polished UI.

## Quality bar (non-negotiable)
- **Conventions**: follow `AGENTS.md` → Conventions EXACTLY. Files & folders are **kebab-case**
  (components too: `hook-page.tsx`, not `HookPage.tsx`); exports stay PascalCase. Never rename a
  file toward PascalCase. Named exports only; token-only styling; import order; barrels.
- **Brand** (v3, dark-first, solid — no gradients): ground `#003748`, accent `#30C5CA`, ink
  `#FFFFFF`, muted `#8FB6C2`. Reference `@theme` tokens (`bg-ground`, `text-accent`), never raw
  hexes. `hookli.` wordmark + hook mark; Plus Jakarta Sans (headings/body), monospace only for
  code. No emoji icons — inline SVG (lucide-style) only.
- **UX**: visible focus states, 44px touch targets, `prefers-reduced-motion` respected,
  WCAG AA contrast (4.5:1 body text), responsive at 375 / 768 / 1024 / 1440.
- **Interactive demos import from `hookli`** (installed from npm) — the point of the site
  is live proof the library works. Demos are client components (`"use client"`).
- Hooks are SSR-quirky by nature — wrap browser-dependent demos so `next build`
  (which prerenders) stays green.
- Copy: concise, confident, developer-to-developer. No lorem ipsum, no filler.

## Gate, then commit (non-negotiable)
5. Run `bash ralph/check.sh` (lint + tsc + next build). **It must exit 0.**
   If it fails: fix it, or `git reset --hard` and take a smaller step. Never commit red.
6. Keep the change to **one coherent concern** (~≤15 files). Split bigger tasks: land the
   first slice, append the remainder to `prd.json` as new `todo` tasks.
7. Commit atomically (`feat(site): <what>` / `fix(site): <what>`), ending with:
   `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
8. Update the task's `status` in `prd.json` (`done`), then add ONE short note line to
   `ralph/progress.txt` for the next iteration: a gotcha, remaining count, or follow-up.

## Autonomy gates — STOP if a step would:
- push to any remote, publish to npm, deploy anywhere, or call paid external services;
- delete files outside the task's scope, or touch `~/Developer/rehooks/rehooks-app`
  (the library repo is read-only context for this loop);
- need real payment/donation accounts — donation UI stays a **placeholder** with `#` links.
Commit what is safe, record the blocker in `progress.txt`, and stop the iteration.

## Guardrails
- One task per iteration. Do not batch.
- The dev server is not your gate — `next build` is. Don't leave servers running.
- Web research (T1 or reference checks) uses WebFetch/WebSearch; write findings to
  `docs/DESIGN.md`, not to memory.
- Keep dependencies lean: prefer zero-dep utilities; adding a package needs a reason
  recorded in progress.txt. Approved if genuinely needed: shiki (highlighting),
  lucide-react (icons). Nothing heavier without a note.
- Single process. Subagents are for reads only.
