import { act, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNetworkState } from "./use-network-state";
import { expectSSRSafe } from "../../test-utils/ssr";

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

describe("useNetworkState on the server", () => {
  it("renders without browser globals", async () => {
    await expectSSRSafe("useNetworkState");
  });

  it("reports online where Node defines a navigator without onLine", async () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("navigator", { userAgent: "Node.js" });
    vi.resetModules();
    try {
      const { useNetworkState: serverHook } = await import("./use-network-state");
      let result: unknown;
      function Probe() {
        result = serverHook();
        return null;
      }
      renderToString(createElement(Probe));
      expect(result).toEqual({ online: true });
    } finally {
      vi.unstubAllGlobals();
      vi.resetModules();
    }
  });
});
