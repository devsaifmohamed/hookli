"use client";

import { useBoolean } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

/* Docs-page demo (DH1): exercises the convenience setters returned alongside the
   value — toggle plus the explicit setTrue/setFalse. Mirrors the usage snippet
   in lib/hook-docs.ts — keep in sync. */
export function UseBooleanDocDemo() {
  const { value, setTrue, setFalse, toggle } = useBoolean(false);

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-xs">
        <DemoReadout label="value">
          <span className={value ? "text-accent" : "text-gray-body"}>
            {String(value)}
          </span>
        </DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton onClick={toggle}>toggle</DemoButton>
        <DemoButton onClick={setTrue}>setTrue</DemoButton>
        <DemoButton onClick={setFalse}>setFalse</DemoButton>
      </div>
    </div>
  );
}
