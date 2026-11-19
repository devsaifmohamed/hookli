"use client";

import { useId, useRef, useState } from "react";
import { DemoErrorBoundary } from "@/components/demo-error-boundary";
import { StackBlitzIcon } from "@/components/icons";
import type { HookDoc } from "@/lib/hook-docs";
import type { HookEntry } from "@/lib/hooks-registry";
import { openInStackBlitz, preloadStackBlitz } from "@/lib/stackblitz";

const TABS = [
  { id: "preview", label: "Preview" },
  { id: "code", label: "Code" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* Modern Mintlify-style interactive demo container:
   - Clean segmented pill tabs (Preview | Code)
   - 1-click "Open in StackBlitz ⚡" launcher directly on the playground toolbar
   - Ambient canvas for live component preview
   - Syntax-highlighted code tab with copy functionality */
export function HookDemo({
  preview,
  code,
  hook,
  doc,
  className = "",
}: {
  preview: React.ReactNode;
  code: React.ReactNode;
  hook?: HookEntry;
  doc?: HookDoc;
  className?: string;
}) {
  const [active, setActive] = useState<TabId>("preview");
  const [openingSb, setOpeningSb] = useState(false);
  const tabRefs = useRef<Map<TabId, HTMLButtonElement>>(new Map());
  const baseId = useId();

  function activate(tab: TabId) {
    setActive(tab);
    tabRefs.current.get(tab)?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const index = TABS.findIndex((tab) => tab.id === active);
    if (event.key === "ArrowRight") {
      event.preventDefault();
      activate(TABS[(index + 1) % TABS.length].id);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      activate(TABS[(index - 1 + TABS.length) % TABS.length].id);
    } else if (event.key === "Home") {
      event.preventDefault();
      activate(TABS[0].id);
    } else if (event.key === "End") {
      event.preventDefault();
      activate(TABS[TABS.length - 1].id);
    }
  }

  async function handleStackBlitz() {
    if (!hook || !doc || openingSb) return;
    setOpeningSb(true);
    try {
      await openInStackBlitz(hook, doc);
    } catch (err) {
      console.error("Failed to launch StackBlitz playground:", err);
    } finally {
      setOpeningSb(false);
    }
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/[0.08] bg-ground-raised/80 shadow-lg shadow-black/30 ${className}`}
    >
      {/* Top Header Toolbar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
        {/* Left: View Switcher (Preview | Code) */}
        <div
          role="tablist"
          aria-label="Demo view"
          onKeyDown={onKeyDown}
          className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06]"
        >
          {TABS.map((tab) => {
            const isSelected = active === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(tab.id, el);
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`${baseId}-panel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActive(tab.id)}
                className={`inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                  isSelected
                    ? "bg-accent text-ground shadow-sm shadow-accent/25"
                    : "text-gray-body hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: Open in StackBlitz Action */}
        <div className="flex items-center gap-2">
          {hook && doc && (
            <button
              type="button"
              onClick={handleStackBlitz}
              onPointerEnter={preloadStackBlitz}
              onFocus={preloadStackBlitz}
              disabled={openingSb}
              className="group inline-flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-xs font-medium text-gray-body transition-all duration-150 hover:border-amber-400/40 hover:bg-amber-400/[0.08] hover:text-amber-300 active:scale-95 disabled:opacity-50"
              title="Open this demo in a StackBlitz cloud playground"
            >
              <StackBlitzIcon className="size-3 text-amber-400 transition-transform duration-150 group-hover:scale-110" />
              <span>{openingSb ? "Opening…" : "Open in StackBlitz"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      <div
        role="tabpanel"
        id={`${baseId}-panel-preview`}
        aria-labelledby={`${baseId}-tab-preview`}
        hidden={active !== "preview"}
        className="flex min-h-[220px] items-center justify-center p-8 bg-gradient-to-b from-white/[0.02] to-transparent"
      >
        <DemoErrorBoundary>{preview}</DemoErrorBoundary>
      </div>

      {/* Code Panel */}
      <div
        role="tabpanel"
        id={`${baseId}-panel-code`}
        aria-labelledby={`${baseId}-tab-code`}
        hidden={active !== "code"}
        className="bg-ground/90 overflow-x-auto"
      >
        {code}
      </div>
    </div>
  );
}
