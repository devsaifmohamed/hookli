import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useScript } from "./use-script";

const SRC = "https://example.com/lib.js";

afterEach(() => {
  document.querySelectorAll("script").forEach((el) => el.remove());
});

const fireOn = (src: string, type: "load" | "error") => {
  const script = document.querySelector<HTMLScriptElement>(
    `script[src="${src}"]`,
  );
  act(() => {
    script?.dispatchEvent(new Event(type));
  });
};

describe("useScript", () => {
  it("is idle for a null src and appends nothing", () => {
    const { result } = renderHook(() => useScript(null));
    expect(result.current).toBe("idle");
    expect(document.querySelector(`script[src="${SRC}"]`)).toBeNull();
  });

  it("is idle when shouldPreventLoad is set", () => {
    const { result } = renderHook(() =>
      useScript(SRC, { shouldPreventLoad: true }),
    );
    expect(result.current).toBe("idle");
    expect(document.querySelector(`script[src="${SRC}"]`)).toBeNull();
  });

  it("injects the script and starts loading", () => {
    const { result } = renderHook(() => useScript(SRC));
    expect(result.current).toBe("loading");
    expect(document.querySelector(`script[src="${SRC}"]`)).not.toBeNull();
  });

  it("transitions to ready on load", () => {
    const { result } = renderHook(() => useScript(SRC));
    fireOn(SRC, "load");
    expect(result.current).toBe("ready");
  });

  it("transitions to error on error", () => {
    const { result } = renderHook(() => useScript(SRC));
    fireOn(SRC, "error");
    expect(result.current).toBe("error");
  });

  it("reuses an existing script tag instead of duplicating it", () => {
    renderHook(() => useScript(SRC));
    renderHook(() => useScript(SRC));
    expect(document.querySelectorAll(`script[src="${SRC}"]`).length).toBe(1);
  });

  it("removes the script on unmount when removeOnUnmount is set", () => {
    const { unmount } = renderHook(() =>
      useScript(SRC, { removeOnUnmount: true }),
    );
    expect(document.querySelector(`script[src="${SRC}"]`)).not.toBeNull();
    unmount();
    expect(document.querySelector(`script[src="${SRC}"]`)).toBeNull();
  });
});
