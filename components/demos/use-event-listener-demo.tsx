"use client";

import { useRef, useState, type RefObject } from "react";
import { useEventListener } from "hookli";
import { DemoReadout } from "./ui";

/* Docs-page demo (DH3): one subscription on the window (global keydown) and one
   scoped to a ref (clicks inside the panel only) — the two targeting modes of
   useEventListener. Listeners live in an effect and clean up on unmount, so the
   demo is SSR-safe and leak-free. Mirrors lib/hook-docs.ts — keep in sync. */
export function UseEventListenerDocDemo() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [lastKey, setLastKey] = useState("—");
  const [keyCount, setKeyCount] = useState(0);
  const [clicks, setClicks] = useState(0);

  useEventListener("keydown", (event) => {
    setLastKey(event.key === " " ? "Space" : event.key);
    setKeyCount((prev) => prev + 1);
  });

  // useEventListener's element overload wants a strict RefObject<T>; React 19's
  // useRef(null) is RefObject<T | null>. The listener effect guards for null, so
  // narrowing here is safe.
  useEventListener(
    "click",
    () => setClicks((prev) => prev + 1),
    panelRef as RefObject<HTMLDivElement>,
  );

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div
        ref={panelRef}
        tabIndex={0}
        className="flex h-28 w-full max-w-md cursor-pointer items-center justify-center rounded-md border border-slate-syntax/40 bg-ground px-4 text-center font-mono text-sm text-gray-body transition-colors duration-200 hover:border-slate-syntax focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        Click here, or press any key
      </div>
      <dl className="w-full max-w-xs">
        <DemoReadout label="last key (window)">{lastKey}</DemoReadout>
        <DemoReadout label="key presses">{keyCount}</DemoReadout>
        <DemoReadout label="panel clicks">{clicks}</DemoReadout>
      </dl>
    </div>
  );
}
