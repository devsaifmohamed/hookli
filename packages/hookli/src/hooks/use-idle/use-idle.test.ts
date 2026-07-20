import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIdle } from "./use-idle";

describe("useIdle", () => {
  afterEach(() => vi.useRealTimers());

  it("becomes idle after the threshold", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useIdle(1000));
    expect(result.current).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(true);
  });

  it("resets on activity", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useIdle(1000));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });
    expect(result.current).toBe(false);
  });
});
