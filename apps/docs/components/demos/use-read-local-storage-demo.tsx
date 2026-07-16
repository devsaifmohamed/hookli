"use client";

import { useState } from "react";
import { useReadLocalStorage } from "hookli";
import { DemoInput, DemoReadout } from "./ui";

/* Mirrors the usage snippet in lib/hook-docs.ts — keep in sync.
   useReadLocalStorage only READS the key. The input writes with the raw Web
   Storage API and dispatches the `local-storage` event the hook listens for, so
   the read-only value updates live in this tab (a real `storage` event does the
   same across other tabs). */
const KEY = "hookli-docs-theme";

export function UseReadLocalStorageDocDemo() {
  const stored = useReadLocalStorage<string>(KEY);
  const [draft, setDraft] = useState("");

  const write = (value: string) => {
    setDraft(value);
    window.localStorage.setItem(KEY, JSON.stringify(value));
    window.dispatchEvent(new StorageEvent("local-storage", { key: KEY }));
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <DemoInput
        label="writer (raw localStorage)"
        value={draft}
        onChange={(event) => write(event.target.value)}
        placeholder="Type — the reader mirrors it"
        autoComplete="off"
      />
      <dl>
        <DemoReadout label="useReadLocalStorage">{stored ?? "null"}</DemoReadout>
      </dl>
      <p className="text-xs text-gray-body">
        The hook never writes — it observes{" "}
        <code className="text-fg">{KEY}</code> and re-renders on{" "}
        <code className="text-fg">storage</code> and{" "}
        <code className="text-fg">local-storage</code> events, including from
        other tabs.
      </p>
    </div>
  );
}
