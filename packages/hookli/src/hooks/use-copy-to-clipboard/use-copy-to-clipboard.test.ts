import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCopyToClipboard } from "./use-copy-to-clipboard";

let writeText: ReturnType<typeof vi.fn>;

beforeEach(() => {
  writeText = vi.fn(() => Promise.resolve());
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useCopyToClipboard", () => {
  it("starts with no copied text", () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current[0]).toBeNull();
  });

  it("writes to the clipboard and tracks the copied value", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    let ok = false;
    await act(async () => {
      ok = await result.current[1]("hello");
    });

    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
    expect(result.current[0]).toBe("hello");
  });

  it("returns false and clears the value when the write rejects", async () => {
    writeText.mockRejectedValueOnce(new Error("denied"));
    const { result } = renderHook(() => useCopyToClipboard());

    let ok = true;
    await act(async () => {
      ok = await result.current[1]("boom");
    });

    expect(ok).toBe(false);
    expect(result.current[0]).toBeNull();
  });

  it("returns false when the Clipboard API is unavailable", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
      writable: true,
    });
    const { result } = renderHook(() => useCopyToClipboard());

    let ok = true;
    await act(async () => {
      ok = await result.current[1]("nope");
    });

    expect(ok).toBe(false);
    expect(result.current[0]).toBeNull();
  });
});
