"use client";

import { useToggle } from "hookli";

/* Live proof for the landing page: same logic as the LightSwitch sample shown
   beside it (components/LiveProofSection.tsx), imported from the published
   `hookli` package — styling classes are the only addition. */
export function UseToggleDemo() {
  const [on, toggle] = useToggle(false);

  return (
    <button
      type="button"
      onClick={toggle}
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
