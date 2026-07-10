#!/usr/bin/env node
/*
 * Way-of-working safety gates (see the /way-of-working skill).
 * PreToolUse(Bash) guard: emits permissionDecision "ask" for irreversible git
 * ops so the harness pauses for confirmation — including for parallel sub-agents.
 *
 *   G1  merge to master  (gh pr merge, direct push to master/main)
 *   G2  deletions        (git branch -d/-D, remote branch delete -d/--delete/:ref,
 *                         git update-ref -d, push --mirror, git worktree remove, rm -rf <worktree>)
 *   G3  destructive force-push  (bare --force / -f; --force-with-lease is allowed through)
 *
 * Best-effort BACKSTOP, not airtight — it pattern-matches command text and can be
 * evaded (indirect execution via a script, aliases, unusual quoting). It complements
 * judgment + branch protection; it does not replace them. Fail-open by design: any
 * parse/logic error falls through to the normal permission flow rather than bricking
 * every Bash call. (settings.json pre-filters so node only runs on git/gh/rm commands.)
 */
'use strict'

function ask(gate, reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: `[${gate}] ${reason} — way-of-working gate; confirm before proceeding.`,
      },
    }),
  )
  process.exit(0)
}

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => {
  raw += chunk
})
process.stdin.on('end', () => {
  try {
    const cmd = ((JSON.parse(raw || '{}') || {}).tool_input || {}).command || ''
    if (!cmd) process.exit(0)

    // Strip quoted text first so commit messages / PR bodies that merely *mention*
    // these commands (e.g. git commit -m '... git push -f ...') don't trip the guard.
    const unquoted = cmd.replace(/'[^']*'/g, ' ').replace(/"[^"]*"/g, ' ')

    // Evaluate each command separately so flags don't leak across a chain/pipeline.
    const segments = unquoted.split(/&&|\|\||[;|\n]/)
    for (const segRaw of segments) {
      // Drop wrapping shell punctuation like a trailing ')' from a subshell so
      // `(... git push -f)` still matches the -f boundary.
      const seg = segRaw.replace(/[()]/g, ' ').trim()
      if (!seg) continue

      const isGit = /\bgit\b/.test(seg)
      const isPush = isGit && /\bpush\b/.test(seg)

      // G3 — destructive force-push. --force-with-lease / --force-if-includes pass through.
      if (isPush) {
        const bareForceLong = /(^|\s)--force(?![\w-])/.test(seg) // excludes --force-with-lease
        const bareForceShort = /(^|\s)-f(?![\w-])/.test(seg)
        if (bareForceLong || bareForceShort) {
          ask('G3', "destructive force-push (use --force-with-lease, which can't clobber others' commits)")
        }
        if (/(^|\s)--mirror(?![\w-])/.test(seg)) {
          ask('G2', 'push --mirror can delete remote refs')
        }
      }

      // G1 — merge to master.
      if (/\bgh\s+pr\s+merge\b/.test(seg)) {
        ask('G1', 'merging a PR (release→master is the gated one; the team normally merges on GitHub)')
      }
      if (isPush && /(^|\s|:)(master|main)(\s|$)/.test(seg)) {
        ask('G1', 'direct push to master/main')
      }

      // G2 — deletions.
      if (isGit && /\bbranch\b/.test(seg) && /((^|\s)-[dD]\b|--delete\b)/.test(seg)) {
        ask('G2', 'deleting a git branch')
      }
      if (isGit && /\bupdate-ref\b/.test(seg) && /(^|\s)-d\b/.test(seg)) {
        ask('G2', 'deleting a ref via git update-ref -d')
      }
      if (isPush && (/--delete\b/.test(seg) || /(^|\s)-[dD]\b/.test(seg) || /\s:[^\s]/.test(seg))) {
        ask('G2', 'deleting a remote branch')
      }
      if (isGit && /\bworktree\s+remove\b/.test(seg)) {
        ask('G2', 'removing a git worktree')
      }
      const rmRecursiveForce =
        /\brm\b[^]*?(-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r|-r\b[^]*-f|-f\b[^]*-r)/i.test(seg)
      const touchesWorktree =
        /worktree/i.test(seg) ||
        /\.claude\/worktrees/i.test(seg) ||
        /(^|\s|\/)agent-[0-9a-f]{6,}/i.test(seg)
      if (rmRecursiveForce && touchesWorktree) {
        ask('G2', 'rm -rf on a worktree path')
      }
    }
  } catch (_err) {
    // fail-open
  }
  process.exit(0)
})
