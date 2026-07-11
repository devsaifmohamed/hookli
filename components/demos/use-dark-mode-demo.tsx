"use client";

import { useSyncExternalStore } from "react";
import { useDarkMode } from "hookli";
import { MoonIcon, SunIcon } from "@/components/Icons";
import { DemoReadout } from "./ui";

/* Hydration gate: false on the server and during hydration, true after. */
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/* Mirrors the usage snippet in lib/hook-docs.ts — keep in sync.
   The hook persists to localStorage("theme") and toggles a `dark` class on
   <body>; this site doesn't style that class, so the mode is scoped to the
   preview panel below. GOTCHA: the hook's initial state reads localStorage on
   the client, so styling waits for mount to avoid a hydration mismatch. */
export function UseDarkModeDocDemo() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const mounted = useMounted();
  const dark = mounted && isDarkMode;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div
        className={`rounded-lg border p-4 transition-colors duration-200 ${
          dark
            ? "border-slate-syntax/40 bg-ground"
            : "border-slate-300 bg-slate-50"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <p
            className={`font-mono text-sm ${dark ? "text-fg" : "text-ground"}`}
          >
            {dark ? "Dark mode" : "Light mode"}
          </p>
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-pressed={dark}
            aria-label="Toggle dark mode"
            className={`flex size-11 items-center justify-center rounded-md border transition-colors duration-200 ${
              dark
                ? "border-slate-syntax/40 text-fg hover:border-slate-syntax"
                : "border-slate-300 text-ground hover:border-slate-400"
            }`}
          >
            {dark ? (
              <MoonIcon className="size-5" />
            ) : (
              <SunIcon className="size-5" />
            )}
          </button>
        </div>
        <p
          className={`mt-2 text-xs ${
            dark ? "text-gray-body" : "text-slate-syntax"
          }`}
        >
          This panel is scoped to the demo — the docs stay dark either way.
        </p>
      </div>
      <dl>
        <DemoReadout label="isDarkMode">{String(dark)}</DemoReadout>
        <DemoReadout label={`localStorage("theme")`}>
          {dark ? "dark" : "light"}
        </DemoReadout>
      </dl>
      <p className="text-xs text-gray-body">
        The choice persists — reload and the panel keeps its mode. The hook
        also toggles a <code className="text-fg">dark</code> class on{" "}
        <code className="text-fg">{"<body>"}</code> for CSS-driven themes.
      </p>
    </div>
  );
}
