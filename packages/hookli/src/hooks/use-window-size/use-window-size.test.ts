import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useWindowSize } from "./use-window-size";

const setSize = (width: number, height: number) => {
  Object.defineProperty(window, "innerWidth", {
    value: width,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, "innerHeight", {
    value: height,
    configurable: true,
    writable: true,
  });
};

const resize = (width: number, height: number) => {
  setSize(width, height);
  act(() => {
    window.dispatchEvent(new Event("resize"));
  });
};

afterEach(() => {
  setSize(1024, 768);
});

describe("useWindowSize", () => {
  it("reads the initial size synchronously", () => {
    setSize(800, 600);
    const { result } = renderHook(() => useWindowSize());
    expect(result.current).toEqual({ width: 800, height: 600 });
  });

  it("starts at zero when initializeWithValue is false, then hydrates", () => {
    setSize(500, 400);
    const { result } = renderHook(() =>
      useWindowSize({ initializeWithValue: false }),
    );
    // The layout effect runs after mount and fills in the real size.
    expect(result.current).toEqual({ width: 500, height: 400 });
  });

  it("updates on window resize", () => {
    setSize(300, 200);
    const { result } = renderHook(() => useWindowSize());
    expect(result.current).toEqual({ width: 300, height: 200 });

    resize(640, 480);
    expect(result.current).toEqual({ width: 640, height: 480 });
  });
});
