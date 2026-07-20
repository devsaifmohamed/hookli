import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useEffectOnce } from "./use-effect-once";

describe("useEffectOnce", () => {
  it("runs once on mount and not on re-render", () => {
    const effect = vi.fn();
    const { rerender } = renderHook(() => useEffectOnce(effect));
    rerender();
    rerender();
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it("runs the cleanup on unmount", () => {
    const cleanup = vi.fn();
    const { unmount } = renderHook(() => useEffectOnce(() => cleanup));
    expect(cleanup).not.toHaveBeenCalled();
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
