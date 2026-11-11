"use client";

import { useState } from "react";
import { useDeepCompareEffect } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

export function UseDeepCompareEffectDocDemo() {
  const [renders, setRenders] = useState(0);
  const [data, setData] = useState({ id: 1, name: "Alice" });
  const [effectRuns, setEffectRuns] = useState(0);

  // An object with the same structural shape is passed every render
  useDeepCompareEffect(() => {
    setEffectRuns((c) => c + 1);
  }, [data]);

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="data">{JSON.stringify(data)}</DemoReadout>
        <DemoReadout label="component renders">{renders}</DemoReadout>
        <DemoReadout label="deep effect runs">{effectRuns}</DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton
          onClick={() => {
            // Recreates object reference with identical content
            setData({ id: data.id, name: data.name });
            setRenders((r) => r + 1);
          }}
        >
          Re-render same values
        </DemoButton>
        <DemoButton
          onClick={() => {
            // Changes content
            setData((prev) => ({ ...prev, id: prev.id + 1 }));
            setRenders((r) => r + 1);
          }}
        >
          Change id ({data.id + 1})
        </DemoButton>
      </div>
    </div>
  );
}
