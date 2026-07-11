"use client";

import { useRef } from "react";
import { useMousePosition } from "hookli";
import { DemoReadout } from "./ui";

/* Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. The hook
   listens on window mousemove and reports coordinates relative to the ref'd
   element, so values keep updating (and can go negative) outside the panel —
   overflow-hidden clips the crosshair once it leaves. */
export function UseMousePositionDocDemo() {
  const panelRef = useRef<HTMLDivElement>(null);
  const { x, y } = useMousePosition(panelRef);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div
        ref={panelRef}
        className="relative h-40 overflow-hidden rounded-md border border-slate-syntax/40 bg-ground"
      >
        {x !== null && y !== null ? (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-y-0 w-px bg-accent/30"
              style={{ left: `${x}px` }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-x-0 h-px bg-accent/30"
              style={{ top: `${y}px` }}
            />
            <span
              aria-hidden="true"
              className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
              style={{ left: `${x}px`, top: `${y}px` }}
            />
          </>
        ) : (
          <p className="absolute inset-0 flex items-center justify-center font-mono text-xs text-slate-syntax">
            move your cursor over this panel
          </p>
        )}
      </div>
      <dl>
        <DemoReadout label="x">
          {x === null ? "—" : `${Math.round(x)}px`}
        </DemoReadout>
        <DemoReadout label="y">
          {y === null ? "—" : `${Math.round(y)}px`}
        </DemoReadout>
      </dl>
      <p className="font-mono text-xs text-slate-syntax">
        Coordinates are measured from the panel&apos;s top-left corner.
      </p>
    </div>
  );
}
