"use client";

import { useRef, type RefObject } from "react";
import { useHover } from "hookli";
import { DemoReadout } from "./ui";

/* Docs-page demo (DH7): useHover wires mouseenter/mouseleave on the ref'd
   element and reports a boolean. Listeners live in an effect and clean up on
   unmount, so the demo is SSR-safe (starts false on the server). Mirrors the
   usage snippet in lib/hook-docs.ts — keep in sync. */
export function UseHoverDocDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  // useHover wants a strict RefObject<T>; React 19's useRef(null) is
  // RefObject<T | null>. The listener effect guards for null, so this is safe.
  const isHovered = useHover(boxRef as RefObject<HTMLDivElement>);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <div
        ref={boxRef}
        className={`flex h-28 w-full items-center justify-center rounded-md border text-sm transition-colors duration-200 ${
          isHovered
            ? "border-accent bg-accent/10 text-accent"
            : "border-gray-outline bg-ground text-gray-body"
        }`}
        aria-live="polite"
      >
        {isHovered ? "Pointer is over me" : "Hover this panel"}
      </div>
      <dl className="w-full">
        <DemoReadout label="isHovered">
          <span className={isHovered ? "text-accent" : "text-gray-body"}>
            {String(isHovered)}
          </span>
        </DemoReadout>
      </dl>
      <p className="text-xs text-gray-body">
        Hover state is pointer-only — pair it with focus styling so keyboard
        users get the same affordance.
      </p>
    </div>
  );
}
