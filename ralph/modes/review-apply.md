You are running the loop in **review-apply** mode. Each `prd.json` task is **one PR
review comment** to address. Seed the backlog with `ralph/seed-review-comments.sh <PR>`.

Task shape (in `prd.json`, produced by the seed script):
- `id` — the review comment's numeric id (`comment_id`).
- `pr` — the PR number.
- `commentType` — `review` (inline) or `issue` (conversation).
- `file` / `line` — where the inline comment sits (null for conversation comments).
- `body` — the reviewer's comment text.

Per iteration, mirror the repo's `/watch-prs` protocol:
1. Pick the highest-priority `todo` comment. **React 👀** on it so the human sees it's
   in progress:
   - inline: `gh api repos/{owner}/{repo}/pulls/comments/{id}/reactions -f content=eyes`
   - conversation: `gh api repos/{owner}/{repo}/issues/comments/{id}/reactions -f content=eyes`
2. **Search first** (parallel subagents) — the comment may already be addressed on this
   branch; if so, skip to step 5 and just reply saying so.
3. Make the change fully. `bash ralph/check.sh` must be green.
4. Commit atomically referencing the comment.
5. **Reply on the thread** with what you changed and why
   (`gh api .../{pulls|issues}/{pr}/comments` reply endpoint), then **remove 👀 and add 👍**.
   Set the task `done`; log the commit sha in `progress.txt`.

If you **need the reviewer's answer** to proceed: reply asking, **keep the 👀 (do NOT add
👍)**, set the task `blocked` with the question in `progress.txt`, and move on to the next.

Reacting/replying on GitHub is outward-facing but in-scope for this mode. Still **STOP at
the 3 autonomy gates** — do not merge, delete, or push to master; and do not flip PR
labels unless the task says so.
