import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useEventCallback } from "./use-event-callback";

describe("useEventCallback", () => {
  it("keeps a stable identity across renders", () => {
    const { result, rerender } = renderHook(({ fn }) => useEventCallback(fn), {
      initialProps: { fn: () => 1 },
    });

    const first = result.current;
    rerender({ fn: () => 2 });
    expect(result.current).toBe(first);
  });

  it("always calls the latest function", () => {
    const { result, rerender } = renderHook(({ fn }) => useEventCallback(fn), {
      initialProps: { fn: () => "a" },
    });

    expect(result.current()).toBe("a");

    rerender({ fn: () => "b" });
    expect(result.current()).toBe("b");
  });

  it("forwards arguments and returns the result", () => {
    const { result } = renderHook(() =>
      useEventCallback((a: number, b: number) => a + b),
    );

    expect(result.current(2, 3)).toBe(5);
  });
});
