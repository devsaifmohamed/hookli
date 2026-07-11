"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/Icons";

export function CopyButton({
  text,
  label = "Copy to clipboard",
  className = "",
}: {
  text: string;
  label?: string;
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

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className={`flex size-11 items-center justify-center rounded-md text-gray-body transition-colors duration-200 hover:bg-slate-syntax/20 hover:text-fg ${className}`}
    >
      {copied ? (
        <CheckIcon className="size-4 text-accent" />
      ) : (
        <CopyIcon className="size-4" />
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
