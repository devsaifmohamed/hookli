"use client";

import { useIsClient } from "hookli";
import { DemoReadout } from "./ui";

/* Docs-page demo (DH4): useIsClient is false during server render and the first
   hydration pass, then flips to true once mounted in the browser. Rendering the
   value directly is the whole point — it proves the hook without any browser
   API. Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. */
export function UseIsClientDocDemo() {
  const isClient = useIsClient();

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <div
        className="flex h-20 w-full items-center justify-center rounded-md border border-accent/60 bg-accent/10 font-mono text-sm text-accent"
        aria-live="polite"
      >
        {isClient ? "Running in the browser" : "Server / first render"}
      </div>
      <dl className="w-full">
        <DemoReadout label="isClient">
          <span className={isClient ? "text-accent" : "text-gray-body"}>
            {String(isClient)}
          </span>
        </DemoReadout>
      </dl>
      <p className="text-xs text-gray-body">
        The panel starts as the server markup, then swaps after hydration — gate
        browser-only UI (portals, media queries) on this so the two renders match.
      </p>
    </div>
  );
}
