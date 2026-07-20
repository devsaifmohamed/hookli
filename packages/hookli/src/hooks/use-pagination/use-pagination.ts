import { useCallback, useMemo, useState } from "react";

/** Options for {@link usePagination}. */
export interface UsePaginationOptions {
  /** Total number of items. Defaults to `0`. */
  total?: number;
  /** Items per page. Defaults to `10`. */
  pageSize?: number;
  /** Starting page (1-indexed). Defaults to `1`. */
  initialPage?: number;
}

/** The value returned by {@link usePagination}. */
export interface UsePaginationReturn {
  /** Current page (1-indexed). */
  page: number;
  /** Items per page. */
  pageSize: number;
  /** Total number of pages (always ≥ 1). */
  totalPages: number;
  /** Jump to a page (clamped to `[1, totalPages]`). */
  setPage: (page: number) => void;
  /** Go to the next page (clamped). */
  next: () => void;
  /** Go to the previous page (clamped). */
  prev: () => void;
  /** Jump to the first page. */
  first: () => void;
  /** Jump to the last page. */
  last: () => void;
  /** Whether a previous page exists. */
  canPrev: boolean;
  /** Whether a next page exists. */
  canNext: boolean;
  /** Zero-based item index range for the current page: `[start, end)`. */
  range: { start: number; end: number };
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Manages 1-indexed pagination state — page, page size, total pages, navigation
 * helpers, and the current item `range`. Pure state math; no data fetching.
 *
 * @param options - `{ total, pageSize, initialPage }`.
 * @returns Pagination state and navigation helpers.
 */
export const usePagination = (
  options: UsePaginationOptions = {},
): UsePaginationReturn => {
  const { total = 0, pageSize = 10, initialPage = 1 } = options;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const [page, setPageState] = useState<number>(() =>
    clamp(initialPage, 1, totalPages),
  );

  const setPage = useCallback(
    (next: number) => setPageState(clamp(next, 1, totalPages)),
    [totalPages],
  );
  const next = useCallback(
    () => setPageState((p) => clamp(p + 1, 1, totalPages)),
    [totalPages],
  );
  const prev = useCallback(
    () => setPageState((p) => clamp(p - 1, 1, totalPages)),
    [totalPages],
  );
  const first = useCallback(() => setPageState(1), []);
  const last = useCallback(() => setPageState(totalPages), [totalPages]);

  const current = clamp(page, 1, totalPages);
  const range = useMemo(
    () => ({
      start: (current - 1) * pageSize,
      end: Math.min(current * pageSize, total),
    }),
    [current, pageSize, total],
  );

  return {
    page: current,
    pageSize,
    totalPages,
    setPage,
    next,
    prev,
    first,
    last,
    canPrev: current > 1,
    canNext: current < totalPages,
    range,
  };
};
