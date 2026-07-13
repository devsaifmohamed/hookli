"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS, HOOKS, type HookEntry } from "@/lib/hooks-registry";
import { SearchIcon } from "./icons";

/* ⌘K command palette over the hook registry (docs/DESIGN.md §7). Client-only —
   lowercase substring match on name/description/category is enough for 11 hooks;
   no service, no index build. Combobox pattern: focus stays on the input and the
   highlighted option is conveyed via aria-activedescendant; Tab cycles between
   the input and the close button (the dialog's only tab stops). Full-screen
   sheet below 640px, centered panel above. */

const subscribeNoop = () => () => {};

/* Server snapshot is false; useSyncExternalStore re-reads on the client without
   tripping react-hooks/set-state-in-effect (see use-dark-mode-demo). */
function useIsApplePlatform() {
  return useSyncExternalStore(
    subscribeNoop,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );
}

function matches(hook: HookEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return hook.name.toLowerCase().includes(q) || hook.description.toLowerCase().includes(q) || hook.category.includes(q) || CATEGORY_LABELS[hook.category].toLowerCase().includes(q);
}

export function SearchPalette() {
  const router = useRouter();
  const isApple = useIsApplePlatform();
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = HOOKS.filter((hook) => matches(hook, query));
  /* Clamp instead of resetting when results shrink under the cursor. */
  const active = Math.max(0, Math.min(activeIndex, results.length - 1));
  const optionId = (hook: HookEntry) => `${listboxId}-${hook.slug}`;

  const openPalette = useCallback(() => {
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const select = useCallback(
    (hook: HookEntry) => {
      setOpen(false);
      router.push(`/docs/${hook.slug}`);
    },
    [router],
  );

  /* Global ⌘K / Ctrl+K toggle. */
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) {
          closePalette();
        } else {
          openPalette();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, openPalette, closePalette]);

  /* Scroll lock while the dialog is up. */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function moveActive(delta: number) {
    if (results.length === 0) return;
    const next = (active + delta + results.length) % results.length;
    setActiveIndex(next);
    document.getElementById(optionId(results[next]))?.scrollIntoView({ block: "nearest" });
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (results[active]) select(results[active]);
    }
  }

  /* Escape + the two-stop focus trap live on the dialog so they work no matter
     which of the tab stops holds focus. */
  function onDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closePalette();
    } else if (event.key === "Tab") {
      event.preventDefault();
      if (document.activeElement === inputRef.current) {
        closeButtonRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPalette}
        aria-label="Search hooks"
        aria-keyshortcuts={isApple ? "Meta+K" : "Control+K"}
        className="flex size-11 items-center justify-center rounded-md text-gray-body transition-colors duration-200 hover:text-fg sm:w-auto sm:gap-2 sm:border sm:border-slate-syntax/60 sm:px-3 sm:hover:border-slate-syntax"
      >
        <SearchIcon className="size-5 sm:size-4" />
        <span className="hidden text-sm sm:inline">Search</span>
        <kbd className="hidden rounded border border-slate-syntax/60 px-1.5 py-0.5 font-mono text-xs text-slate-syntax sm:inline">{isApple ? "⌘" : "Ctrl"} K</kbd>
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex flex-col bg-ground/80 backdrop-blur-sm sm:items-center sm:px-4 sm:pt-[15vh]" onMouseDown={closePalette}>
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Search hooks"
              onMouseDown={(event) => event.stopPropagation()}
              onKeyDown={onDialogKeyDown}
              className="flex h-full w-full flex-col bg-ground-raised sm:h-auto sm:max-w-lg sm:rounded-xl sm:border sm:border-slate-syntax/60 sm:shadow-2xl sm:shadow-black/40"
            >
              <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-syntax/40 px-4">
                <SearchIcon className="size-4 shrink-0 text-slate-syntax" />
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listboxId}
                  aria-autocomplete="list"
                  aria-activedescendant={results[active] ? optionId(results[active]) : undefined}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={onInputKeyDown}
                  placeholder="Search hooks…"
                  className="h-full w-full bg-transparent text-sm text-fg outline-none placeholder:text-slate-syntax"
                />
                <button ref={closeButtonRef} type="button" onClick={closePalette} aria-label="Close search" className="flex min-h-11 shrink-0 items-center rounded-md px-2">
                  <kbd className="rounded border border-slate-syntax/60 px-1.5 py-0.5 font-mono text-xs text-slate-syntax">esc</kbd>
                </button>
              </div>

              <ul id={listboxId} role="listbox" aria-label="Hooks" className="flex-1 overflow-y-auto p-2 sm:max-h-80 sm:flex-none">
                {results.map((hook, index) => (
                  <li
                    key={hook.slug}
                    id={optionId(hook)}
                    role="option"
                    aria-selected={index === active}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => select(hook)}
                    className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 transition-colors duration-150 ${index === active ? "bg-ground-overlay text-accent" : "text-gray-body"}`}
                  >
                    <span className="shrink-0 text-sm">{hook.name}</span>
                    <span className="truncate text-xs">{hook.description}</span>
                    <span className="ml-auto shrink-0 text-xs uppercase tracking-wider text-slate-syntax">{CATEGORY_LABELS[hook.category]}</span>
                  </li>
                ))}
                {results.length === 0 && (
                  <li role="presentation" className="px-3 py-10 text-center text-sm text-slate-syntax">
                    No hooks match &ldquo;{query.trim()}&rdquo;
                  </li>
                )}
              </ul>

              <p className="hidden shrink-0 items-center gap-4 border-t border-slate-syntax/40 px-4 py-2.5 text-xs text-slate-syntax sm:flex">
                <span>↑↓ navigate</span>
                <span>↵ open</span>
                <span>esc close</span>
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
