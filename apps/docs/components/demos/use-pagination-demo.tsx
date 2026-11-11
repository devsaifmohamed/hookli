"use client";

import { usePagination } from "hookli";
import { DemoButton, DemoReadout } from "./ui";

export function UsePaginationDocDemo() {
  const {
    page,
    totalPages,
    pageSize,
    next,
    prev,
    first,
    last,
    canNext,
    canPrev,
    range,
  } = usePagination({
    total: 95,
    pageSize: 10,
    initialPage: 1,
  });

  return (
    <div className="flex flex-col items-center gap-5">
      <dl className="w-full max-w-sm">
        <DemoReadout label="current page">
          {page} of {totalPages}
        </DemoReadout>
        <DemoReadout label="page size">{pageSize} items</DemoReadout>
        <DemoReadout label="item index range">
          [{range.start} .. {range.end})
        </DemoReadout>
      </dl>
      <div className="flex flex-wrap justify-center gap-2">
        <DemoButton disabled={!canPrev} onClick={first}>
          « First
        </DemoButton>
        <DemoButton disabled={!canPrev} onClick={prev}>
          ‹ Prev
        </DemoButton>
        <DemoButton disabled={!canNext} onClick={next}>
          Next ›
        </DemoButton>
        <DemoButton disabled={!canNext} onClick={last}>
          Last »
        </DemoButton>
      </div>
    </div>
  );
}
