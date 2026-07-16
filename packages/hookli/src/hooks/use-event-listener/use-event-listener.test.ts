import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useEventListener } from "./use-event-listener";

describe("useEventListener", () => {
  it("listens on window by default", () => {
    const handler = vi.fn();
    renderHook(() => useEventListener("resize", handler));

    window.dispatchEvent(new Event("resize"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("listens on an element ref", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, "current", { value: el, writable: true });

    const handler = vi.fn();
    renderHook(() => useEventListener("click", handler, ref));

    el.dispatchEvent(new MouseEvent("click"));
    expect(handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(el);
  });

  it("invokes the latest handler without re-subscribing", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ h }) => useEventListener("resize", h), {
      initialProps: { h: first },
    });

    rerender({ h: second });
    window.dispatchEvent(new Event("resize"));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("removes the listener on unmount", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useEventListener("resize", handler));

    unmount();
    window.dispatchEvent(new Event("resize"));
    expect(handler).not.toHaveBeenCalled();
  });
});
