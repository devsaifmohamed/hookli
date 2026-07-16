"use client";

import { useToggle } from "hookli";
import { DemoButton } from "./ui";

/* Live proof for the landing page: same logic as the LightSwitch sample shown
   beside it (components/live-proof-section.tsx), imported from the published
   `hookli` package — styling classes are the only addition. */
export function UseToggleDemo() {
  const [on, toggle] = useToggle(false);

  return <Switch on={on} onToggle={toggle} />;
}

/* Docs-page reference demo (T6): exercises the full tuple — toggle plus the
   explicit setter. Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. */
export function UseToggleDocDemo() {
  const [on, toggle, setOn] = useToggle(false);

  return (
    <div className="flex flex-col items-center gap-5">
      <Switch on={on} onToggle={toggle} />
      <div className="flex gap-3">
        <DemoButton onClick={() => setOn(true)}>Set on</DemoButton>
        <DemoButton onClick={() => setOn(false)}>Set off</DemoButton>
      </div>
    </div>
  );
}

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className="group flex min-h-11 items-center gap-3 rounded-full border border-slate-syntax/40 bg-ground py-2 pl-2 pr-5 transition-colors duration-200 hover:border-slate-syntax"
    >
      <span
        aria-hidden="true"
        className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors duration-200 ${
          on ? "bg-accent" : "bg-slate-syntax/60"
        }`}
      >
        <span
          className={`size-5 rounded-full bg-ground transition-transform duration-200 ${
            on ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
      <span className="font-mono text-sm text-fg">{on ? "On" : "Off"}</span>
    </button>
  );
}
