"use client";

import { useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

/* Docs-page demo (DH3): measure a DOM node before the browser paints. The width
   is read synchronously in a layout effect, so the "measured" readout always
   matches the box on screen — no flash of a stale value. On the server the hook
   falls back to useEffect (measured starts at 0, populates after mount), which
   keeps `next build` prerendering safely. Width is not animated on purpose so
   the measurement stays truthful. Mirrors lib/hook-docs.ts — keep in sync. */
const WIDTHS = [25, 50, 100] as const;

export function UseIsomorphicLayoutEffectDocDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState<(typeof WIDTHS)[number]>(50);
  const [measured, setMeasured] = useState(0);

  useIsomorphicLayoutEffect(() => {
    if (boxRef.current) setMeasured(boxRef.current.offsetWidth);
  }, [pct]);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="w-full max-w-md">
        <div
          ref={boxRef}
          style={{ width: `${pct}%` }}
          className="h-12 rounded-md border border-accent/60 bg-accent/10"
        />
      </div>
      <dl className="w-full max-w-xs">
        <DemoReadout label="target">{pct}%</DemoReadout>
        <DemoReadout label="measured">{measured} px</DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        {WIDTHS.map((w) => (
          <DemoButton key={w} onClick={() => setPct(w)} aria-pressed={pct === w}>
            {w}%
          </DemoButton>
        ))}
      </div>
    </div>
  );
}
