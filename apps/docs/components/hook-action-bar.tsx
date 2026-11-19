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
import type { HookEntry } from "@/lib/hooks-registry";

const MCP_CONFIG = JSON.stringify(
  {
    mcpServers: {
      hookli: {
        command: "npx",
        args: ["-y", "hookli-mcp"],
      },
    },
  },
  null,
  2,
);

/* Modern Mintlify-style Action Area:
   - Row 1: Dedicated import statement chip (clean, spacious, instant copy)
   - Row 2: AI assistant row (Copy for AI CTA + 1-Click Copy MCP JSON + AI deep links) */
/* `markdown` and `docUrl` are built on the server (HookPage) so the hook sources
   behind "Copy for AI" never ship in the page's client JavaScript. */
type HookActionBarProps = {
  hook: HookEntry;
  markdown: string;
  docUrl: string;
};

export function HookActionBar({ hook, markdown, docUrl }: HookActionBarProps) {
  const [copiedImport, setCopiedImport] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);

  const importTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mcpTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const importSnippet = `import { ${hook.name} } from 'hookli';`;
  const prompt = `I'm using the ${hook.name} React hook from the hookli library. Explain what it does and show me how to use it. Reference: ${docUrl}`;
  const chatgptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

  useEffect(() => {
    return () => {
      if (importTimeout.current) clearTimeout(importTimeout.current);
      if (aiTimeout.current) clearTimeout(aiTimeout.current);
      if (mcpTimeout.current) clearTimeout(mcpTimeout.current);
    };
  }, []);

  async function copyImport() {
    try {
      await navigator.clipboard.writeText(importSnippet);
    } catch {
      return;
    }
    setCopiedImport(true);
    if (importTimeout.current) clearTimeout(importTimeout.current);
    importTimeout.current = setTimeout(() => setCopiedImport(false), 2000);
  }

  async function copyAi() {
    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      return;
    }
    setCopiedAi(true);
    if (aiTimeout.current) clearTimeout(aiTimeout.current);
    aiTimeout.current = setTimeout(() => setCopiedAi(false), 2000);
  }

  async function copyMcp() {
    try {
      await navigator.clipboard.writeText(MCP_CONFIG);
    } catch {
      return;
    }
    setCopiedMcp(true);
    if (mcpTimeout.current) clearTimeout(mcpTimeout.current);
    mcpTimeout.current = setTimeout(() => setCopiedMcp(false), 2000);
  }

  return (
    <div className="mt-5 space-y-3">
      {/* Row 1: Import snippet chip — dedicated line, spacious, never wraps */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={copyImport}
          className="group inline-flex h-8 max-w-full items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 font-mono text-xs text-gray-body transition-all duration-150 hover:border-accent/40 hover:bg-white/[0.06] hover:text-white active:scale-95"
          title="Click to copy import statement"
        >
          <span className="inline-flex items-center gap-1.5 truncate">
            <span className="text-accent">import</span>
            <span className="text-fg font-medium">&#123; {hook.name} &#125;</span>
            <span className="text-accent">from</span>
            <span className="text-gray-body/90">&apos;hookli&apos;</span>
          </span>
          <span className="flex size-4 shrink-0 items-center justify-center text-gray-body/60 group-hover:text-accent transition-colors">
            {copiedImport ? (
              <CheckIcon className="size-3 text-emerald-400 stroke-[2.5]" />
            ) : (
              <CopyIcon className="size-3" />
            )}
          </span>
        </button>
      </div>

      {/* Row 2: AI Assistant Row — distinct workflow row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Copy for AI Button — crisp black text on Classic React Cyan (12:1 contrast) */}
        <button
          type="button"
          onClick={copyAi}
          className={`inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all duration-150 active:scale-95 whitespace-nowrap ${
            copiedAi
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : "bg-accent text-ground shadow-sm shadow-accent/25 hover:bg-accent-hover"
          }`}
        >
          {copiedAi ? (
            <>
              <CheckIcon className="size-3 stroke-[2.5]" />
              <span>Copied for AI</span>
            </>
          ) : (
            <>
              <SparklesIcon className="size-3 text-ground" />
              <span className="text-ground">Copy for AI</span>
            </>
          )}
        </button>

        {/* 1-Click Copy MCP Config */}
        <button
          type="button"
          onClick={copyMcp}
          className={`inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all duration-150 active:scale-95 whitespace-nowrap ${
            copiedMcp
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : "border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
          }`}
          title="Copy mcp.json config for Cursor and Claude Desktop"
        >
          {copiedMcp ? (
            <>
              <CheckIcon className="size-3 text-emerald-400 stroke-[2.5]" />
              <span>Copied mcp.json</span>
            </>
          ) : (
            <>
              <ServerIcon className="size-3" />
              <span>Copy MCP JSON</span>
            </>
          )}
        </button>

        <span className="hidden sm:inline-block h-3.5 w-px bg-white/10 mx-0.5" aria-hidden="true" />

        {/* ChatGPT */}
        <a
          href={chatgptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs text-gray-body/70 transition-colors hover:bg-white/[0.05] hover:text-white whitespace-nowrap"
          title="Open prompt in ChatGPT"
        >
          <span>ChatGPT</span>
          <ExternalLinkIcon className="size-2.5 opacity-50" />
        </a>

        {/* Claude */}
        <a
          href={claudeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs text-gray-body/70 transition-colors hover:bg-white/[0.05] hover:text-white whitespace-nowrap"
          title="Open prompt in Claude"
        >
          <span>Claude</span>
          <ExternalLinkIcon className="size-2.5 opacity-50" />
        </a>

        {/* MCP Guide Link */}
        <Link
          href="/docs/mcp"
          className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs text-gray-body/70 transition-colors hover:bg-white/[0.05] hover:text-accent whitespace-nowrap"
          title="Connect hookli via MCP"
        >
          <ServerIcon className="size-3 opacity-60" />
          <span>MCP Guide</span>
        </Link>
      </div>
    </div>
  );
}
