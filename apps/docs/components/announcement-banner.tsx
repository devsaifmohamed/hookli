"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { SparklesIcon, XIcon } from "@/components/icons";

const STORAGE_KEY = "hookli_mcp_banner_dismissed_v1";
const emptySubscribe = () => () => {};

export function AnnouncementBanner() {
  const [userDismissed, setUserDismissed] = useState(false);

  const isDismissed = useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        return sessionStorage.getItem(STORAGE_KEY) === "true";
      } catch {
        return false;
      }
    },
    () => true // SSR returns true to prevent hydration mismatch
  );

  function handleDismiss() {
    setUserDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore in restricted private browsing
    }
  }

  if (isDismissed || userDismissed) return null;

  return (
    <aside
      role="region"
      aria-label="New release announcement"
      className="announcement-banner relative z-50 flex items-center justify-center gap-2.5 border-b border-accent/20 bg-accent/[0.06] px-4 py-2.5 text-center text-xs sm:text-sm backdrop-blur-md"
    >
      {/* Radar pulse dot */}
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-accent" />
      </span>

      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span className="text-gray-body">
          <strong className="font-semibold text-fg">NEW</strong> — hookli MCP Server is live. Your AI writes perfect hook code now.
        </span>

        <Link
          href="/docs/mcp"
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-ground shadow-sm shadow-accent/20 transition-all duration-150 hover:bg-accent-hover hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <SparklesIcon className="size-3 text-ground" />
          <span>Set up in 30 seconds →</span>
        </Link>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-body/60 transition-colors hover:bg-white/[0.06] hover:text-white"
        aria-label="Dismiss announcement"
        title="Dismiss announcement"
      >
        <XIcon className="size-3.5" />
      </button>
    </aside>
  );
}
