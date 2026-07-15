"use client";

import { useState } from "react";
import { useCopyToClipboard } from "hookli";
import { CheckIcon, CopyIcon } from "@/components/icons";
import { DemoButton, DemoInput, DemoReadout } from "./ui";

/* Docs-page demo (DH9): copies the input's text via the async Clipboard API and
   reports the last copied value. SSR-safe — navigator.clipboard is only touched
   inside the copy callback, never during render. Mirrors the usage snippet in
   lib/hook-docs.ts — keep in sync. */
export function UseCopyToClipboardDocDemo() {
  const [copiedText, copy] = useCopyToClipboard();
  const [text, setText] = useState("npm i hookli");
  const [status, setStatus] = useState<"idle" | "ok" | "fail">("idle");

  async function handleCopy() {
    const ok = await copy(text);
    setStatus(ok ? "ok" : "fail");
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <DemoInput
        label="text to copy"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setStatus("idle");
        }}
        placeholder="Type something to copy"
        autoComplete="off"
      />
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-gray-body" aria-live="polite">
          {status === "ok"
            ? "Copied — paste it anywhere."
            : status === "fail"
              ? "Clipboard unavailable in this context."
              : "Copy, then paste to confirm it worked."}
        </p>
        <DemoButton onClick={handleCopy} disabled={text.length === 0}>
          {status === "ok" ? (
            <CheckIcon className="size-4 text-accent" />
          ) : (
            <CopyIcon className="size-4" />
          )}
          {status === "ok" ? "Copied" : "Copy"}
        </DemoButton>
      </div>
      <dl>
        <DemoReadout label="copiedText">
          {copiedText === null ? "null" : `"${copiedText}"`}
        </DemoReadout>
      </dl>
    </div>
  );
}
