<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# hookli-docs

The docs + landing site for **hookli** (`npm i hookli`) — a React hooks library by
@saifmohamedsv (github.com/saifmohamedsv/hookli). This app is a sibling of the library
repo (`../rehooks-app`), which is **read-only context** — never modify it from here.

## Stack
Next.js (App Router, TypeScript, Tailwind, npm). Hooks for live demos are imported from
the **published `hookli` package** (in node_modules), not from relative paths.

## Brand (dark-first, solid — no gradients)
- Ground `#0B1120` · Accent (React cyan) `#61DAFB` · Syntax slate `#475569` · Gray `#94A3B8`
- Wordmark: monospace `use(hookli)` — parens slate, name cyan. Assets in `public/`
  (`hookli-banner.svg/.png`, `hookli-icon.svg`).
- Monospace headings, system sans body. Inline SVG icons only — never emoji as icons.

## Quality gate (before every commit)
```bash
bash ralph/check.sh   # npm run lint + npx tsc --noEmit + npm run build
```

## Ralph loop
This app is built by the Ralph loop: backlog in `ralph/prd.json` (T1–T15), durable log in
`ralph/progress.txt`, operating manual in `ralph/prompt.md`, design source of truth in
`docs/DESIGN.md` (produced by T1). One task per iteration, gate green before commit,
no pushes/deploys/publishes — those are human steps.
