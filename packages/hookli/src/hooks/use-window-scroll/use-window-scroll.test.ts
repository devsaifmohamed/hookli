import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useWindowScroll } from "./use-window-scroll";

describe("useWindowScroll", () => {
  it("starts at the current scroll position", () => {
    const { result } = renderHook(() => useWindowScroll());
    expect(result.current).toEqual({ x: 0, y: 0 });
  });

  it("updates on scroll", () => {
    const { result } = renderHook(() => useWindowScroll());
    act(() => {
      Object.defineProperty(window, "scrollX", { value: 10, configurable: true });
      Object.defineProperty(window, "scrollY", { value: 20, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toEqual({ x: 10, y: 20 });
  });
});
