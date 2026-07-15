"use client";

import { useMediaQuery } from "hookli";
import { DemoReadout } from "./ui";

/* Docs-page demo (DH8): live-evaluates a few common media queries. Each is a
   fixed useMediaQuery call (call order never changes, so the Rules of Hooks
   hold). SSR-safe — the hook returns its defaultValue (false) on the server and
   reconciles with window.matchMedia after mount. Resize the window across 768px
   to watch the first row flip. Mirrors lib/hook-docs.ts — keep in sync. */
export function UseMediaQueryDocDemo() {
  const isWide = useMediaQuery("(min-width: 768px)");
  const isLandscape = useMediaQuery("(orientation: landscape)");
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );

  const rows = [
    { query: "(min-width: 768px)", matches: isWide },
    { query: "(orientation: landscape)", matches: isLandscape },
    { query: "(prefers-color-scheme: dark)", matches: prefersDark },
    { query: "(prefers-reduced-motion: reduce)", matches: prefersReducedMotion },
  ];

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <dl className="w-full">
        {rows.map(({ query, matches }) => (
          <DemoReadout key={query} label={query}>
            <span className={matches ? "text-accent" : "text-gray-body"}>
              {String(matches)}
            </span>
          </DemoReadout>
        ))}
      </dl>
      <p className="text-xs text-gray-body">
        Resize the window across 768px — the first row flips live as the query
        starts and stops matching.
      </p>
    </div>
  );
}
