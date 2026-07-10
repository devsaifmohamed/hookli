#!/usr/bin/env bash
#
# seed-review-comments.sh — build a review-apply backlog from a PR's UNRESOLVED
# inline review threads. Prints prd.json to stdout (inspect, then redirect):
#
#   ./ralph/seed-review-comments.sh 424 > ralph/prd.json
#   ./ralph/afk-ralph.sh 20 --mode review-apply
#
# Only unresolved review threads are included (resolved / already-handled ones are
# skipped). Conversation (issue) comments are not included — inline review threads only.
set -euo pipefail

PR="${1:-}"
[[ -n "$PR" ]] || { echo "usage: $0 <pr-number> > ralph/prd.json" >&2; exit 1; }

read -r OWNER NAME < <(gh repo view --json owner,name --jq '.owner.login + " " + .name')
BASE="$(gh pr view "$PR" --json baseRefName --jq '.baseRefName')"

threads="$(gh api graphql -F owner="$OWNER" -F name="$NAME" -F pr="$PR" -f query='
  query($owner:String!, $name:String!, $pr:Int!) {
    repository(owner:$owner, name:$name) {
      pullRequest(number:$pr) {
        reviewThreads(first: 100) {
          nodes {
            isResolved
            comments(first: 1) {
              nodes { databaseId path line originalLine body author { login } }
            }
          }
        }
      }
    }
  }')"

echo "$threads" | jq --arg pr "$PR" --arg base "$BASE" '
  [ .data.repository.pullRequest.reviewThreads.nodes[]
    | select(.isResolved == false)
    | .comments.nodes[0]
    | select(. != null)
    | {
        id: .databaseId,
        pr: ($pr | tonumber),
        commentType: "review",
        author: .author.login,
        file: .path,
        line: (.line // .originalLine),
        title: (.body | split("\n")[0] | .[0:80]),
        body: .body,
        status: "todo"
      }
  ] as $tasks
  | {
      feature: ("review-apply-pr-" + $pr),
      description: ("Unresolved inline review comments on PR #" + $pr + ", one task each."),
      mode: "review-apply",
      release_branch: $base,
      constraints: {
        max_files_per_commit: 15,
        never: ["merge to master", "delete files/branches", "push to master"]
      },
      tasks: ($tasks | to_entries | map(.value + { priority: (.key + 1) }))
    }'
