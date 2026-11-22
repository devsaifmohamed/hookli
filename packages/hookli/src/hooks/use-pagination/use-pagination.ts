import { useCallback, useMemo, useState } from "react";

export interface UsePaginationOptions {
  /** Total number of items. Defaults to `0`. */
  total?: number;
  /** Items per page. Defaults to `10`. */
  pageSize?: number;
  /** Starting page (1-indexed). Defaults to `1`. */
  initialPage?: number;
}

export interface UsePaginationReturn {
  /** Current page number (1-indexed). */
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  next: () => void;
  prev: () => void;
  first: () => void;
  last: () => void;
  canPrev: boolean;
  canNext: boolean;
  /** Zero-based item indices for the current page. */
  range: { start: number; end: number };
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Manages 1-indexed pagination state — page, page size, total pages, navigation
 * helpers, and the current item `range`. Pure state math; no data fetching.
 *
 * @category data
 * @keywords pagination, pages, page number, page size, next page, offset limit, table paging
 *
 * @example Usage
 * ```tsx
 * import { usePagination } from "hookli";
 *
 * export function Demo() {
 *   const { page, totalPages, next, prev, canNext, canPrev } = usePagination({
 *     total: 100,
 *     pageSize: 10,
 *     initialPage: 1,
 *   });
 *
 *   return (
 *     <div>
 *       <p>Page {page} of {totalPages}</p>
 *       <button disabled={!canPrev} onClick={prev}>Prev</button>
 *       <button disabled={!canNext} onClick={next}>Next</button>
 *     </div>
 *   );
 * }
 * ```
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
