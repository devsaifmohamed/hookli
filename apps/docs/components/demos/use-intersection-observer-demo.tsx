"use client";

import { useState } from "react";
import { useIntersectionObserver } from "hookli";
import { DemoReadout } from "./ui";

/* Docs-page demo (DH7): scroll the target in and out of a scoped viewport. The
   scroll container is passed as `root`, so intersection is measured against the
   panel, not the page. The observer is created in an effect and disconnected on
   cleanup, so the demo is SSR-safe. Mirrors lib/hook-docs.ts — keep in sync. */
export function UseIntersectionObserverDocDemo() {
  // root must be a live element; hold it in state so the observer re-creates
  // once the scroll container mounts (options.root is an effect dependency).
  const [root, setRoot] = useState<HTMLElement | null>(null);

  const { ref, isIntersecting, entry } = useIntersectionObserver({
    root,
    threshold: 0.5,
  });

  const ratio = entry ? Math.round(entry.intersectionRatio * 100) : 0;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div
        ref={setRoot}
        className="h-40 overflow-y-auto rounded-md border border-slate-syntax bg-ground p-4"
      >
        <p className="pb-40 text-center text-xs text-gray-body">
          scroll down ↓
        </p>
        <div
          ref={ref}
          className={`flex h-20 items-center justify-center rounded-md border text-sm transition-colors duration-200 ${
            isIntersecting
              ? "border-accent bg-accent/10 text-accent"
              : "border-slate-syntax text-gray-body"
          }`}
        >
          {isIntersecting ? "In view" : "Target"}
        </div>
        <p className="pt-40 text-center text-xs text-gray-body">
          ↑ scroll up
        </p>
      </div>
      <dl className="w-full">
        <DemoReadout label="isIntersecting">
          <span className={isIntersecting ? "text-accent" : "text-gray-body"}>
            {String(isIntersecting)}
          </span>
        </DemoReadout>
        <DemoReadout label="intersectionRatio">{ratio}%</DemoReadout>
      </dl>
      <p className="text-xs text-gray-body">
        Ideal for lazy-loading, scroll-spy nav and infinite lists — the target
        crosses the 50% threshold to flip the flag.
      </p>
    </div>
  );
}
