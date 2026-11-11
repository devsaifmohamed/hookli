"use client";

import { useTextSelection } from "hookli";
import { DemoReadout } from "./ui";

export function UseTextSelectionDocDemo() {
  const selectedText = useTextSelection();

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="rounded-lg border border-gray-outline bg-ground p-4 text-sm leading-relaxed text-fg">
        Highlight any portion of this sentence with your cursor to test the reactive text selection hook in real time.
      </div>
      <dl className="w-full max-w-sm">
        <DemoReadout label="selected text">
          {selectedText ? `"${selectedText}"` : "(no text selected)"}
        </DemoReadout>
        <DemoReadout label="character length">{selectedText.length}</DemoReadout>
      </dl>
    </div>
  );
}
