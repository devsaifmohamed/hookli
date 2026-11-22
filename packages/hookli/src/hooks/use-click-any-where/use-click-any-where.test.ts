import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useClickAnyWhere } from "./use-click-any-where";
import { expectSSRSafe } from "../../test-utils/ssr";

describe("useClickAnyWhere", () => {
  it("fires on a document-wide click", () => {
    const handler = vi.fn();
    renderHook(() => useClickAnyWhere(handler));

    window.dispatchEvent(new MouseEvent("click"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("passes the mouse event through", () => {
    const handler = vi.fn();
    renderHook(() => useClickAnyWhere(handler));

    const event = new MouseEvent("click");
    window.dispatchEvent(event);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it("stops firing after unmount", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useClickAnyWhere(handler));

    unmount();
    window.dispatchEvent(new MouseEvent("click"));
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("useClickAnyWhere on the server", () => {
  it("renders without browser globals", async () => {
    await expectSSRSafe("useClickAnyWhere", () => {});
  });
});
