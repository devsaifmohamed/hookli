import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRafState } from "./use-raf-state";

describe("useRafState", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("updates state on the next frame", () => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});

    const { result } = renderHook(() => useRafState(0));
    expect(result.current[0]).toBe(0);
    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
  });
});
