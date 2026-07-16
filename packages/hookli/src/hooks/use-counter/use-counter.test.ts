import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCounter } from "./use-counter";

describe("useCounter", () => {
  it("defaults to 0", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it("honours the initial value", () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it("increments and decrements", () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => result.current.increment());
    expect(result.current.count).toBe(1);

    act(() => result.current.decrement());
    expect(result.current.count).toBe(0);
  });

  it("resets to the initial value", () => {
    const { result } = renderHook(() => useCounter(3));
    act(() => result.current.increment());
    act(() => result.current.reset());
    expect(result.current.count).toBe(3);
  });

  it("setCount accepts a value and an updater", () => {
    const { result } = renderHook(() => useCounter());
    act(() => result.current.setCount(10));
    expect(result.current.count).toBe(10);
    act(() => result.current.setCount((c) => c + 5));
    expect(result.current.count).toBe(15);
  });
});
