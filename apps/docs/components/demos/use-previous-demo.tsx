"use client";

import { useState } from "react";
import { usePrevious } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

export function UsePreviousDocDemo() {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="current count">{count}</DemoReadout>
        <DemoReadout label="previous count">
          {previousCount !== undefined ? previousCount : "(none)"}
        </DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton onClick={() => setCount((c) => c + 1)}>Increment</DemoButton>
        <DemoButton onClick={() => setCount((c) => c - 1)}>Decrement</DemoButton>
        <DemoButton onClick={() => setCount(0)}>Reset</DemoButton>
      </div>
    </div>
  );
}
