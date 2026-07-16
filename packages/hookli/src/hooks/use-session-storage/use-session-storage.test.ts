import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useSessionStorage } from "./use-session-storage";

describe("useSessionStorage", () => {
  beforeEach(() => sessionStorage.clear());

  it("returns the initial value when the key is absent", () => {
    const { result } = renderHook(() => useSessionStorage("k", "init"));
    expect(result.current[0]).toBe("init");
  });

  it("reads an existing value from sessionStorage on mount", () => {
    sessionStorage.setItem("k", JSON.stringify("stored"));
    const { result } = renderHook(() => useSessionStorage("k", "init"));
    expect(result.current[0]).toBe("stored");
  });

  it("persists updates and accepts an updater function", () => {
    const { result } = renderHook(() => useSessionStorage("count", 1));

    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(JSON.parse(sessionStorage.getItem("count") as string)).toBe(2);

    act(() => result.current[1]((prev) => prev + 10));
    expect(result.current[0]).toBe(12);
    expect(JSON.parse(sessionStorage.getItem("count") as string)).toBe(12);
  });

  it("removeValue clears storage and resets to the initial value", () => {
    const { result } = renderHook(() => useSessionStorage("k", "init"));

    act(() => result.current[1]("changed"));
    expect(result.current[0]).toBe("changed");

    act(() => result.current[2]());
    expect(result.current[0]).toBe("init");
    expect(sessionStorage.getItem("k")).toBeNull();
  });

  it("syncs when another hook writes the same key in this tab", () => {
    const { result: a } = renderHook(() => useSessionStorage("shared", 0));
    const { result: b } = renderHook(() => useSessionStorage("shared", 0));

    act(() => a.current[1](42));
    expect(b.current[0]).toBe(42);
  });

  it("supports a factory initial value", () => {
    const { result } = renderHook(() =>
      useSessionStorage("k", () => ["a", "b"]),
    );
    expect(result.current[0]).toEqual(["a", "b"]);
  });
});
