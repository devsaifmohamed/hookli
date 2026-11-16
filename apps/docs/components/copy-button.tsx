"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";

export function CopyButton({
  text,
  label = "Copy to clipboard",
  copyLabel,
  className = "",
}: {
  text: string;
  label?: string;
  /* When set, renders the labeled pill variant with this visible text (e.g.
     "Copy for AI") instead of the default icon-only square. */
  copyLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return; // Clipboard unavailable (permissions / insecure context).
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  if (copyLabel !== undefined) {
    return (
      <button
        type="button"
        onClick={copy}
        aria-label={label}
        title={label}
        className={`inline-flex h-9 items-center gap-2 rounded-lg border border-gray-outline px-3.5 text-xs font-medium text-fg transition-colors duration-150 hover:border-accent hover:text-accent active:scale-95 ${className}`}
      >
        {copied ? (
          <CheckIcon className="copy-pop size-3.5 text-accent" aria-hidden="true" />
        ) : (
          <CopyIcon className="size-3.5" aria-hidden="true" />
        )}
        <span>{copied ? "Copied" : copyLabel}</span>
        <span aria-live="polite" className="sr-only">
          {copied ? "Copied to clipboard" : ""}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={label}
      className={`flex size-7 shrink-0 items-center justify-center rounded-md text-gray-body/70 transition-all duration-150 hover:bg-white/[0.08] hover:text-white active:scale-90 ${className}`}
    >
      {copied ? (
        <CheckIcon className="copy-pop size-3.5 text-accent stroke-[2.5]" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
