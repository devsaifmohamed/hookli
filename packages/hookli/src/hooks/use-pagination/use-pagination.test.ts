import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePagination } from "./use-pagination";

describe("usePagination", () => {
  it("computes total pages and the current range", () => {
    const { result } = renderHook(() => usePagination({ total: 95, pageSize: 10 }));
    expect(result.current.totalPages).toBe(10);
    expect(result.current.page).toBe(1);
    expect(result.current.canPrev).toBe(false);
    expect(result.current.range).toEqual({ start: 0, end: 10 });
  });

  it("navigates and clamps", () => {
    const { result } = renderHook(() => usePagination({ total: 95, pageSize: 10 }));

    act(() => result.current.next());
    expect(result.current.page).toBe(2);
    expect(result.current.range).toEqual({ start: 10, end: 20 });

    act(() => result.current.last());
    expect(result.current.page).toBe(10);
    expect(result.current.canNext).toBe(false);
    expect(result.current.range).toEqual({ start: 90, end: 95 });

    act(() => result.current.setPage(999));
    expect(result.current.page).toBe(10);

    act(() => result.current.first());
    expect(result.current.page).toBe(1);
  });

  it("always has at least one page", () => {
    const { result } = renderHook(() => usePagination());
    expect(result.current.totalPages).toBe(1);
  });
});
