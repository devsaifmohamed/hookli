"use client";

import { useState } from "react";
import { useDebounce } from "hookli";
import { DemoInput, DemoReadout } from "./ui";

/* Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. */
export function UseDebounceDocDemo() {
  const [text, setText] = useState("");
  const debounced = useDebounce(text, 500);
  const settling = text !== debounced;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <DemoInput
        label="Type quickly"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="The right value shows up 500 ms after you stop"
        autoComplete="off"
      />
      <dl>
        <DemoReadout label="value">{text || "—"}</DemoReadout>
        <DemoReadout label="debounced">{debounced || "—"}</DemoReadout>
      </dl>
      <p className="font-mono text-xs" aria-live="polite">
        {settling ? (
          <span className="text-accent">debouncing…</span>
        ) : (
          <span className="text-gray-body">settled</span>
        )}
      </p>
    </div>
  );
}
