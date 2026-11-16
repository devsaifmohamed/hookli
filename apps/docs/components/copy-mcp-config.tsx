"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon, ServerIcon } from "@/components/icons";

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

export function CopyMcpConfig({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(MCP_CONFIG);
    } catch {
      return;
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent transition-all duration-150 hover:bg-accent/20 hover:border-accent/50 active:scale-95 ${className}`}
      title="Copy mcp.json configuration for Cursor and Claude Desktop"
    >
      {copied ? (
        <>
          <CheckIcon className="size-3.5 text-emerald-400 stroke-[2.5]" />
          <span className="text-emerald-300">Copied mcp.json!</span>
        </>
      ) : (
        <>
          <ServerIcon className="size-3.5" />
          <span>Copy mcp.json</span>
          <CopyIcon className="size-3 opacity-60 ml-0.5" />
        </>
      )}
    </button>
  );
}
