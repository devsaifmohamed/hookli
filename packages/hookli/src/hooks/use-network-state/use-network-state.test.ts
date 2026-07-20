import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNetworkState } from "./use-network-state";

describe("useNetworkState", () => {
  afterEach(() => vi.restoreAllMocks());

  it("reports the current online status", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    const { result } = renderHook(() => useNetworkState());
    expect(result.current.online).toBe(true);
  });

  it("updates when the browser goes offline", () => {
    const spy = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    const { result } = renderHook(() => useNetworkState());
    expect(result.current.online).toBe(true);

    act(() => {
      spy.mockReturnValue(false);
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current.online).toBe(false);
  });
});
