"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInfiniteScroll } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

const BATCH_SIZE = 8;
const MAX_ITEMS = 32;

function makeBatch(start: number): string[] {
  return Array.from(
    { length: BATCH_SIZE },
    (_, i) => `mock item #${String(start + i + 1).padStart(2, "0")}`,
  );
}

/* Mirrors the usage snippet in lib/hook-docs.ts — keep in sync. The hook
   watches the WINDOW scroll (within 500px of the document bottom), not a
   container — the scoped list here only keeps the page height stable while
   batches append. fetchMoreData must return a promise; isFetching stays true
   until it resolves. */
export function UseInfiniteScrollDocDemo() {
  const [items, setItems] = useState<string[]>(() => makeBatch(0));
  const listRef = useRef<HTMLUListElement>(null);
  const done = items.length >= MAX_ITEMS;

  const fetchMoreData = useCallback(() => {
    if (done) return Promise.resolve();
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setItems((prev) =>
          prev.length >= MAX_ITEMS
            ? prev
            : [...prev, ...makeBatch(prev.length)],
        );
        resolve();
      }, 600);
    });
  }, [done]);

  const isFetching = useInfiniteScroll(fetchMoreData);

  /* Keep the newest batch visible inside the scoped list. */
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [items]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <ul
        ref={listRef}
        className="max-h-48 overflow-y-auto rounded-md border border-slate-syntax/40 bg-ground p-2"
      >
        {items.map((item) => (
          <li
            key={item}
            className="border-b border-slate-syntax/20 px-2 py-2.5 font-mono text-sm text-gray-body last:border-b-0"
          >
            {item}
          </li>
        ))}
      </ul>
      <dl>
        <DemoReadout label="loaded">
          {items.length} / {MAX_ITEMS}
        </DemoReadout>
        <DemoReadout label="isFetching">{String(isFetching)}</DemoReadout>
      </dl>
      <p className="font-mono text-xs" aria-live="polite">
        {isFetching ? (
          <span className="text-accent">loading next batch…</span>
        ) : done ? (
          <span className="text-gray-body">
            all {MAX_ITEMS} items loaded — reset to go again
          </span>
        ) : (
          <span className="text-gray-body">
            scroll the page toward its bottom to load more
          </span>
        )}
      </p>
      <DemoButton onClick={() => setItems(makeBatch(0))}>Reset</DemoButton>
    </div>
  );
}
