import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useScreen } from "./use-screen";

describe("useScreen", () => {
  it("returns the window screen synchronously", () => {
    const { result } = renderHook(() => useScreen());
    expect(result.current).toBe(window.screen);
  });

  it("starts null when initializeWithValue is false, then hydrates", () => {
    const { result } = renderHook(() =>
      useScreen({ initializeWithValue: false }),
    );
    // The layout effect runs after mount and fills in the real screen.
    expect(result.current).toBe(window.screen);
  });

  it("refreshes the screen on window resize", () => {
    const { result } = renderHook(() => useScreen());

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(window.screen);
  });
});
