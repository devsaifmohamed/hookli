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
        className={`inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-outline px-4 text-sm font-medium text-fg transition-colors duration-200 hover:border-accent hover:text-accent ${className}`}
      >
        {copied ? (
          <CheckIcon className="copy-pop size-4 text-accent" aria-hidden="true" />
        ) : (
          <CopyIcon className="size-4" aria-hidden="true" />
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
      className={`flex size-11 items-center justify-center rounded-md text-gray-body transition-colors duration-200 hover:bg-ground-overlay hover:text-fg ${className}`}
    >
      {copied ? (
        <CheckIcon className="copy-pop size-4 text-accent" />
      ) : (
        <CopyIcon className="size-4" />
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
