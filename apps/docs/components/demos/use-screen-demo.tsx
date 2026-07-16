"use client";

import { useScreen } from "hookli";
import { DemoReadout } from "./ui";

/* Docs-page demo (DH8): reads window.screen after mount and refreshes it on
   every window resize. SSR-safe — the hook returns null on the server and until
   hydration, so every readout falls back to a dash. Mirrors lib/hook-docs.ts. */
export function UseScreenDocDemo() {
  const screen = useScreen();

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <dl className="w-full">
        <DemoReadout label="width">
          {screen ? `${screen.width}px` : "—"}
        </DemoReadout>
        <DemoReadout label="height">
          {screen ? `${screen.height}px` : "—"}
        </DemoReadout>
        <DemoReadout label="availWidth">
          {screen ? `${screen.availWidth}px` : "—"}
        </DemoReadout>
        <DemoReadout label="availHeight">
          {screen ? `${screen.availHeight}px` : "—"}
        </DemoReadout>
        <DemoReadout label="colorDepth">
          {screen ? `${screen.colorDepth}-bit` : "—"}
        </DemoReadout>
        <DemoReadout label="orientation">
          {screen?.orientation ? screen.orientation.type : "—"}
        </DemoReadout>
      </dl>
      <p className="text-xs text-gray-body">
        Mirrors the physical screen, not the viewport — the values stay put when
        you resize the window but track a move between displays.
      </p>
    </div>
  );
}
