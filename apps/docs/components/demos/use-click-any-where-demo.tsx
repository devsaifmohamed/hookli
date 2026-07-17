"use client";

import { useState } from "react";
import { useClickAnyWhere } from "hookli";
import { DemoReadout } from "./ui";

/* Docs-page demo (DH7): useClickAnyWhere subscribes to click on the window and
   forwards the latest handler on every dispatch. The listener lives in an
   effect and cleans up on unmount, so the demo is SSR-safe. Mirrors the usage
   snippet in lib/hook-docs.ts — keep in sync. */
export function UseClickAnyWhereDocDemo() {
  const [count, setCount] = useState(0);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );

  useClickAnyWhere((event) => {
    setCount((prev) => prev + 1);
    setPosition({ x: event.clientX, y: event.clientY });
  });

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <div
        className="flex h-24 w-full items-center justify-center rounded-md border border-slate-syntax bg-ground text-center text-sm text-gray-body"
        aria-live="polite"
      >
        Click anywhere on the page
      </div>
      <dl className="w-full">
        <DemoReadout label="clicks">{count}</DemoReadout>
        <DemoReadout label="last position">
          {position ? `${position.x}, ${position.y}` : "—"}
        </DemoReadout>
      </dl>
      <p className="text-xs text-gray-body">
        Fires for every click in the document — handy for dismissing popovers or
        logging outside interactions without wiring a ref.
      </p>
    </div>
  );
}
