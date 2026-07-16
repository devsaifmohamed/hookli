"use client";

import { useCountdown } from "hookli";
import { DemoButton } from "./ui";

/* Docs-page demo (DH1): a 10→0 countdown that stops itself at countStop. The
   timer lives in an effect, so it is SSR-safe. Mirrors the usage snippet in
   lib/hook-docs.ts — keep in sync. */
export function UseCountdownDocDemo() {
  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({ countStart: 10, intervalMs: 1000 });

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="font-mono text-5xl tabular-nums text-fg">{count}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton onClick={startCountdown}>Start</DemoButton>
        <DemoButton onClick={stopCountdown}>Pause</DemoButton>
        <DemoButton onClick={resetCountdown}>Reset</DemoButton>
      </div>
    </div>
  );
}
