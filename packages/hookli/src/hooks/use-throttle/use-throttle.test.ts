import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useThrottle } from "./use-throttle";

describe("useThrottle", () => {
  afterEach(() => vi.useRealTimers());

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useThrottle("a", 500));
    expect(result.current).toBe("a");
  });

  it("delays updates to at most once per interval", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useThrottle(v, 500), {
      initialProps: { v: "a" },
    });

    rerender({ v: "b" });
    expect(result.current).toBe("a"); // trailing update still pending

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe("b");
  });
});
