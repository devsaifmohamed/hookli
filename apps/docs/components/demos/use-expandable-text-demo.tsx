"use client";

import { useState } from "react";
import { useExpandableText } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

const SAMPLE =
  "hookli bundles the React hooks you reach for most into one typed, " +
  "SSR-safe, zero-dependency package — state, effects, DOM and data helpers " +
  "that tree-shake cleanly so you only ship what you import. No more hunting " +
  "across the ecosystem or copy-pasting the same useDebounce for the hundredth time.";

const MODES = {
  chars: { label: "180 chars", options: { maxChars: 180 } },
  lines: { label: "3 lines", options: { maxLines: 3 } },
  both: { label: "both", options: { maxChars: 180, maxLines: 3 } },
} as const;

type Mode = keyof typeof MODES;

/* Docs-page demo: the same paragraph collapsed three ways — a pure character
   budget, a responsive line budget, or both at once (whichever clips first
   wins). Narrow the viewport to watch the line-based clamp re-measure. Mirrors
   lib/hook-docs.ts — keep in sync. */
export function UseExpandableTextDocDemo() {
  const [mode, setMode] = useState<Mode>("both");

  const { text, isExpanded, isTruncated, toggle, ref, clampStyle } =
    useExpandableText<HTMLParagraphElement>(SAMPLE, MODES[mode].options);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(MODES) as Mode[]).map((key) => (
          <DemoButton
            key={key}
            aria-pressed={mode === key}
            onClick={() => setMode(key)}
          >
            {MODES[key].label}
          </DemoButton>
        ))}
      </div>

      <div className="rounded-md border border-slate-syntax bg-ground p-4">
        <p ref={ref} style={clampStyle} className="text-sm text-fg">
          {text}
        </p>
        {isTruncated && (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={isExpanded}
            className="mt-2 rounded font-mono text-xs text-accent transition-colors duration-200 hover:text-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {isExpanded ? "Show less ↑" : "Show more ↓"}
          </button>
        )}
      </div>

      <dl className="w-full">
        <DemoReadout label="isExpanded">{String(isExpanded)}</DemoReadout>
        <DemoReadout label="isTruncated">{String(isTruncated)}</DemoReadout>
      </dl>

      <p className="text-xs text-gray-body">
        The character budget yields a genuinely shortened string (SSR-safe); the
        line budget clamps via CSS and re-measures on resize. Switch to “both” and
        narrow the window to see whichever limit clips first win.
      </p>
    </div>
  );
}
