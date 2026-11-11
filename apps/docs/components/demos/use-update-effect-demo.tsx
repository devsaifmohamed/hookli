"use client";

import { useState } from "react";
import { useUpdateEffect } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

export function UseUpdateEffectDocDemo() {
  const [count, setCount] = useState(0);
  const [effectRunCount, setEffectRunCount] = useState(0);

  useUpdateEffect(() => {
    setEffectRunCount((c) => c + 1);
  }, [count]);

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="state value">{count}</DemoReadout>
        <DemoReadout label="effect executions">{effectRunCount}</DemoReadout>
        <DemoReadout label="initial mount skipped">
          <span className="text-accent">Yes (was 0 on mount)</span>
        </DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton onClick={() => setCount((c) => c + 1)}>Increment state</DemoButton>
        <DemoButton onClick={() => setCount(0)}>Reset state</DemoButton>
      </div>
    </div>
  );
}
