import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePageVisibility } from "./use-page-visibility";

describe("usePageVisibility", () => {
  afterEach(() => vi.restoreAllMocks());

  it("is visible by default", () => {
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(true);
  });

  it("reacts to visibilitychange", () => {
    const { result } = renderHook(() => usePageVisibility());
    act(() => {
      vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe(false);
  });
});
