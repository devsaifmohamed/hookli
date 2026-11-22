"use client";

import { useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { SparklesIcon } from "@/components/icons";
import { HOOKS } from "@/lib/hooks-registry";

type Mode = "package" | "agent";

const COMMANDS: Record<
  Mode,
  { label: string; icon: string; command: string; copyLabel: string }
> = {
  package: {
    label: "Package",
    icon: "📦",
    command: "npm i hookli",
    copyLabel: "Copy npm install command",
  },
  agent: {
    label: "Agent MCP",
    icon: "🤖",
    command: "npx -y hookli-mcp",
    copyLabel: "Copy MCP server run command",
  },
};

export function DualInstallWidget({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("package");
  const active = COMMANDS[mode];

  return (
    <div className={`flex flex-col items-center gap-2.5 ${className}`}>
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
        {(Object.keys(COMMANDS) as Mode[]).map((key) => {
          const isSelected = mode === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-all duration-150 active:scale-95 whitespace-nowrap ${
                isSelected
                  ? "bg-accent text-ground shadow-sm shadow-accent/25"
                  : "text-gray-body hover:text-white"
              }`}
            >
              <span className="text-xs">{COMMANDS[key].icon}</span>
              <span>{COMMANDS[key].label}</span>
              {key === "agent" && (
                <span
                  className={`rounded-full px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider font-bold ${
                    isSelected
                      ? "bg-ground/20 text-ground"
                      : "bg-accent/20 text-accent"
                  }`}
                >
                  New
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Terminal Command Box */}
      <div className="flex h-10 w-full max-w-sm items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] pl-3.5 pr-1.5 font-mono text-xs shadow-inner shadow-black/20">
        <code className="whitespace-nowrap">
          <span aria-hidden="true" className="select-none text-accent font-semibold">
            ${" "}
          </span>
          <span className="text-fg font-medium">{active.command}</span>
        </code>
        <CopyButton text={active.command} label={active.copyLabel} />
      </div>

      {/* Contextual Helper */}
      {mode === "agent" ? (
        <Link
          href="/docs/mcp"
          className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent-hover hover:underline"
        >
          <SparklesIcon className="size-3 text-accent" />
          <span>Setup guide for Cursor, Claude Code & Windsurf →</span>
        </Link>
      ) : (
        <span className="text-xs text-gray-body/60">
          Zero dependencies · {HOOKS.length} hooks · SSR-safe
        </span>
      )}
    </div>
  );
}
