"use client";

import { useState } from "react";
import { useScrollLock } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

/* Docs-page demo (DH7): autoLock is OFF and the lock is scoped to this panel
   (never the page body), so nothing locks on mount — SSR-safe and no surprise
   page freeze. Lock, then try to scroll the list: overflow flips to hidden.
   Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. */
export function UseScrollLockDocDemo() {
  // lockTarget must be a live element; hold it in state so the hook resolves
  // the panel once it mounts rather than defaulting to <body>.
  const [panel, setPanel] = useState<HTMLElement | null>(null);

  const { isLocked, lock, unlock } = useScrollLock({
    autoLock: false,
    lockTarget: panel ?? undefined,
  });

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <DemoButton aria-pressed={isLocked} onClick={isLocked ? unlock : lock}>
        {isLocked ? "Unlock scroll" : "Lock scroll"}
      </DemoButton>
      <div
        ref={setPanel}
        className="h-40 overflow-y-auto rounded-md border border-slate-syntax bg-ground p-4"
      >
        <ul className="flex flex-col gap-2 text-sm text-gray-body">
          {Array.from({ length: 12 }, (_, i) => (
            <li
              key={i}
              className="rounded border border-slate-syntax px-3 py-2"
            >
              Row {i + 1}
            </li>
          ))}
        </ul>
      </div>
      <dl className="w-full">
        <DemoReadout label="isLocked">
          <span className={isLocked ? "text-accent" : "text-gray-body"}>
            {String(isLocked)}
          </span>
        </DemoReadout>
      </dl>
      <p className="text-xs text-gray-body">
        Lock the panel, then try scrolling the list — perfect for freezing the
        page behind an open modal or drawer.
      </p>
    </div>
  );
}
