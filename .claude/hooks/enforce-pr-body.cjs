#!/usr/bin/env node
/*
 * PR-body conventions gate (see the /way-of-working skill + .github/pull_request_template.md).
 * PreToolUse(Bash) guard: emits permissionDecision "deny" for `gh pr create` / `gh pr edit`
 * invocations whose PR body is missing the required Claude Code footer or the core
 * pull_request_template.md section headings — so the footer/template can never be
 * forgotten (by a human or any sub-agent).
 *
 *   Requires the body to contain:
 *     - the footer marker substring  "Generated with [Claude Code]"
 *     - each template heading (line prefix): "## What & why", "## Deployment Steps",
 *       "## Tests", "## Checklist"
 *
 * Only inspects invocations that actually SET a body (--body/-b inline, or --body-file/-F
 * from a file). A `gh pr edit` with no body flag (e.g. --add-label/--title only) is left
 * alone. A --body-file of "-" (stdin) or an unreadable file is treated as fail-open.
 *
 * Best-effort BACKSTOP, not airtight — it pattern-matches command text and can be evaded
 * (indirect execution via a script, aliases, unusual quoting, a heredoc body). It
 * complements judgment; it does not replace review. Fail-open by design: any parse/read/
 * logic error falls through to the normal permission flow rather than bricking Bash.
 * (settings.json pre-filters so node only runs on commands containing `gh` … `pr`.)
 */
'use strict'

const fs = require('fs')
const path = require('path')

function deny(missing) {
  const reason =
    `PR body is missing: ${missing.join(', ')}. ` +
    "Fill the .github/pull_request_template.md sections and end the body with the " +
    "'🤖 Generated with [Claude Code](https://claude.com/claude-code)' footer + session link, then retry."
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }),
  )
  process.exit(0)
}

// Read a --body-file / -F path, resolving a relative path against CLAUDE_PROJECT_DIR as a
// best-effort fallback. Returns the file contents, or null if it can't be read (fail-open).
function readBodyFile(p) {
  if (!p || p === '-') return null // stdin body → nothing to inspect
  try {
    return fs.readFileSync(p, 'utf8')
  } catch (_e) {
    // ignore; try the project-dir fallback below
  }
  const projectDir = process.env.CLAUDE_PROJECT_DIR
  if (projectDir && !path.isAbsolute(p)) {
    try {
      return fs.readFileSync(path.resolve(projectDir, p), 'utf8')
    } catch (_e) {
      // ignore
    }
  }
  return null
}

// Return the required markers absent from `text`: the footer substring plus any of the four
// template headings not present at a line-start boundary. Start-of-string, newline, AND
// shell-quote characters all count as boundaries — the quotes matter only for the raw-command
// fallback below (an inline body's first line is preceded by its opening quote, not a
// newline). For real body text a quote practically never precedes a heading, so this stays
// equivalent to a line-prefix check while erring toward allow (the fail-open direction).
function missingMarkers(text) {
  const s = String(text)
  const boundaried = '\n' + s.replace(/['"]/g, '\n')
  const missing = []
  if (!s.includes('Generated with [Claude Code]')) missing.push('footer')
  const headings = ['## What & why', '## Deployment Steps', '## Tests', '## Checklist']
  for (const h of headings) {
    if (!boundaried.includes('\n' + h)) missing.push(h)
  }
  return missing
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

    // Token detection runs on a quote-stripped copy so body *contents* can't produce
    // false positives (e.g. a body that merely mentions "gh pr create"). Flag names are
    // never quoted, so they survive the strip.
    const stripped = cmd.replace(/'[^']*'/g, ' ').replace(/"[^"]*"/g, ' ')

    const isGhPrCreateOrEdit =
      /\bgh\b/.test(stripped) && /\bpr\b/.test(stripped) && /\b(create|edit)\b/.test(stripped)
    if (!isGhPrCreateOrEdit) process.exit(0)

    // Does this invocation set a body at all? --body (not --body-file), --body-file,
    // -b, or -F. If not (e.g. `gh pr edit 5 --add-label foo`, or an interactive create),
    // there's nothing to inspect.
    const hasBodyFlag =
      /--body(?![-\w])/.test(stripped) ||
      /--body-file\b/.test(stripped) ||
      /(?<![\w-])-b(?![\w-])/.test(stripped) ||
      /(?<![\w-])-F(?![\w-])/.test(stripped)
    if (!hasBodyFlag) process.exit(0)

    // Extract the body text from the RAW command (we need the real content here).
    let body = null
    let isInline = false

    // File body: --body-file / -F <path> (path may be quoted).
    const fileRe =
      /(?:--body-file|(?<![\w-])-F(?![\w-]))\s*=?\s*(?:'([^']*)'|"([^"]*)"|(\S+))/
    const fileMatch = cmd.match(fileRe)
    if (fileMatch) {
      const p = fileMatch[1] != null ? fileMatch[1] : fileMatch[2] != null ? fileMatch[2] : fileMatch[3]
      body = readBodyFile(p)
      if (body == null) process.exit(0) // unreadable / stdin → fail-open
    } else {
      // Inline body: --body / -b "<...>" (may span newlines). Non-greedy to the matching
      // closing quote. --body(?![-\w]) avoids matching --body-file.
      const inlineRe =
        /(?:--body(?![-\w])|(?<![\w-])-b(?![\w-]))\s*=?\s*(?:'([\s\S]*?)'|"([\s\S]*?)")/
      const inlineMatch = cmd.match(inlineRe)
      if (inlineMatch) {
        body = inlineMatch[1] != null ? inlineMatch[1] : inlineMatch[2]
        isInline = true
      }
    }

    // Couldn't positively extract a body → fail-open (don't block on ambiguity).
    if (body == null) process.exit(0)

    // Validate — only now that we positively HAVE body text.
    let missing = missingMarkers(body)

    // Inline extraction is non-greedy and stops at the first embedded quote, so a body
    // containing an apostrophe (e.g. "doesn't") or an escaped inner quote can be truncated —
    // then the marker check would false-DENY a body that actually has every marker. For an
    // inline invocation the headings + footer appear verbatim in the command text, so
    // re-check against the FULL raw command and deny only for markers absent there too (the
    // fail-open direction). File bodies are authoritative — no fallback.
    if (missing.length && isInline) missing = missingMarkers(cmd)

    if (missing.length === 0) process.exit(0) // all good → allow
    deny(missing)
  } catch (_err) {
    // fail-open
  }
  process.exit(0)
})
