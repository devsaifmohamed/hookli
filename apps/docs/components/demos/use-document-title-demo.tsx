"use client";

import { useState } from "react";
import { useDocumentTitle } from "hookli";
import { DemoButton, DemoInput, DemoReadout } from "./ui";

/* Docs-page demo (DH4): the title text drives document.title live — watch the
   browser tab. The child sets the title with preserveTitleOnUnmount: false, so
   unmounting it restores the title captured on mount. Mirrors the usage snippet
   in lib/hook-docs.ts — keep in sync. SSR-safe: the hook no-ops during server
   rendering and syncs in a layout effect once mounted. */
function TitleSetter({ title }: { title: string }) {
  useDocumentTitle(title, { preserveTitleOnUnmount: false });

  return (
    <dl className="w-full">
      <DemoReadout label="document.title">
        <span className="text-accent">{title || "(empty)"}</span>
      </DemoReadout>
    </dl>
  );
}

export function UseDocumentTitleDocDemo() {
  const [title, setTitle] = useState("Look up at the tab ✦");
  const [applied, setApplied] = useState(true);

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <DemoInput
        label="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Type a page title"
      />
      <div className="min-h-14">
        {applied ? (
          <TitleSetter title={title} />
        ) : (
          <p className="font-mono text-sm text-gray-body">
            title restored to the site default
          </p>
        )}
      </div>
      <DemoButton
        onClick={() => setApplied((prev) => !prev)}
        aria-pressed={applied}
      >
        {applied ? "Restore original" : "Apply title"}
      </DemoButton>
      <p className="text-xs text-gray-body">
        Type above and the browser tab updates as you go. Restoring unmounts the
        hook, which puts back the title it captured on mount.
      </p>
    </div>
  );
}
