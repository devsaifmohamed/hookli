import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTimeout } from "./use-timeout";

describe("useTimeout", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("calls the callback once after the delay", () => {
    const cb = vi.fn();
    renderHook(() => useTimeout(cb, 1000));

    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(cb).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("does not schedule when delay is null", () => {
    const cb = vi.fn();
    renderHook(() => useTimeout(cb, null));

    vi.advanceTimersByTime(5000);
    expect(cb).not.toHaveBeenCalled();
  });

  it("invokes the latest callback", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ cb }) => useTimeout(cb, 1000), {
      initialProps: { cb: first },
    });

    rerender({ cb: second });
    vi.advanceTimersByTime(1000);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("clears the timeout on unmount", () => {
    const cb = vi.fn();
    const { unmount } = renderHook(() => useTimeout(cb, 1000));

    unmount();
    vi.advanceTimersByTime(5000);
    expect(cb).not.toHaveBeenCalled();
  });
});
