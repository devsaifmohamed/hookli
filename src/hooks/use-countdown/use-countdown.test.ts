import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCountdown } from "./use-countdown";

describe("useCountdown", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("starts at countStart", () => {
    const { result } = renderHook(() => useCountdown({ countStart: 10 }));
    expect(result.current[0]).toBe(10);
  });

  it("counts down every interval and stops at countStop", () => {
    const { result } = renderHook(() => useCountdown({ countStart: 3, intervalMs: 1000 }));

    act(() => result.current[1].startCountdown());

    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current[0]).toBe(2);

    act(() => void vi.advanceTimersByTime(2000));
    expect(result.current[0]).toBe(0);

    // reached countStop → stays put even after more time
    act(() => void vi.advanceTimersByTime(3000));
    expect(result.current[0]).toBe(0);
  });

  it("supports increment mode", () => {
    const { result } = renderHook(() => useCountdown({ countStart: 0, countStop: 2, isIncrement: true, intervalMs: 500 }));

    act(() => result.current[1].startCountdown());
    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current[0]).toBe(2);
  });

  it("stop pauses and reset returns to countStart", () => {
    const { result } = renderHook(() => useCountdown({ countStart: 5, intervalMs: 1000 }));

    act(() => result.current[1].startCountdown());
    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current[0]).toBe(4);

    act(() => result.current[1].stopCountdown());
    act(() => void vi.advanceTimersByTime(3000));
    expect(result.current[0]).toBe(4);

    act(() => result.current[1].resetCountdown());
    expect(result.current[0]).toBe(5);
  });
});
