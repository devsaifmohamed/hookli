---
description: Watch the current task's open PR(s) and handle review comments (the PR-watch loop)
---

Watch the open PR(s) for the current task and follow this loop until I tell you to stop (or the PRs are merged/closed):

1. **Poll** each PR for new review comments and conversation comments.

2. **Ping me** about each new comment, asking whether I'm handling it / am done, then **wait 60 seconds** for my reply.

3. If I don't reply within 60s, keep watching. Once the **same comment has been unaddressed for 30 minutes**, start working it (step 4).

4. **When you START working a comment, react 👀 (`eyes`) on it** so I can see it's in progress:
   - Review (inline) comment: `gh api repos/{owner}/{repo}/pulls/comments/{COMMENT_ID}/reactions -f content=eyes`
   - Conversation (issue) comment: `gh api repos/{owner}/{repo}/issues/comments/{COMMENT_ID}/reactions -f content=eyes`

5. **Address it** — make the change. Act automatically; **pause only at the 3 autonomy gates**: release→master merge (G1), any deletion (G2), anything irreversible (G3).
   - **If you need an answer from me to proceed:** reply asking, and **keep the 👀** — do **not** add 👍. (A 👀 that stays means "in progress / waiting on your answer.")

6. **Only when the comment is fully addressed AND no further info is needed:** reply on its thread with the solution (what you changed and why), then **remove the 👀 and add 👍**:
   - Add 👍 — inline: `gh api repos/{owner}/{repo}/pulls/comments/{COMMENT_ID}/reactions -f content=+1` · conversation: `gh api repos/{owner}/{repo}/issues/comments/{COMMENT_ID}/reactions -f content=+1`
   - Remove 👀 — find its id `gh api repos/{owner}/{repo}/pulls/comments/{COMMENT_ID}/reactions --jq '.[]|select(.content=="eyes").id'` then `gh api -X DELETE repos/{owner}/{repo}/pulls/comments/{COMMENT_ID}/reactions/{REACTION_ID}` (issue comments: swap `pulls`→`issues`).

Signals: **👀 = in progress / I need your answer** · **👍 (with the 👀 removed) = addressed, nothing more needed**.

**Labels drive the review / test / QA lifecycle** (`/way-of-working` §5) — watch and set them:

- **While you're actively pushing to a PR** (opening it, addressing comments, adding tests),
  it carries **`claude-is-working`** — NOT `ready-for-manual-review`. They're **mutually
  exclusive**; never leave `ready-for-manual-review` on a PR you're still changing.
  `gh pr edit <num> --add-label claude-is-working`
- **When you hand off to the CEO** (done pushing, ready for review), **swap the labels**:
  `gh pr edit <num> --remove-label claude-is-working --add-label ready-for-manual-review`
- **When the CEO adds `ready-for-changes`** (reviewed → wants the changes applied), **swap to
  `claude-is-working`**, address **all** the review comments (👀 → fix → 👍 per comment), push,
  then **swap back to `ready-for-manual-review`** for re-review:
  `gh pr edit <num> --remove-label ready-for-changes,ready-for-manual-review --add-label claude-is-working`
- **Never add tests before** the CEO adds **`ready-for-unit-tests`**. Poll for it —
  `gh pr view <num> --json labels --jq '.labels[].name'` — and when it appears, **swap back to
  `claude-is-working`**, **add the backend unit tests** to that PR, commit, push, then remove
  `claude-is-working`. (Frontend is never tested.)
- When **all** child PRs are merged into the release branch, add **`ready-for-manual-test`**
  (the QA cue): `gh pr edit <release-pr> --add-label ready-for-manual-test`.
- **Keep watching** through all of this — don't stop just because comments went quiet; stop
  only when the CEO says so or the PR is merged/closed.

**When the release branch is assembled and manual testing is signalled**, run the
**pre-merge gate** (`/way-of-working` §8): green CI + a requirements audit on the release
branch, fix any blocker there, then prepare the release → master merge (G1). **On a
release → master merge**, do the post-merge smoke check (§9) and prepare cleanup (§10, G2 —
confirm first).

This is the repo's default PR-watch protocol (enabled via the `SessionStart` hook in `.claude/settings.json`).

> **Not** Claude Code's built-in **Remote Control** (driving a session from your phone via
> claude.ai). That's a separate, unrelated feature configured in settings
> (`remoteControlAtStartup`) — this file is only the GitHub PR-watch loop.
