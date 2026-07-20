import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useQueue } from "./use-queue";

describe("useQueue", () => {
  it("adds and removes in FIFO order", () => {
    const { result } = renderHook(() => useQueue<number>([1]));
    act(() => result.current.add(2));
    act(() => result.current.add(3));
    expect(result.current.queue).toEqual([1, 2, 3]);
    expect(result.current.first).toBe(1);
    expect(result.current.last).toBe(3);
    expect(result.current.size).toBe(3);

    let removed: number | undefined;
    act(() => {
      removed = result.current.remove();
    });
    expect(removed).toBe(1);
    expect(result.current.queue).toEqual([2, 3]);
  });

  it("clears", () => {
    const { result } = renderHook(() => useQueue([1, 2]));
    act(() => result.current.clear());
    expect(result.current.queue).toEqual([]);
    expect(result.current.first).toBeUndefined();
  });
});
