import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useInfiniteScroll } from "./use-infinite-scroll";

describe("useInfiniteScroll", () => {
  it("is idle until the page nears the bottom", () => {
    const load = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useInfiniteScroll(load));
    expect(result.current).toBe(false);
    expect(load).not.toHaveBeenCalled();
  });
});
