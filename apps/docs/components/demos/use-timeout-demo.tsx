"use client";

import { useState } from "react";
import { useTimeout } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

/* Docs-page demo (DH2): a one-shot delayed reveal. Arm sets the delay so
   useTimeout schedules the callback; the callback reveals the message and sets
   delay back to null so the timer disarms and can be re-armed. Cancel sets
   delay to null while pending — the built-in clearTimeout. SSR-safe (the timer
   lives in an effect). Mirrors the usage snippet in lib/hook-docs.ts. */
export function UseTimeoutDocDemo() {
  const [delay, setDelay] = useState<number | null>(null);
  const [fired, setFired] = useState(false);

  useTimeout(() => {
    setFired(true);
    setDelay(null);
  }, delay);

  const pending = delay !== null;

  return (
    <div className="flex flex-col items-center gap-5">
      <p
        role="status"
        aria-live="polite"
        className="flex min-h-16 w-full max-w-xs items-center justify-center rounded-md border border-slate-syntax/40 bg-ground px-4 text-center font-mono text-sm text-fg"
      >
        {fired ? "Timeout fired" : pending ? "Waiting 2s…" : "Idle — arm the timeout"}
      </p>
      <dl className="w-full max-w-xs">
        <DemoReadout label="delay">{pending ? `${delay} ms` : "null"}</DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton
          onClick={() => {
            setFired(false);
            setDelay(2000);
          }}
          disabled={pending}
        >
          Arm (2s)
        </DemoButton>
        <DemoButton onClick={() => setDelay(null)} disabled={!pending}>
          Cancel
        </DemoButton>
      </div>
    </div>
  );
}
