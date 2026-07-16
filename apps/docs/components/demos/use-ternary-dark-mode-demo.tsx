"use client";

import { useSyncExternalStore } from "react";
import { useTernaryDarkMode } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

/* Hydration gate: false on the server and during hydration, true after. The
   resolved isDarkMode reads the OS media query, so styling waits for mount to
   avoid a mismatch. */
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

const MODES = ["light", "system", "dark"] as const;

/* Docs-page demo (DH9): a three-state theme preference — light / system / dark —
   persisted to localStorage and resolved against the OS color scheme. The mode
   is scoped to the preview panel, so the docs stay dark either way. Mirrors the
   usage snippet in lib/hook-docs.ts — keep in sync. */
export function UseTernaryDarkModeDocDemo() {
  const { isDarkMode, ternaryDarkMode, setTernaryDarkMode, toggleTernaryDarkMode } =
    useTernaryDarkMode({ localStorageKey: "hookli-docs-ternary-theme" });
  const mounted = useMounted();
  const dark = mounted && isDarkMode;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div
        role="group"
        aria-label="Theme preference"
        className="flex gap-2"
      >
        {MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setTernaryDarkMode(mode)}
            aria-pressed={ternaryDarkMode === mode}
            className="min-h-11 flex-1 rounded-md border border-slate-syntax/40 px-3 font-mono text-sm capitalize text-gray-body transition-colors duration-200 hover:border-slate-syntax hover:text-fg aria-pressed:border-accent/60 aria-pressed:bg-accent/10 aria-pressed:text-accent"
          >
            {mode}
          </button>
        ))}
      </div>
      <div
        className={`rounded-lg border p-4 transition-colors duration-200 ${
          dark
            ? "border-slate-syntax/40 bg-ground"
            : "border-slate-300 bg-slate-50"
        }`}
      >
        <p className={`font-mono text-sm ${dark ? "text-fg" : "text-ground"}`}>
          {dark ? "Resolved: dark" : "Resolved: light"}
        </p>
        {/* light-panel exception: slate-syntax is text-grade on slate-50 (~9:1); gray-body would be ~1.7:1 */}
        <p className={`mt-2 text-xs ${dark ? "text-gray-body" : "text-slate-syntax"}`}>
          &ldquo;system&rdquo; follows your OS setting — the other two force a mode.
        </p>
      </div>
      <dl>
        <DemoReadout label="ternaryDarkMode">{ternaryDarkMode}</DemoReadout>
        <DemoReadout label="isDarkMode">{String(dark)}</DemoReadout>
      </dl>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-gray-body">
          The choice persists — reload and the panel keeps its mode.
        </p>
        <DemoButton onClick={toggleTernaryDarkMode}>Cycle</DemoButton>
      </div>
    </div>
  );
}
