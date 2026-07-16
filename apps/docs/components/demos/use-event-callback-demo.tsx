"use client";

import { useState } from "react";
import { useEventCallback } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

/* Docs-page demo (DH3): the callback returned by useEventCallback keeps one
   stable identity for the component's whole life, yet always closes over the
   newest count. Increment a few times, then Capture — the captured value jumps
   to the current count (latest closure) while "identity" stays stable (the ref
   never changed). SSR-safe: no browser APIs. Mirrors lib/hook-docs.ts. */
export function UseEventCallbackDocDemo() {
  const [count, setCount] = useState(0);
  const [captured, setCaptured] = useState<number | null>(null);

  const readLatest = useEventCallback(() => count);

  // Snapshot the very first callback; useEventCallback returns one stable
  // reference for the component's life, so this stays === readLatest forever.
  const [firstCallback] = useState(() => readLatest);
  const stable = firstCallback === readLatest;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <p className="font-mono text-5xl tabular-nums text-fg">{count}</p>
      <dl className="w-full max-w-xs">
        <DemoReadout label="captured">
          {captured === null ? "—" : captured}
        </DemoReadout>
        <DemoReadout label="callback identity">
          {stable ? "stable" : "changed"}
        </DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton onClick={() => setCount((prev) => prev + 1)}>
          Increment
        </DemoButton>
        <DemoButton onClick={() => setCaptured(readLatest())}>
          Capture latest
        </DemoButton>
        <DemoButton
          onClick={() => {
            setCount(0);
            setCaptured(null);
          }}
        >
          Reset
        </DemoButton>
      </div>
    </div>
  );
}
