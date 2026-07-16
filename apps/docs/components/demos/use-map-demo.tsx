"use client";

import { useState } from "react";
import { useMap } from "hookli";
import { XIcon } from "@/components/icons";
import { DemoButton, DemoInput } from "./ui";

/* Docs-page demo (DH1): a tiny key/value editor over a Map held in state. Set
   writes or updates an entry, each row removes itself, Reset empties the map.
   Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. */
export function UseMapDocDemo() {
  const [map, { set, remove, reset }] = useMap<string, string>([
    ["theme", "dark"],
    ["lang", "en"],
  ]);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  const commit = () => {
    const trimmedKey = key.trim();
    if (!trimmedKey) return;
    set(trimmedKey, value.trim());
    setKey("");
    setValue("");
  };

  const entries = [...map.entries()];

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex items-end gap-2">
        <DemoInput
          label="key"
          value={key}
          placeholder="key"
          onChange={(event) => setKey(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && commit()}
        />
        <DemoInput
          label="value"
          value={value}
          placeholder="value"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && commit()}
        />
        <DemoButton onClick={commit}>Set</DemoButton>
      </div>

      {entries.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {entries.map(([entryKey, entryValue]) => (
            <li
              key={entryKey}
              className="flex items-center justify-between gap-3 rounded-md border border-slate-syntax/40 bg-ground px-3 py-2"
            >
              <span className="min-w-0 truncate font-mono text-sm text-fg">
                <span className="text-accent">{entryKey}</span>
                <span className="text-gray-body"> : </span>
                <span className="text-gray-body">{entryValue || "—"}</span>
              </span>
              <button
                type="button"
                onClick={() => remove(entryKey)}
                aria-label={`Remove ${entryKey}`}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-gray-body transition-colors duration-200 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <XIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-mono text-sm text-gray-body">Map is empty.</p>
      )}

      <DemoButton onClick={reset}>Reset</DemoButton>
    </div>
  );
}
