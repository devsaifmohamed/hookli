import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useIsClient } from "./use-is-client";

describe("useIsClient", () => {
  it("is true after mount in a DOM environment", () => {
    const { result } = renderHook(() => useIsClient());

    expect(result.current).toBe(true);
  });

  it("stays true across rerenders", () => {
    const { result, rerender } = renderHook(() => useIsClient());

    rerender();
    expect(result.current).toBe(true);
  });
});
