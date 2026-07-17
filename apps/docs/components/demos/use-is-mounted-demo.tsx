"use client";

import { useState } from "react";
import { useIsMounted } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

/* Docs-page demo (DH4): the classic async-guard. The child kicks off a delayed
   "request"; when it resolves it checks isMounted() before touching state.
   Unmount the child mid-flight and the pending update is skipped safely instead
   of warning. Mirrors the usage snippet in lib/hook-docs.ts — keep in sync.
   SSR-safe: setTimeout only runs from a click handler, never on render. */
function AsyncChild({ onSkip }: { onSkip: () => void }) {
  const isMounted = useIsMounted();
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState("—");

  function start() {
    setStatus("loading");
    setResult("—");
    window.setTimeout(() => {
      if (isMounted()) {
        setResult(`resolved at ${new Date().toLocaleTimeString()}`);
        setStatus("done");
      } else {
        onSkip();
      }
    }, 1500);
  }

  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-md border border-accent bg-accent/10 p-4">
      <p className="font-mono text-sm text-accent">child mounted</p>
      <dl className="w-full">
        <DemoReadout label="status">{status}</DemoReadout>
        <DemoReadout label="result">{result}</DemoReadout>
      </dl>
      <DemoButton onClick={start} disabled={status === "loading"}>
        {status === "loading" ? "Resolving…" : "Start async task"}
      </DemoButton>
    </div>
  );
}

export function UseIsMountedDocDemo() {
  const [mounted, setMounted] = useState(true);
  const [skips, setSkips] = useState(0);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <div className="flex min-h-40 w-full items-center justify-center">
        {mounted ? (
          <AsyncChild onSkip={() => setSkips((prev) => prev + 1)} />
        ) : (
          <p className="font-mono text-sm text-gray-body">child unmounted</p>
        )}
      </div>
      <dl className="w-full">
        <DemoReadout label="guarded skips">{skips}</DemoReadout>
      </dl>
      <DemoButton
        onClick={() => setMounted((prev) => !prev)}
        aria-pressed={mounted}
      >
        {mounted ? "Unmount child" : "Mount child"}
      </DemoButton>
      <p className="text-xs text-gray-body">
        Start the task, then unmount before it resolves — the update is skipped,
        not warned. Leave it mounted and the result lands as usual.
      </p>
    </div>
  );
}
