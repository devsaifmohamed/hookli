"use client";

import { useState } from "react";
import { useLongPress } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

export function UseLongPressDocDemo() {
  const [pressedCount, setPressedCount] = useState(0);
  const [lastEvent, setLastEvent] = useState<string>("");

  const handlers = useLongPress(
    (e) => {
      setPressedCount((c) => c + 1);
      setLastEvent(e.type);
    },
    { delay: 600 },
  );

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="long press count">{pressedCount}</DemoReadout>
        <DemoReadout label="triggered by">{lastEvent || "(none)"}</DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          {...handlers}
          className="inline-flex min-h-11 select-none items-center gap-2 rounded-md border border-accent bg-accent/10 px-5 font-mono text-sm font-medium text-accent transition-all active:scale-95"
        >
          Press & Hold (600ms)
        </button>
        <DemoButton onClick={() => setPressedCount(0)}>Reset</DemoButton>
      </div>
    </div>
  );
}
