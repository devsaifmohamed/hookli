"use client";

import { useLocalStorage } from "hookli";
import { DemoButton, DemoInput } from "./ui";

/* Mirrors the usage snippet in lib/hook-docs.ts — keep in sync.
   NOTE: pass a primitive initialValue — the hook's sync effect depends on it
   by reference, so a fresh object literal per render would loop. */
export function UseLocalStorageDocDemo() {
  const { value, setStoredValue } = useLocalStorage("hookli-docs-note", "");

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <DemoInput
        label="note"
        value={value}
        onChange={(event) => setStoredValue(event.target.value)}
        placeholder="Write something, then reload the page"
        autoComplete="off"
      />
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-gray-body">
          Stored under <code className="text-fg">hookli-docs-note</code> — it
          survives a reload.
        </p>
        <DemoButton onClick={() => setStoredValue("")}>Clear</DemoButton>
      </div>
    </div>
  );
}
