import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUnmount } from "./use-unmount";

describe("useUnmount", () => {
  it("does not call the function before unmount", () => {
    const fn = vi.fn();
    const { rerender } = renderHook(() => useUnmount(fn));

    rerender();
    expect(fn).not.toHaveBeenCalled();
  });

  it("calls the function once on unmount", () => {
    const fn = vi.fn();
    const { unmount } = renderHook(() => useUnmount(fn));

    unmount();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("calls the latest function on unmount", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender, unmount } = renderHook(({ fn }) => useUnmount(fn), {
      initialProps: { fn: first },
    });

    rerender({ fn: second });
    unmount();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
