import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "./use-debounce";

describe("useDebounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns the value immediately", () => {
    const { result } = renderHook(() => useDebounce("a", 500));
    expect(result.current).toBe("a");
  });

  it("updates only after the delay elapses", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 500), {
      initialProps: { v: "a" },
    });
    rerender({ v: "b" });
    expect(result.current).toBe("a");
    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe("b");
  });
});
