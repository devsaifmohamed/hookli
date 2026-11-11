"use client";

import { useSet } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

const INITIAL_TAGS = ["react", "typescript"];
const AVAILABLE_TAGS = ["react", "typescript", "nextjs", "tailwind"];

export function UseSetDocDemo() {
  const [set, { toggle, clear, reset }] = useSet<string>(INITIAL_TAGS);

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-sm">
        <DemoReadout label={`selected (${set.size})`}>
          {set.size === 0 ? (
            <span className="text-gray-body">(none)</span>
          ) : (
            Array.from(set).join(", ")
          )}
        </DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-2">
        {AVAILABLE_TAGS.map((tag) => {
          const isActive = set.has(tag);
          return (
            <DemoButton
              key={tag}
              aria-pressed={isActive}
              onClick={() => toggle(tag)}
            >
              {isActive ? `✓ ${tag}` : tag}
            </DemoButton>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <DemoButton disabled={set.size === 0} onClick={clear}>
          Clear
        </DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
      </div>
    </div>
  );
}
