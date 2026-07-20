import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useLongPress } from "./use-long-press";

describe("useLongPress", () => {
  afterEach(() => vi.useRealTimers());

  it("fires after the delay", () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const { result } = renderHook(() => useLongPress(cb, { delay: 500 }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    act(() => result.current.onMouseDown({} as any));
    expect(cb).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(500));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("cancels when released early", () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const { result } = renderHook(() => useLongPress(cb, { delay: 500 }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    act(() => result.current.onMouseDown({} as any));
    act(() => result.current.onMouseUp());
    act(() => vi.advanceTimersByTime(500));
    expect(cb).not.toHaveBeenCalled();
  });
});
