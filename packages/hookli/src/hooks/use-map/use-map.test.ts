import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useMap } from "./use-map";

describe("useMap", () => {
  it("starts empty by default", () => {
    const { result } = renderHook(() => useMap<string, number>());
    expect(result.current[0].size).toBe(0);
  });

  it("seeds from an array of entries", () => {
    const { result } = renderHook(() =>
      useMap<string, number>([
        ["a", 1],
        ["b", 2],
      ]),
    );
    expect(result.current[0].get("a")).toBe(1);
    expect(result.current[0].get("b")).toBe(2);
  });

  it("sets a key without mutating the previous map", () => {
    const { result } = renderHook(() => useMap<string, number>());
    const before = result.current[0];

    act(() => {
      result.current[1].set("x", 42);
    });

    expect(result.current[0].get("x")).toBe(42);
    expect(before.has("x")).toBe(false);
  });

  it("replaces all entries with setAll", () => {
    const { result } = renderHook(() => useMap<string, number>([["a", 1]]));

    act(() => {
      result.current[1].setAll([["b", 2]]);
    });

    expect(result.current[0].has("a")).toBe(false);
    expect(result.current[0].get("b")).toBe(2);
  });

  it("removes a single key", () => {
    const { result } = renderHook(() =>
      useMap<string, number>([
        ["a", 1],
        ["b", 2],
      ]),
    );

    act(() => {
      result.current[1].remove("a");
    });

    expect(result.current[0].has("a")).toBe(false);
    expect(result.current[0].get("b")).toBe(2);
  });

  it("resets to an empty map", () => {
    const { result } = renderHook(() => useMap<string, number>([["a", 1]]));

    act(() => {
      result.current[1].reset();
    });

    expect(result.current[0].size).toBe(0);
  });
});
