import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSet } from "./use-set";

describe("useSet", () => {
  it("initialises from an iterable", () => {
    const { result } = renderHook(() => useSet([1, 2]));
    expect([...result.current[0]]).toEqual([1, 2]);
  });

  it("add / remove / toggle / has", () => {
    const { result } = renderHook(() => useSet<number>());

    act(() => result.current[1].add(1));
    expect(result.current[1].has(1)).toBe(true);

    act(() => result.current[1].toggle(1));
    expect(result.current[1].has(1)).toBe(false);

    act(() => result.current[1].toggle(2));
    expect(result.current[1].has(2)).toBe(true);

    act(() => result.current[1].remove(2));
    expect([...result.current[0]]).toEqual([]);
  });

  it("clear and reset", () => {
    const { result } = renderHook(() => useSet([1, 2]));
    act(() => result.current[1].clear());
    expect(result.current[0].size).toBe(0);
    act(() => result.current[1].reset());
    expect([...result.current[0]]).toEqual([1, 2]);
  });
});
