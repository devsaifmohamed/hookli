"use client";

import { useState } from "react";
import { useMediaQuery, useScript } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

/* A tiny, dependency-free library on a public CDN: loading it defines
   window.confetti, which is real proof the script became "ready". */
const CONFETTI_SRC =
  "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js";

type ConfettiWindow = Window & {
  confetti?: (options?: { particleCount?: number; spread?: number }) => void;
};

const STATUS_TONE: Record<string, string> = {
  idle: "text-gray-body",
  loading: "text-accent",
  ready: "text-accent",
  error: "text-fg",
};

/* Docs-page demo (DH9): loads an external <script> on demand and tracks its load
   status. SSR-safe and never auto-loads — the src stays null until the button
   click, so the build prerenders and page load stay network-free. Mirrors the
   usage snippet in lib/hook-docs.ts — keep in sync. */
export function UseScriptDocDemo() {
  const [src, setSrc] = useState<string | null>(null);
  const status = useScript(src, { removeOnUnmount: true });
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  function celebrate() {
    const confetti = (window as ConfettiWindow).confetti;
    if (confetti) confetti({ particleCount: 90, spread: 70 });
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <dl>
        <DemoReadout label="status">
          <span className={STATUS_TONE[status] ?? "text-fg"}>{status}</span>
        </DemoReadout>
        <DemoReadout label="window.confetti">
          {status === "ready" ? "function" : "undefined"}
        </DemoReadout>
      </dl>
      <div className="flex flex-wrap items-center gap-3">
        <DemoButton
          onClick={() => setSrc(CONFETTI_SRC)}
          disabled={src !== null}
        >
          {status === "loading" ? "Loading…" : "Load confetti script"}
        </DemoButton>
        <DemoButton
          onClick={celebrate}
          disabled={status !== "ready" || reducedMotion}
        >
          Celebrate
        </DemoButton>
      </div>
      <p className="text-xs text-gray-body">
        {status === "ready"
          ? reducedMotion
            ? "Script loaded — the celebration is disabled while reduced motion is on."
            : "Script loaded — window.confetti is now callable."
          : status === "error"
            ? "The script failed to load (offline or blocked)."
            : "The <script> tag mounts only when you click — nothing loads on page open."}
      </p>
    </div>
  );
}
