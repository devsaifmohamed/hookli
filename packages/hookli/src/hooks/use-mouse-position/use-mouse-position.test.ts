import { renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { describe, expect, it } from "vitest";
import { useMousePosition } from "./use-mouse-position";
import { expectSSRSafe } from "../../test-utils/ssr";

describe("useMousePosition", () => {
  it("starts with null coordinates", () => {
    const el = document.createElement("div");
    const ref = { current: el } as RefObject<HTMLDivElement>;
    const { result } = renderHook(() => useMousePosition(ref));
    expect(result.current).toEqual({ x: null, y: null });
  });
});

describe("useMousePosition on the server", () => {
  it("renders without browser globals", async () => {
    await expectSSRSafe("useMousePosition", { current: null });
  });
});
