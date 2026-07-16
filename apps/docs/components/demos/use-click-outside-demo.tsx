"use client";

import { useRef, useState } from "react";
import { useClickOutside } from "hookli";
import { ChevronDownIcon } from "@/components/icons";
import { DemoButton, DemoReadout } from "./ui";

const ACTIONS = ["Rename", "Duplicate", "Share"] as const;

/* Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. The hook fires
   its callback on EVERY outside mousedown, so the open guard lives in the
   callback, not the hook. min-h reserves room for the absolute menu inside the
   overflow-hidden HookDemo frame. */
export function UseClickOutsideDocDemo() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [lastEvent, setLastEvent] = useState("nothing yet");

  useClickOutside(menuRef, () => {
    if (open) {
      setOpen(false);
      setLastEvent("closed by outside click");
    }
  });

  return (
    <div className="flex min-h-60 w-full max-w-sm flex-col gap-4">
      <div ref={menuRef} className="relative self-start">
        <DemoButton
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          Actions
          <ChevronDownIcon
            className={`size-4 transition-transform duration-200 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </DemoButton>
        {open && (
          <ul
            role="menu"
            aria-label="Demo actions"
            className="absolute left-0 top-full z-10 mt-2 w-44 rounded-md border border-slate-syntax/40 bg-ground p-1"
          >
            {ACTIONS.map((action) => (
              <li key={action} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setLastEvent(`ran “${action.toLowerCase()}”`);
                    setOpen(false);
                  }}
                  className="flex min-h-11 w-full items-center rounded px-3 text-left font-mono text-sm text-gray-body transition-colors duration-200 hover:bg-ground-raised hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  {action}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <dl>
        <DemoReadout label="menu">{open ? "open" : "closed"}</DemoReadout>
        <DemoReadout label="last event">{lastEvent}</DemoReadout>
      </dl>
      <p className="font-mono text-xs text-gray-body">
        Open the menu, then click anywhere outside it.
      </p>
    </div>
  );
}
