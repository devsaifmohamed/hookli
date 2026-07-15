# Premium redesign — notes for review (2026-07-15)

Left **uncommitted** for Saif to review. The colors stayed (near-black neutral + Prussian/Scooter
accent — you said the palette is fine); the goal was to kill the "childish" feel and make it read
like a top-tier FE-package docs site (Linear / Vercel / Radix tier).

## ✅ Done in this pass (uncommitted, builds green)

**Typography — the biggest lever.**
- Replaced **Plus Jakarta Sans** (a "friendly SaaS" face — the source of the childish feel) with
  **Geist** — Vercel's typeface, purpose-built for developer products. Loaded via `next/font/google`.
- **JetBrains Mono stays for code only** (as requested): code blocks, install command, API type/value
  cells, demo inputs.
- Premium display treatment in `globals.css`: tighter tracking on large headings (h1 −0.035em,
  h2 −0.028em), balanced headings (`text-wrap: balance`), and Geist stylistic sets (`cv01`, `ss01`).

Files touched: `app/layout.tsx`, `app/globals.css`.

## 🔜 Proposed next (needs your ok — bigger, per-component work)

These are the changes that take it from "clean" to "best-in-class". I held them because they touch
many components and you wanted to review first:

1. **Type scale + rhythm** — adopt a real modular scale (e.g. 13/14/16/20/28/40/56) and consistent
   vertical rhythm; hero headline larger and tighter; section headers with an eyebrow/kicker label.
2. **Hero** — less empty vertical space, a subtle grid/gradient-glow backdrop behind the mark,
   animated-in on load (respecting reduced-motion), and a "trusted by / npm installs" strip.
3. **Cards & surfaces** — reduce the border weight, add a 1px top highlight + soft shadow for real
   elevation, tighten padding rhythm; hover lifts with a spring transition.
4. **Docs shell** — denser, more refined sidebar (section labels smaller/tracked, active item with a
   left accent bar not a filled pill), a sticky breadcrumb header, and a slimmer right-rail TOC.
5. **Code blocks** — window chrome (traffic-light dots optional), filename tab styling, a language
   badge, and a subtle inner shadow; copy button that morphs to a check.
6. **Micro-interactions** — consistent 150–200ms ease-out transitions, focus rings, and a page-load
   stagger on the landing sections.
7. **Content polish** — tighten copy, add a "Quick start" 3-step, and per-hook "related hooks".

## Notes / caveats
- OG images (`lib/og.tsx`) still render with Plus Jakarta (separate satori font load) — update to
  Geist when the direction is locked. `@fontsource/plus-jakarta-sans` can be removed from deps then.
- Everything above stays token/globals-first so it propagates without per-page rewrites where possible.

See before/after screenshots in `../rehooks-app/assets/variants/`:
`site-landing-geist.png` / `site-docpage-geist.png` (new) vs `site-landing-v2.png` (previous).
