import { fireEvent, renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { describe, expect, it, vi } from "vitest";
import { useClickOutside } from "./use-click-outside";

describe("useClickOutside", () => {
  it("fires only when the click is outside the ref", () => {
    const inside = document.createElement("div");
    document.body.appendChild(inside);
    const ref = { current: inside } as RefObject<HTMLDivElement>;
    const cb = vi.fn();

    renderHook(() => useClickOutside(ref, cb));

    fireEvent.mouseDown(inside);
    expect(cb).not.toHaveBeenCalled();

    fireEvent.mouseDown(document.body);
    expect(cb).toHaveBeenCalledTimes(1);

    document.body.removeChild(inside);
  });
});
