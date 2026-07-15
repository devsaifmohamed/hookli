import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useScrollLock } from "./use-scroll-lock";

afterEach(() => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
});

describe("useScrollLock", () => {
  it("locks the body on mount by default", () => {
    const { result } = renderHook(() => useScrollLock());
    expect(result.current.isLocked).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores the original overflow on unmount", () => {
    document.body.style.overflow = "scroll";
    const { unmount } = renderHook(() => useScrollLock());
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("does not lock on mount when autoLock is false", () => {
    const { result } = renderHook(() => useScrollLock({ autoLock: false }));
    expect(result.current.isLocked).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("locks and unlocks manually", () => {
    const { result } = renderHook(() => useScrollLock({ autoLock: false }));

    act(() => result.current.lock());
    expect(result.current.isLocked).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");

    act(() => result.current.unlock());
    expect(result.current.isLocked).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("locks a custom target element", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);

    const { result } = renderHook(() =>
      useScrollLock({ autoLock: false, lockTarget: el }),
    );
    act(() => result.current.lock());
    expect(el.style.overflow).toBe("hidden");

    act(() => result.current.unlock());
    expect(el.style.overflow).toBe("");

    document.body.removeChild(el);
  });
});
