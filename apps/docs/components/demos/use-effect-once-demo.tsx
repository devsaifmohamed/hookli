"use client";

import { useState } from "react";
import { useEffectOnce } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

export function UseEffectOnceDocDemo() {
  const [mountedAt, setMountedAt] = useState<string>("");
  const [renderCount, setRenderCount] = useState(0);

  useEffectOnce(() => {
    setMountedAt(new Date().toLocaleTimeString());
  });

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="mounted at">{mountedAt || "Mounting..."}</DemoReadout>
        <DemoReadout label="re-renders">{renderCount}</DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton onClick={() => setRenderCount((c) => c + 1)}>
          Trigger re-render
        </DemoButton>
      </div>
    </div>
  );
}
