"use client";

import { useCounter } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

/* Docs-page demo (DH1): the full action set — increment/decrement, a direct
   setCount jump, and reset back to the initial value. Mirrors the usage snippet
   in lib/hook-docs.ts — keep in sync. */
export function UseCounterDocDemo() {
  const { count, increment, decrement, reset, setCount } = useCounter(0);

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="count">{count}</DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton onClick={decrement} aria-label="Decrement">
          −1
        </DemoButton>
        <DemoButton onClick={increment} aria-label="Increment">
          +1
        </DemoButton>
        <DemoButton onClick={() => setCount(10)}>set 10</DemoButton>
        <DemoButton onClick={reset}>reset</DemoButton>
      </div>
    </div>
  );
}
