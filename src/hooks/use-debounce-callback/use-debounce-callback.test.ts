import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebounceCallback } from "./use-debounce-callback";

describe("useDebounceCallback", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("invokes only once after the delay for rapid calls", () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useDebounceCallback(cb, 200));

    result.current("a");
    result.current("b");
    result.current("c");
    expect(cb).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith("c");
  });

  it("keeps a stable identity across renders", () => {
    const cb = vi.fn();
    const { result, rerender } = renderHook(() => useDebounceCallback(cb, 200));

    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("cancel prevents a pending invocation", () => {
    const cb = vi.fn();
    const { result } = renderHook(() => useDebounceCallback(cb, 200));

    result.current("x");
    result.current.cancel();
    vi.advanceTimersByTime(500);
    expect(cb).not.toHaveBeenCalled();
    expect(result.current.isPending()).toBe(false);
  });

  it("flush invokes immediately and reports the result", () => {
    const cb = vi.fn((n: number) => n * 2);
    const { result } = renderHook(() => useDebounceCallback(cb, 200));

    result.current(21);
    expect(result.current.isPending()).toBe(true);
    expect(result.current.flush()).toBe(42);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(result.current.isPending()).toBe(false);
  });

  it("leading edge invokes on the first call", () => {
    const cb = vi.fn();
    const { result } = renderHook(() =>
      useDebounceCallback(cb, 200, { leading: true, trailing: false }),
    );

    result.current("first");
    expect(cb).toHaveBeenCalledTimes(1);
    result.current("second");
    vi.advanceTimersByTime(200);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("maxWait forces an invocation while calls keep coming", () => {
    const cb = vi.fn();
    const { result } = renderHook(() =>
      useDebounceCallback(cb, 200, { maxWait: 500 }),
    );

    result.current(1);
    vi.advanceTimersByTime(150);
    result.current(2);
    vi.advanceTimersByTime(150);
    result.current(3);
    vi.advanceTimersByTime(200);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("cancels any pending invocation on unmount", () => {
    const cb = vi.fn();
    const { result, unmount } = renderHook(() => useDebounceCallback(cb, 200));

    result.current("y");
    unmount();
    vi.advanceTimersByTime(500);
    expect(cb).not.toHaveBeenCalled();
  });
});
