import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebounceValue } from "./use-debounce-value";

describe("useDebounceValue", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounceValue("hello", 200));
    expect(result.current[0]).toBe("hello");
  });

  it("evaluates a factory initial value once", () => {
    const factory = vi.fn(() => 7);
    const { result, rerender } = renderHook(() =>
      useDebounceValue(factory, 200),
    );
    rerender();
    expect(result.current[0]).toBe(7);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("updates the debounced value only after the delay", () => {
    const { result } = renderHook(() => useDebounceValue("a", 200));

    act(() => {
      result.current[1]("b");
      result.current[1]("c");
    });
    expect(result.current[0]).toBe("a");

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current[0]).toBe("c");
  });

  it("supports a functional updater", () => {
    const { result } = renderHook(() => useDebounceValue(1, 200));

    act(() => {
      result.current[1]((prev) => prev + 10);
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current[0]).toBe(11);
  });

  it("exposes cancel to drop a pending update", () => {
    const { result } = renderHook(() => useDebounceValue("a", 200));

    act(() => {
      result.current[1]("b");
      result.current[1].cancel();
      vi.advanceTimersByTime(500);
    });
    expect(result.current[0]).toBe("a");
  });
});
