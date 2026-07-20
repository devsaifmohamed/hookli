import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useList } from "./use-list";

describe("useList", () => {
  it("defaults to an empty list", () => {
    const { result } = renderHook(() => useList<number>());
    expect(result.current[0]).toEqual([]);
  });

  it("push / insertAt / updateAt / removeAt work immutably", () => {
    const { result } = renderHook(() => useList([1, 2, 3]));

    act(() => result.current[1].push(4));
    expect(result.current[0]).toEqual([1, 2, 3, 4]);

    act(() => result.current[1].insertAt(1, 9));
    expect(result.current[0]).toEqual([1, 9, 2, 3, 4]);

    act(() => result.current[1].updateAt(0, 0));
    expect(result.current[0]).toEqual([0, 9, 2, 3, 4]);

    act(() => result.current[1].removeAt(1));
    expect(result.current[0]).toEqual([0, 2, 3, 4]);
  });

  it("clear and reset", () => {
    const { result } = renderHook(() => useList([1, 2]));
    act(() => result.current[1].clear());
    expect(result.current[0]).toEqual([]);
    act(() => result.current[1].reset());
    expect(result.current[0]).toEqual([1, 2]);
  });
});
