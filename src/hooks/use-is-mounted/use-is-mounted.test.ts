import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useIsMounted } from "./use-is-mounted";

describe("useIsMounted", () => {
  it("reports mounted after render", () => {
    const { result } = renderHook(() => useIsMounted());

    expect(result.current()).toBe(true);
  });

  it("reports not mounted after unmount", () => {
    const { result, unmount } = renderHook(() => useIsMounted());

    unmount();
    expect(result.current()).toBe(false);
  });

  it("returns a stable getter across rerenders", () => {
    const { result, rerender } = renderHook(() => useIsMounted());
    const first = result.current;

    rerender();
    expect(result.current).toBe(first);
  });
});
