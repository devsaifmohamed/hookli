import { act, renderHook } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { useHover } from "./use-hover";

const refTo = (el: HTMLElement) => {
  const ref = createRef<HTMLDivElement>();
  Object.defineProperty(ref, "current", { value: el, writable: true });
  return ref;
};

describe("useHover", () => {
  it("starts unhovered", () => {
    const el = document.createElement("div");
    const { result } = renderHook(() => useHover(refTo(el)));
    expect(result.current).toBe(false);
  });

  it("becomes true on mouseenter and false on mouseleave", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const ref = refTo(el);

    const { result } = renderHook(() => useHover(ref));

    act(() => el.dispatchEvent(new MouseEvent("mouseenter")));
    expect(result.current).toBe(true);

    act(() => el.dispatchEvent(new MouseEvent("mouseleave")));
    expect(result.current).toBe(false);

    document.body.removeChild(el);
  });

  it("stops responding after unmount", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const ref = refTo(el);

    const { result, unmount } = renderHook(() => useHover(ref));
    unmount();

    act(() => el.dispatchEvent(new MouseEvent("mouseenter")));
    expect(result.current).toBe(false);

    document.body.removeChild(el);
  });
});
