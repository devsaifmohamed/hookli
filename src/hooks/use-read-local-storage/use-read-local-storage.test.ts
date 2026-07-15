import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useReadLocalStorage } from "./use-read-local-storage";

describe("useReadLocalStorage", () => {
  beforeEach(() => localStorage.clear());

  it("returns null when the key is absent", () => {
    const { result } = renderHook(() => useReadLocalStorage("missing"));
    expect(result.current).toBeNull();
  });

  it("reads and parses an existing value on mount", () => {
    localStorage.setItem("k", JSON.stringify({ a: 1 }));
    const { result } = renderHook(() =>
      useReadLocalStorage<{ a: number }>("k"),
    );
    expect(result.current).toEqual({ a: 1 });
  });

  it("reacts to a local-storage custom event in this tab", () => {
    const { result } = renderHook(() => useReadLocalStorage<number>("n"));
    expect(result.current).toBeNull();

    act(() => {
      localStorage.setItem("n", JSON.stringify(5));
      window.dispatchEvent(new StorageEvent("local-storage", { key: "n" }));
    });
    expect(result.current).toBe(5);
  });

  it("reacts to a cross-tab storage event", () => {
    const { result } = renderHook(() => useReadLocalStorage<string>("s"));

    act(() => {
      localStorage.setItem("s", JSON.stringify("hi"));
      window.dispatchEvent(new StorageEvent("storage", { key: "s" }));
    });
    expect(result.current).toBe("hi");
  });

  it("ignores storage events for other keys", () => {
    localStorage.setItem("k", JSON.stringify("keep"));
    const { result } = renderHook(() => useReadLocalStorage<string>("k"));
    expect(result.current).toBe("keep");

    act(() => {
      localStorage.setItem("other", JSON.stringify("noise"));
      window.dispatchEvent(new StorageEvent("storage", { key: "other" }));
    });
    expect(result.current).toBe("keep");
  });
});
