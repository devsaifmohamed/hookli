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
  type HookCategory,
} from "@/lib/hooks-registry";
import {
  BookOpenIcon,
  DatabaseIcon,
  GlobeIcon,
  MenuIcon,
  ServerIcon,
  SlidersIcon,
  SparklesIcon,
  XIcon,
  ZapIcon,
} from "./icons";

const CATEGORY_ICONS: Record<HookCategory, React.ComponentType<{ className?: string }>> = {
  state: SlidersIcon,
  dom: GlobeIcon,
  effects: ZapIcon,
  data: DatabaseIcon,
};

/* Modern Mintlify-style sidebar:
   - Grouped navigation with category icons and count pills
   - Smooth translucent active pill (no harsh left vertical borders)
   - Sticky under the h-14 header
   - Mobile-responsive slide-over drawer */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/[0.06] md:block">
      <nav
        aria-label="Docs"
        className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-6 pr-4 pl-1"
      >
        <DocsNavList pathname={pathname} />
      </nav>
    </aside>
  );
}

/* Mobile-only drawer navigation. */
export function MobileDocsNav() {
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const currentLabel =
    pathname === "/docs"
      ? "Overview"
      : pathname === "/docs/mcp"
        ? "MCP Server"
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
    <div className="sticky top-14 z-30 -mx-4 border-b border-white/[0.06] bg-ground/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex min-h-11 w-full items-center justify-between text-sm text-gray-body transition-colors duration-200 hover:text-fg"
      >
        <div className="flex items-center gap-2">
          <MenuIcon className="size-4 shrink-0 text-accent" />
          <span className="text-gray-body/70 text-xs">docs /</span>
          <span className="truncate text-fg font-medium">{currentLabel}</span>
        </div>
        <span className="text-[11px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
          Navigation
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-ground/80 backdrop-blur-md md:hidden"
            onMouseDown={close}
          >
            <div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Docs navigation"
              onMouseDown={(event) => event.stopPropagation()}
              onKeyDown={onDrawerKeyDown}
              className="flex h-full w-80 max-w-[85vw] flex-col border-r border-white/[0.08] bg-ground-raised shadow-2xl"
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="size-4 text-accent" />
                  <span className="text-sm font-semibold text-fg">Documentation</span>
                </div>
                <button
                  autoFocus
                  type="button"
                  onClick={close}
                  aria-label="Close docs navigation"
                  className="flex size-9 items-center justify-center rounded-lg text-gray-body transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
              <nav
                aria-label="Docs"
                className="flex-1 overflow-y-auto px-3 py-5"
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
    <div className="space-y-6">
      {/* Getting Started Group */}
      <div>
        <p className="px-2.5 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-body/60">
          Getting Started
        </p>
        <ul className="space-y-0.5">
          <li>
            <SidebarPillLink
              href="/docs"
              active={pathname === "/docs"}
              onNavigate={onNavigate}
              icon={BookOpenIcon}
            >
              Overview
            </SidebarPillLink>
          </li>
          <li>
            <SidebarPillLink
              href="/docs/mcp"
              active={pathname === "/docs/mcp"}
              onNavigate={onNavigate}
              icon={ServerIcon}
              badge="AI"
            >
              MCP Server
            </SidebarPillLink>
          </li>
        </ul>
      </div>

      {/* Hook Categories */}
      {CATEGORY_ORDER.map((category) => {
        const hooks = hooksByCategory(category);
        const Icon = CATEGORY_ICONS[category];

        return (
          <div key={category} className="space-y-1">
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-body/70">
              <div className="flex items-center gap-2">
                <Icon className="size-3.5 text-accent/80" />
                <span>{CATEGORY_LABELS[category]}</span>
              </div>
              <span className="font-mono text-[10px] text-gray-body/50 bg-white/[0.04] px-1.5 py-0.2 rounded-full border border-white/[0.04]">
                {hooks.length}
              </span>
            </div>

            <ul className="space-y-0.5">
              {hooks.map((hook) => {
                const href = `/docs/${hook.slug}`;
                const active = pathname === href;

                return (
                  <li key={hook.slug}>
                    <SidebarPillLink
                      href={href}
                      active={active}
                      onNavigate={onNavigate}
                    >
                      {hook.name}
                    </SidebarPillLink>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function SidebarPillLink({
  href,
  active,
  onNavigate,
  icon: Icon,
  badge,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-normal transition-all duration-150 ${
        active
          ? "bg-accent/15 text-accent font-medium shadow-sm shadow-accent/10"
          : "text-gray-body hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {Icon && (
          <Icon
            className={`size-3.5 shrink-0 transition-colors ${
              active ? "text-accent" : "text-gray-body/60 group-hover:text-white"
            }`}
          />
        )}
        <span className="truncate">{children}</span>
      </div>

      {badge ? (
        <span className="rounded-full bg-accent/20 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-accent border border-accent/30">
          {badge}
        </span>
      ) : active ? (
        <span
          className="size-1.5 rounded-full bg-accent shadow-sm shadow-accent shrink-0"
          aria-hidden="true"
        />
      ) : null}
    </Link>
  );
}
