import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFullscreen } from "./use-fullscreen";

describe("useFullscreen", () => {
  it("defaults to not fullscreen and exposes controls", async () => {
    const ref = { current: document.createElement("div") };
    const { result } = renderHook(() => useFullscreen(ref));
    expect(result.current.isFullscreen).toBe(false);
    expect(typeof result.current.enter).toBe("function");
    expect(typeof result.current.toggle).toBe("function");
    // no-op where the Fullscreen API is unavailable (jsdom) — should not throw
    await act(async () => {
      await result.current.enter();
    });
  });
});
