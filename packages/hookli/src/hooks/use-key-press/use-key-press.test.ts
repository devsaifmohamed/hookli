import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useKeyPress } from "./use-key-press";

describe("useKeyPress", () => {
  it("is false initially", () => {
    const { result } = renderHook(() => useKeyPress("a"));
    expect(result.current).toBe(false);
  });

  it("tracks keydown / keyup for the target key", () => {
    const { result } = renderHook(() => useKeyPress("a"));

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    });
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keyup", { key: "a" }));
    });
    expect(result.current).toBe(false);
  });

  it("ignores other keys", () => {
    const { result } = renderHook(() => useKeyPress("a"));
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));
    });
    expect(result.current).toBe(false);
  });
});
