"use client";

import { useRef, useState, type RefObject } from "react";
import { useResizeObserver } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

const WIDTHS = [40, 65, 100] as const;

/* Docs-page demo (DH7): the buttons (and the native drag handle) resize the
   box; ResizeObserver reports the freshly measured content-box size. The
   observer is created in an effect and disconnected on cleanup, so the demo is
   SSR-safe (width/height start undefined). Mirrors lib/hook-docs.ts — sync. */
export function UseResizeObserverDocDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [widthPct, setWidthPct] = useState<number>(65);

  // useResizeObserver wants a strict RefObject<T>; React 19's useRef(null) is
  // RefObject<T | null>. The observer effect guards for null, so this is safe.
  const { width, height } = useResizeObserver(
    boxRef as RefObject<HTMLDivElement>,
  );

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {WIDTHS.map((pct) => (
          <DemoButton
            key={pct}
            aria-pressed={widthPct === pct}
            onClick={() => setWidthPct(pct)}
          >
            {pct}%
          </DemoButton>
        ))}
      </div>
      <div
        ref={boxRef}
        className="flex min-h-20 resize items-center justify-center overflow-auto rounded-md border border-accent bg-accent/10 p-4 text-center text-sm text-accent transition-[width] duration-200"
        style={{ width: `${widthPct}%` }}
      >
        drag my corner ↘
      </div>
      <dl className="w-full">
        <DemoReadout label="width">
          {width === undefined ? "—" : `${Math.round(width)}px`}
        </DemoReadout>
        <DemoReadout label="height">
          {height === undefined ? "—" : `${Math.round(height)}px`}
        </DemoReadout>
      </dl>
      <p className="text-xs text-gray-body">
        Reports element size without a window resize — the values track both the
        preset buttons and the native drag handle.
      </p>
    </div>
  );
}
