"use client";

import { useState } from "react";
import { useDebounceCallback } from "hookli";
import { DemoButton, DemoInput, DemoReadout } from "./ui";

/* Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. */
export function UseDebounceCallbackDocDemo() {
  const [text, setText] = useState("");
  const [keystrokes, setKeystrokes] = useState(0);
  const [runs, setRuns] = useState(0);
  const [lastRun, setLastRun] = useState("");

  const search = useDebounceCallback((query: string) => {
    setRuns((n) => n + 1);
    setLastRun(query);
  }, 600);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <DemoInput
        label="Search"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setKeystrokes((n) => n + 1);
          search(event.target.value);
        }}
        placeholder="Runs 600 ms after your last keystroke"
        autoComplete="off"
      />
      <dl>
        <DemoReadout label="keystrokes">{keystrokes}</DemoReadout>
        <DemoReadout label="callback runs">{runs}</DemoReadout>
        <DemoReadout label="last searched">{lastRun || "—"}</DemoReadout>
      </dl>
      <div className="flex flex-wrap gap-2">
        <DemoButton onClick={() => search.flush()}>Flush now</DemoButton>
        <DemoButton onClick={() => search.cancel()}>Cancel pending</DemoButton>
      </div>
    </div>
  );
}
