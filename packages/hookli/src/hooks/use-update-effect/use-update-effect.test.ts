import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUpdateEffect } from "./use-update-effect";

describe("useUpdateEffect", () => {
  it("does not run on the first render", () => {
    const effect = vi.fn();
    renderHook(() => useUpdateEffect(effect, [0]));
    expect(effect).not.toHaveBeenCalled();
  });

  it("runs on dependency updates", () => {
    const effect = vi.fn();
    const { rerender } = renderHook(({ dep }) => useUpdateEffect(effect, [dep]), {
      initialProps: { dep: 0 },
    });
    expect(effect).not.toHaveBeenCalled();
    rerender({ dep: 1 });
    expect(effect).toHaveBeenCalledTimes(1);
    rerender({ dep: 2 });
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it("runs the cleanup from the previous run and on unmount", () => {
    const cleanup = vi.fn();
    const effect = vi.fn(() => cleanup);
    const { rerender, unmount } = renderHook(
      ({ dep }) => useUpdateEffect(effect, [dep]),
      { initialProps: { dep: 0 } },
    );
    rerender({ dep: 1 });
    rerender({ dep: 2 });
    expect(cleanup).toHaveBeenCalledTimes(1);
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(2);
  });
});
