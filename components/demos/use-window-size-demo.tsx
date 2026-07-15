"use client";

import { useWindowSize } from "hookli";
import { DemoReadout } from "./ui";

/* Tailwind's default breakpoint ladder, largest first, for the derived label. */
const BREAKPOINTS = [
  { label: "2xl", min: 1536 },
  { label: "xl", min: 1280 },
  { label: "lg", min: 1024 },
  { label: "md", min: 768 },
  { label: "sm", min: 640 },
] as const;

function breakpointFor(width: number): string {
  if (width === 0) return "—";
  return BREAKPOINTS.find((bp) => width >= bp.min)?.label ?? "xs";
}

/* Docs-page demo (DH8): tracks the viewport's { width, height } and updates on
   every resize event. SSR-safe — both values start at 0 before hydration, so
   the readouts fall back to a dash. Mirrors lib/hook-docs.ts — keep in sync. */
export function UseWindowSizeDocDemo() {
  const { width, height } = useWindowSize();

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <dl className="w-full">
        <DemoReadout label="width">{width ? `${width}px` : "—"}</DemoReadout>
        <DemoReadout label="height">{height ? `${height}px` : "—"}</DemoReadout>
        <DemoReadout label="breakpoint">
          <span className="text-accent">{breakpointFor(width)}</span>
        </DemoReadout>
      </dl>
      <p className="text-xs text-gray-body">
        Resize the window — both values update on every resize event, and the
        breakpoint label tracks Tailwind&rsquo;s default ladder.
      </p>
    </div>
  );
}
