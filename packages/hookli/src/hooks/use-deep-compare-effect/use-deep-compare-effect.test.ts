import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDeepCompareEffect } from "./use-deep-compare-effect";

describe("useDeepCompareEffect", () => {
  it("runs on mount", () => {
    const effect = vi.fn();
    renderHook(() => useDeepCompareEffect(effect, [{ a: 1 }]));
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it("does not re-run for deeply-equal deps", () => {
    const effect = vi.fn();
    const { rerender } = renderHook(({ deps }) => useDeepCompareEffect(effect, deps), {
      initialProps: { deps: [{ a: 1 }] as unknown[] },
    });
    rerender({ deps: [{ a: 1 }] }); // new reference, same shape
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it("re-runs when deps deeply change", () => {
    const effect = vi.fn();
    const { rerender } = renderHook(({ deps }) => useDeepCompareEffect(effect, deps), {
      initialProps: { deps: [{ a: 1 }] as unknown[] },
    });
    rerender({ deps: [{ a: 2 }] });
    expect(effect).toHaveBeenCalledTimes(2);
  });
});
