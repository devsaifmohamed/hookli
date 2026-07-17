"use client";

import { useState } from "react";
import { useUnmount } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

/* Docs-page demo (DH3): a child registers a cleanup with useUnmount; toggling
   the parent state unmounts it, firing the callback exactly once. The counter
   proves the cleanup runs on every unmount, not on re-render. SSR-safe: no
   browser APIs. Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. */
function CleanupChild({ onUnmount }: { onUnmount: () => void }) {
  useUnmount(onUnmount);

  return (
    <div className="flex h-16 w-full items-center justify-center rounded-md border border-accent bg-accent/10 font-mono text-sm text-accent">
      mounted — cleanup armed
    </div>
  );
}

export function UseUnmountDocDemo() {
  const [mounted, setMounted] = useState(true);
  const [cleanups, setCleanups] = useState(0);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="flex h-16 w-full max-w-md items-center justify-center">
        {mounted ? (
          <CleanupChild onUnmount={() => setCleanups((prev) => prev + 1)} />
        ) : (
          <p className="font-mono text-sm text-gray-body">unmounted</p>
        )}
      </div>
      <dl className="w-full max-w-xs">
        <DemoReadout label="status">{mounted ? "mounted" : "unmounted"}</DemoReadout>
        <DemoReadout label="cleanups run">{cleanups}</DemoReadout>
      </dl>
      <DemoButton
        onClick={() => setMounted((prev) => !prev)}
        aria-pressed={mounted}
      >
        {mounted ? "Unmount" : "Mount"}
      </DemoButton>
    </div>
  );
}
