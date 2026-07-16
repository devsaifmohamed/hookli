"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocalStorageWithExpiry } from "hookli";
import { DemoButton, DemoInput, DemoReadout } from "./ui";

const KEY = "hookli-docs-expiry";
const TTL_MS = 10_000;

/* Mirrors the usage snippet in lib/hook-docs.ts — keep in sync.
   GOTCHA: the hook checks expiry only when it reads (mount / key change), so
   the demo remounts the reader when the countdown hits zero — that re-read is
   what evicts the item and returns null. */
export function UseLocalStorageWithExpiryDocDemo() {
  const [session, setSession] = useState(0);
  const expire = useCallback(() => setSession((s) => s + 1), []);

  return <ExpiryDemo key={session} onExpire={expire} />;
}

function ExpiryDemo({ onExpire }: { onExpire: () => void }) {
  const { value, setStoredValue } = useLocalStorageWithExpiry(KEY, "", TTL_MS);
  const [draft, setDraft] = useState("");
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  /* The countdown reads the stored expiry timestamp from localStorage on each
     tick, so it also resumes for an item saved before a page reload. */
  useEffect(() => {
    const readExpiry = () => {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      try {
        const item = JSON.parse(raw) as { expiry?: number } | null;
        return item && typeof item.expiry === "number" ? item.expiry : null;
      } catch {
        return null;
      }
    };
    const id = setInterval(() => {
      const expiry = readExpiry();
      if (expiry === null) {
        setRemainingMs(null);
        return;
      }
      const left = expiry - Date.now();
      if (left <= 0) {
        onExpire();
        return;
      }
      setRemainingMs(left);
    }, 100);
    return () => clearInterval(id);
  }, [onExpire]);

  const save = () => {
    if (!draft.trim()) return;
    setStoredValue(draft);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <DemoInput
        label="value"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Type, save, watch it expire"
        autoComplete="off"
      />
      <div className="flex items-center gap-4">
        <DemoButton onClick={save}>Save for 10s</DemoButton>
      </div>
      <dl>
        <DemoReadout label="stored value">
          {value === null ? "null" : value || "—"}
        </DemoReadout>
        <DemoReadout label="expires in">
          {remainingMs !== null ? `${(remainingMs / 1000).toFixed(1)}s` : "—"}
        </DemoReadout>
      </dl>
      {remainingMs !== null && (
        <div
          aria-hidden="true"
          className="h-1 overflow-hidden rounded-full bg-slate-syntax/20"
        >
          <div
            className="h-full bg-accent"
            style={{ width: `${Math.min(100, (remainingMs / TTL_MS) * 100)}%` }}
          />
        </div>
      )}
      <p className="font-mono text-xs" aria-live="polite">
        {value === null ? (
          <span className="text-accent">
            expired — item removed from localStorage
          </span>
        ) : remainingMs !== null ? (
          <span className="text-gray-body">
            persisted under {KEY} with a 10s TTL
          </span>
        ) : (
          <span className="text-gray-body">nothing stored yet</span>
        )}
      </p>
    </div>
  );
}
