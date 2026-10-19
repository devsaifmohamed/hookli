"use client";

import { useState } from "react";
import { useDraggable } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

const GRID = 24;

/* Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. Ratio mode:
   the position is where the puck's centre sits in the canvas (0..1), so it
   survives the panel resizing. Press anywhere on the canvas to jump there;
   keep holding to drag. The hook writes the puck's transform itself, so the
   pressed-state scale lives on an inner span. */
export function UseDraggableDocDemo() {
  const [smooth, setSmooth] = useState(true);
  const [snap, setSnap] = useState(false);
  const { ref, containerRef, position, isDragging, moveTo } = useDraggable<
    HTMLDivElement,
    HTMLDivElement
  >({
    unit: "ratio",
    bounds: "parent",
    initialPosition: { x: 0.5, y: 0.5 },
    jumpOnClick: true,
    smoothing: smooth ? 0.6 : 0,
    transition: smooth ? 280 : 0,
    grid: snap ? [GRID, GRID] : undefined,
  });

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div
        ref={containerRef}
        className="relative h-56 w-full cursor-crosshair overflow-hidden rounded-md border border-slate-syntax bg-ground"
      >
        {snap ? <GridLines /> : null}
        <div
          ref={ref}
          tabIndex={0}
          role="button"
          aria-roledescription="draggable"
          aria-label={`Puck at ${percent(position.x)} across, ${percent(position.y)} down`}
          className="absolute left-0 top-0 size-11 cursor-grab rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:cursor-grabbing"
        >
          <span
            aria-hidden="true"
            className={`block size-full rounded-full border-2 border-accent transition-transform duration-150 motion-reduce:transition-none ${
              isDragging ? "scale-110 bg-accent/30" : "bg-accent/15"
            }`}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <DemoButton aria-pressed={smooth} onClick={() => setSmooth((v) => !v)}>
          smooth
        </DemoButton>
        <DemoButton aria-pressed={snap} onClick={() => setSnap((v) => !v)}>
          grid
        </DemoButton>
        <DemoButton onClick={() => moveTo({ x: 0.5, y: 0.5 }, { animate: true })}>
          center
        </DemoButton>
      </div>
      <dl>
        <DemoReadout label="position.x">{percent(position.x)}</DemoReadout>
        <DemoReadout label="position.y">{percent(position.y)}</DemoReadout>
        <DemoReadout label="isDragging">
          <span className={isDragging ? "text-accent" : "text-gray-body"}>
            {String(isDragging)}
          </span>
        </DemoReadout>
      </dl>
      <p className="font-mono text-xs text-gray-body">
        Press anywhere to jump, hold to keep dragging. Focus the puck and use
        the arrow keys.
      </p>
    </div>
  );
}

const percent = (ratio: number) => `${(ratio * 100).toFixed(1)}%`;

function GridLines() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full text-divider">
      <defs>
        <pattern id="use-draggable-grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
          <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" stroke="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#use-draggable-grid)" />
    </svg>
  );
}
