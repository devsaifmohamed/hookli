"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  ServerIcon,
  SparklesIcon,
} from "@/components/icons";
import { hookDocUrl, hookToMarkdown } from "@/lib/hook-markdown";
import type { HookEntry } from "@/lib/hooks-registry";

export function HookAiActions({ hook }: { hook: HookEntry }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markdown = hookToMarkdown(hook);
  const docUrl = hookDocUrl(hook.slug);
  const prompt = `I'm using the ${hook.name} React hook from the hookli library. Explain what it does and show me how to use it. Reference: ${docUrl}`;
  const chatgptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      return;
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 transition-colors hover:border-white/[0.09]">
      {/* Left indicator — clean, minimal, single line */}
      <div className="flex items-center gap-2 min-w-0">
        <SparklesIcon className="size-3.5 shrink-0 text-accent" />
        <span className="text-xs font-medium text-fg whitespace-nowrap">
          Use with AI
        </span>
      </div>

      {/* Right actions — smooth single row, no wrapping */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all duration-150 active:scale-95 whitespace-nowrap ${
            copied
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : "bg-accent text-ground shadow-sm shadow-accent/25 hover:bg-accent-hover font-semibold"
          }`}
        >
          {copied ? (
            <>
              <CheckIcon className="size-3 stroke-[2.5]" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="size-3 text-ground" />
              <span className="text-ground">Copy for AI</span>
            </>
          )}
        </button>

        <span className="h-3.5 w-px bg-white/10 mx-0.5" aria-hidden="true" />

        <a
          href={chatgptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-gray-body/80 transition-colors hover:text-white hover:bg-white/[0.05] whitespace-nowrap"
          title="Open prompt in ChatGPT"
        >
          <span>ChatGPT</span>
          <ExternalLinkIcon className="size-2.5 opacity-50" />
        </a>

        <a
          href={claudeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-gray-body/80 transition-colors hover:text-white hover:bg-white/[0.05] whitespace-nowrap"
          title="Open prompt in Claude"
        >
          <span>Claude</span>
          <ExternalLinkIcon className="size-2.5 opacity-50" />
        </a>

        <Link
          href="/docs/mcp"
          className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-mono text-accent/90 transition-colors hover:text-accent hover:bg-accent/10 whitespace-nowrap"
          title="Connect hookli via MCP"
        >
          <ServerIcon className="size-2.5" />
          <span>MCP</span>
        </Link>
      </div>
    </div>
  );
}
