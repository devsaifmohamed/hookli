"use client";

import { useState } from "react";
import { useHotkeys } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

export function UseHotkeysDocDemo() {
  const [lastAction, setLastAction] = useState<string>("(none)");

  useHotkeys("ctrl+k", () => setLastAction("Triggered: ctrl+k"));
  useHotkeys("shift+s", () => setLastAction("Triggered: shift+s"));
  useHotkeys("escape", () => setLastAction("Triggered: escape"));

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="last matched shortcut">
          <span className="text-accent font-semibold">{lastAction}</span>
        </DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-2">
        <span className="rounded border border-gray-outline px-2 py-1 font-mono text-xs text-gray-body">
          Ctrl + K
        </span>
        <span className="rounded border border-gray-outline px-2 py-1 font-mono text-xs text-gray-body">
          Shift + S
        </span>
        <span className="rounded border border-gray-outline px-2 py-1 font-mono text-xs text-gray-body">
          Escape
        </span>
      </div>
      <DemoButton onClick={() => setLastAction("(none)")}>Clear</DemoButton>
    </div>
  );
}
