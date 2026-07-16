"use client";

import { useState } from "react";
import { useDebounceValue } from "hookli";
import { DemoButton, DemoInput, DemoReadout } from "./ui";

/* Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. */
export function UseDebounceValueDocDemo() {
  const [text, setText] = useState("");
  const [debounced, setValue] = useDebounceValue("", 500);
  const pending = text !== debounced;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <DemoInput
        label="Search query"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setValue(event.target.value);
        }}
        placeholder="Type — the debounced copy settles 500 ms later"
        autoComplete="off"
      />
      <dl>
        <DemoReadout label="live">{text || "—"}</DemoReadout>
        <DemoReadout label="debounced">{debounced || "—"}</DemoReadout>
      </dl>
      <div className="flex flex-wrap gap-2">
        <DemoButton onClick={() => setValue.flush()}>Flush now</DemoButton>
        <DemoButton
          onClick={() => {
            setValue.cancel();
            setText(debounced);
          }}
        >
          Cancel pending
        </DemoButton>
      </div>
      <p className="font-mono text-xs" aria-live="polite">
        {pending ? (
          <span className="text-accent">pending — waiting for a pause…</span>
        ) : (
          <span className="text-gray-body">settled</span>
        )}
      </p>
    </div>
  );
}
