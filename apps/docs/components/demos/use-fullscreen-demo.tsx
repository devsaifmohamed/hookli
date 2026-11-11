"use client";

import { useRef } from "react";
import { useFullscreen } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

export function UseFullscreenDocDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle, enter, exit } = useFullscreen(containerRef);

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        ref={containerRef}
        className="flex h-36 w-full max-w-sm flex-col items-center justify-center gap-3 rounded-lg border border-gray-outline bg-ground p-4"
      >
        <p className="font-mono text-sm text-fg">
          Target Element {isFullscreen ? "(Fullscreen)" : ""}
        </p>
        <DemoButton onClick={toggle}>
          {isFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}
        </DemoButton>
      </div>

      <dl className="w-full max-w-xs">
        <DemoReadout label="fullscreen active">
          <span className={isFullscreen ? "text-accent font-semibold" : "text-gray-body"}>
            {String(isFullscreen)}
          </span>
        </DemoReadout>
      </dl>

      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton disabled={isFullscreen} onClick={enter}>
          Enter
        </DemoButton>
        <DemoButton disabled={!isFullscreen} onClick={exit}>
          Exit
        </DemoButton>
      </div>
    </div>
  );
}
