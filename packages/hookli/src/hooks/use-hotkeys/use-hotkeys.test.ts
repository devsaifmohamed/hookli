import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useHotkeys } from "./use-hotkeys";

describe("useHotkeys", () => {
  it("fires on the matching combo", () => {
    const cb = vi.fn();
    renderHook(() => useHotkeys("ctrl+k", cb));
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("ignores the key without its modifier", () => {
    const cb = vi.fn();
    renderHook(() => useHotkeys("ctrl+k", cb));
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k" }));
    });
    expect(cb).not.toHaveBeenCalled();
  });

  it("matches a single key", () => {
    const cb = vi.fn();
    renderHook(() => useHotkeys("Escape", cb));
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
