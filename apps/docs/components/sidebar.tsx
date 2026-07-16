"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getHook,
  hooksByCategory,
} from "@/lib/hooks-registry";
import { MenuIcon, XIcon } from "./icons";

/* Docs sidebar (docs/DESIGN.md §2, §5): sticky under the h-14 header, grouped
   by category, active state from the pathname. Below md it collapses to
   MobileDocsNav — a sticky trigger bar opening a left slide-over drawer. */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-slate-syntax/40 md:block">
      <nav
        aria-label="Docs"
        className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-8 pr-6"
      >
        <DocsNavList pathname={pathname} />
      </nav>
    </aside>
  );
}

/* Mobile-only (md:hidden) drawer navigation. Same two-piece dialog recipe as
   SearchPalette: portal + overlay, scroll lock, Escape closes, focus returns
   to the trigger; Tab is trapped inside the drawer. Links close on click —
   no pathname effect needed (react-hooks/set-state-in-effect stays quiet). */
export function MobileDocsNav() {
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const currentLabel =
    pathname === "/docs"
      ? "Overview"
      : (getHook(pathname.replace("/docs/", ""))?.name ?? "Docs");

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  /* Scroll lock while the drawer is up. */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function onDrawerKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusables =
      drawerRef.current?.querySelectorAll<HTMLElement>("a[href], button");
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="sticky top-14 z-30 -mx-4 border-b border-slate-syntax/40 bg-ground/90 px-4 backdrop-blur sm:-mx-6 sm:px-6 md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex min-h-11 w-full items-center gap-2 text-sm text-gray-body transition-colors duration-200 hover:text-fg"
      >
        <MenuIcon className="size-4 shrink-0" />
        <span className="text-slate-syntax">docs /</span>
        <span className="truncate text-fg">{currentLabel}</span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-ground/80 backdrop-blur-sm md:hidden"
            onMouseDown={close}
          >
            <div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Docs navigation"
              onMouseDown={(event) => event.stopPropagation()}
              onKeyDown={onDrawerKeyDown}
              className="flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-syntax/40 bg-ground-raised"
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-syntax/40 pl-4 pr-2">
                <span className="text-sm text-gray-body">Docs</span>
                <button
                  autoFocus
                  type="button"
                  onClick={close}
                  aria-label="Close docs navigation"
                  className="flex size-11 items-center justify-center rounded-md text-gray-body transition-colors duration-200 hover:text-fg"
                >
                  <XIcon className="size-5" />
                </button>
              </div>
              <nav
                aria-label="Docs"
                className="flex-1 overflow-y-auto px-4 py-6"
              >
                <DocsNavList
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/* Shared between the desktop sidebar and the mobile drawer. */
function DocsNavList({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <ul className="flex flex-col border-l border-slate-syntax/40">
        <li>
          <SidebarLink
            href="/docs"
            active={pathname === "/docs"}
            onNavigate={onNavigate}
          >
            Overview
          </SidebarLink>
        </li>
      </ul>
      {CATEGORY_ORDER.map((category) => (
        <div key={category} className="mt-7">
          <h3 className="mb-2 pl-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-syntax">
            {CATEGORY_LABELS[category]}
          </h3>
          <ul className="flex flex-col border-l border-slate-syntax/40">
            {hooksByCategory(category).map((hook) => {
              const href = `/docs/${hook.slug}`;
              return (
                <li key={hook.slug}>
                  <SidebarLink
                    href={href}
                    active={pathname === href}
                    onNavigate={onNavigate}
                  >
                    {hook.name}
                  </SidebarLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

function SidebarLink({
  href,
  active,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`-ml-px flex min-h-11 items-center border-l-2 pl-4 text-sm transition-colors duration-200 md:min-h-9 ${
        active
          ? "border-accent font-medium text-fg"
          : "border-transparent text-gray-body hover:border-slate-syntax hover:text-fg"
      }`}
    >
      {children}
    </Link>
  );
}
