import { renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { describe, expect, it } from "vitest";
import { useMousePosition } from "./use-mouse-position";

describe("useMousePosition", () => {
  it("starts with null coordinates", () => {
    const el = document.createElement("div");
    const ref = { current: el } as RefObject<HTMLDivElement>;
    const { result } = renderHook(() => useMousePosition(ref));
    expect(result.current).toEqual({ x: null, y: null });
  });
});
