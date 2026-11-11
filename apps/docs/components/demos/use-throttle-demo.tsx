"use client";

import { useState } from "react";
import { useThrottle } from "hookli";
import { DemoInput, DemoReadout } from "./ui";

export function UseThrottleDocDemo() {
  const [text, setText] = useState("");
  const throttledText = useThrottle(text, 1000);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full max-w-xs">
        <DemoInput
          label="Type quickly..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing..."
        />
      </div>
      <dl className="w-full max-w-xs">
        <DemoReadout label="instant value">{text || "(empty)"}</DemoReadout>
        <DemoReadout label="throttled (1000ms)">{throttledText || "(empty)"}</DemoReadout>
      </dl>
    </div>
  );
}
