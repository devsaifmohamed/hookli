"use client";

import { useId, useRef, useState } from "react";
import { DemoErrorBoundary } from "@/components/demo-error-boundary";

const TABS = [
  { id: "preview", label: "Preview" },
  { id: "code", label: "Code" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* The frame every hook page's live demo renders in (docs/DESIGN.md §4):
   Preview/Code tabs, ground-raised card, error boundary around the demo. Both
   panels stay mounted so demo state survives tab switches. `code` arrives
   pre-rendered from the server page — shiki never ships to the client. */
export function HookDemo({
  preview,
  code,
  className = "",
}: {
  preview: React.ReactNode;
  code: React.ReactNode;
  className?: string;
}) {
  const [active, setActive] = useState<TabId>("preview");
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

  return (
    <div
      className={`surface overflow-hidden rounded-xl ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-syntax/40 px-2">
        <div
          role="tablist"
          aria-label="Demo view"
          onKeyDown={onKeyDown}
          className="flex"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={active === tab.id}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={active === tab.id ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className={`-mb-px min-h-11 border-b-2 px-4 text-xs transition-colors duration-200 ${
                active === tab.id
                  ? "border-accent text-fg"
                  : "border-transparent text-gray-body hover:text-fg"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="hidden px-2 text-xs text-gray-body sm:inline">
          live · imported from hookli
        </span>
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-preview`}
        aria-labelledby={`${baseId}-tab-preview`}
        hidden={active !== "preview"}
        className="flex min-h-[180px] items-center justify-center p-8"
      >
        <DemoErrorBoundary>{preview}</DemoErrorBoundary>
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-code`}
        aria-labelledby={`${baseId}-tab-code`}
        hidden={active !== "code"}
      >
        {code}
      </div>
    </div>
  );
}
