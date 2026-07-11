"use client";

import { CopyButton } from "@/components/CopyButton";

const COMMAND = "npm i hookli";

export function InstallCommand({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border border-slate-syntax/40 bg-ground-raised py-1 pl-4 pr-1 font-mono text-sm ${className}`}
    >
      <code className="whitespace-nowrap">
        <span aria-hidden="true" className="select-none text-slate-syntax">
          ${" "}
        </span>
        {COMMAND}
      </code>
      <CopyButton text={COMMAND} label="Copy npm install command" />
    </div>
  );
}
