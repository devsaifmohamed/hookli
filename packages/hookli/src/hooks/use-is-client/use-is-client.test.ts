import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useIsClient } from "./use-is-client";
import { expectSSRSafe } from "../../test-utils/ssr";

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

describe("useIsClient on the server", () => {
  it("renders without browser globals", async () => {
    await expectSSRSafe("useIsClient");
  });
});
