"use client";

import { useDefaultValue } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

/* Docs-page demo: exercises state updates and fallback behavior when setting
   the value to undefined or null. Mirrors the usage snippet in lib/hook-docs.ts. */
export function UseDefaultValueDocDemo() {
  const [value, setValue] = useDefaultValue<string>(null, "default");

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="value">{value}</DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton onClick={() => setValue("new value")}>
          {"setValue(\"new value\")"}
        </DemoButton>
        <DemoButton onClick={() => setValue(undefined)}>
          {"setValue(undefined)"}
        </DemoButton>
        <DemoButton onClick={() => setValue(null)}>
          {"setValue(null)"}
        </DemoButton>
      </div>
    </div>
  );
}
