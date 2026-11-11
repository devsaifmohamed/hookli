"use client";

import { useIdle } from "hookli";
import { DemoReadout } from "./ui";

export function UseIdleDocDemo() {
  const isIdle = useIdle(3000);

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="idle status (3s threshold)">
          <span className={isIdle ? "text-accent font-semibold" : "text-gray-body"}>
            {isIdle ? "Idle (no activity)" : "Active"}
          </span>
        </DemoReadout>
      </dl>
      <p className="text-center text-xs text-gray-body">
        Stop moving your mouse or typing for 3 seconds to see the idle status trigger.
      </p>
    </div>
  );
}
