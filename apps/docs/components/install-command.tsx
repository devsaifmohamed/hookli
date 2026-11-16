"use client";

import { CopyButton } from "@/components/copy-button";

const COMMAND = "npm i hookli";

export function InstallCommand({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-flex h-10 w-full items-center justify-between gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] pl-3.5 pr-1.5 font-mono text-xs ${className}`}
    >
      <code className="whitespace-nowrap">
        <span aria-hidden="true" className="select-none text-accent font-semibold">
          ${" "}
        </span>
        <span className="text-fg font-medium">{COMMAND}</span>
      </code>
      <CopyButton text={COMMAND} label="Copy npm install command" />
    </div>
  );
}
