"use client";

import { usePageVisibility } from "hookli";
import { DemoReadout } from "./ui";

export function UsePageVisibilityDocDemo() {
  const isVisible = usePageVisibility();

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="page visibility">
          <span className={isVisible ? "text-accent" : "text-gray-body"}>
            {isVisible ? "visible" : "hidden"}
          </span>
        </DemoReadout>
      </dl>
      <p className="text-center text-xs text-gray-body">
        Switch to another browser tab or minimize this window to see the visibility state update in real time.
      </p>
    </div>
  );
}
