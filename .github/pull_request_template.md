<!-- TITLE: type(feature) x/y - area - title   (e.g. feat(order-refunds) 2/3 - api - refund service). x/y = this PR's number / total PRs in the task; release→base PR: release(feature) - <repo> - <title>. -->
<!-- Way of working: /way-of-working:way-of-working. Production-code portion within the profile's pr.max_files, one concern (test files don't count). -->

## What & why
<!-- What changed and the problem it solves. -->

## Base branch
<!-- The task's release branch; the base branch for a 1/1 task; or the branch of the PR below this one in a stack. -->

## Stack (bottom → top)
<!-- Only if this PR is a stack layer; delete otherwise. Mark THIS PR and keep the map current.
- #101 1/3 - api - <title>   ← base of this PR
- #102 2/3 - api - <title>   👈 THIS PR
- #103 3/3 - web - <title>
Trunk: `release/<feature>` · merge strictly bottom-up. -->

## Acceptance criteria covered
- [ ]

## Impacted areas
<!-- Areas / modules / packages touched. Flag high-blast-radius ones (shared models, auth, money, contracts other apps consume). -->

## Deployment Steps
<!-- Required if this adds/changes any of these; otherwise write "None". -->
- **Env vars:**
- **Migrations (in order):**
- **Feature flags / config:**
- **External setup:**
- **Rollback:**

## Tests
<!-- Per the area's test policy in .claude/workflow.json: with-code / after-review / never. -->
- [ ]

## Checklist
- [ ] Within the file cap, one coherent concern
- [ ] Area verify commands pass; green CI
- [ ] Branched from the latest base; rebased if the base advanced

