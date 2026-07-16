"use client";

import { useSessionStorage } from "hookli";
import { DemoButton, DemoInput } from "./ui";

/* Mirrors the usage snippet in lib/hook-docs.ts — keep in sync.
   Pass a primitive initialValue — the hook re-reads it in its effect deps. */
export function UseSessionStorageDocDemo() {
  const [value, setValue, removeValue] = useSessionStorage(
    "hookli-docs-draft",
    "",
  );

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <DemoInput
        label="draft"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Type, then reload — it's still here"
        autoComplete="off"
      />
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-gray-body">
          Stored under <code className="text-fg">hookli-docs-draft</code> —
          survives a reload, cleared when the tab closes.
        </p>
        <DemoButton onClick={() => removeValue()}>Clear</DemoButton>
      </div>
    </div>
  );
}
