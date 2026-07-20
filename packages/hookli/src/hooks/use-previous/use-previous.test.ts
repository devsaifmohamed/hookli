import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePrevious } from "./use-previous";

describe("usePrevious", () => {
  it("is undefined on the first render", () => {
    const { result } = renderHook(() => usePrevious(0));
    expect(result.current).toBeUndefined();
  });

  it("returns the value from the previous render", () => {
    const { result, rerender } = renderHook(({ v }) => usePrevious(v), {
      initialProps: { v: 0 },
    });
    rerender({ v: 1 });
    expect(result.current).toBe(0);
    rerender({ v: 2 });
    expect(result.current).toBe(1);
  });
});
