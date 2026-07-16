"use client";

import { useState } from "react";
import { useInterval } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

/* Docs-page demo (DH2): a tick counter driven by useInterval. Passing delay as
   null is the hook's built-in pause — it clears the timer, so nothing leaks.
   The speed buttons swap the interval live. SSR-safe (the timer lives in an
   effect). Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. */
export function UseIntervalDocDemo() {
  const [ticks, setTicks] = useState(0);
  const [delay, setDelay] = useState<number | null>(1000);

  useInterval(() => setTicks((prev) => prev + 1), delay);

  const running = delay !== null;

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="font-mono text-5xl tabular-nums text-fg">{ticks}</p>
      <dl className="w-full max-w-xs">
        <DemoReadout label="delay">{running ? `${delay} ms` : "null"}</DemoReadout>
        <DemoReadout label="status">{running ? "running" : "paused"}</DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton
          onClick={() => setDelay(running ? null : 1000)}
          aria-pressed={!running}
        >
          {running ? "Pause" : "Resume"}
        </DemoButton>
        <DemoButton onClick={() => setDelay(500)} aria-pressed={delay === 500}>
          0.5s
        </DemoButton>
        <DemoButton onClick={() => setDelay(1000)} aria-pressed={delay === 1000}>
          1s
        </DemoButton>
        <DemoButton onClick={() => setDelay(2000)} aria-pressed={delay === 2000}>
          2s
        </DemoButton>
        <DemoButton onClick={() => setTicks(0)}>Reset</DemoButton>
      </div>
    </div>
  );
}
