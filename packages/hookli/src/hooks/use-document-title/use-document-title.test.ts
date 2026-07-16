import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useDocumentTitle } from "./use-document-title";

describe("useDocumentTitle", () => {
  afterEach(() => {
    document.title = "";
  });

  it("sets the document title", () => {
    renderHook(() => useDocumentTitle("Hello"));

    expect(document.title).toBe("Hello");
  });

  it("updates the title when it changes", () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: "First" },
    });
    expect(document.title).toBe("First");

    rerender({ title: "Second" });
    expect(document.title).toBe("Second");
  });

  it("preserves the title on unmount by default", () => {
    const { unmount } = renderHook(() => useDocumentTitle("Kept"));

    unmount();
    expect(document.title).toBe("Kept");
  });

  it("restores the previous title on unmount when preserveTitleOnUnmount is false", () => {
    document.title = "Original";
    const { unmount } = renderHook(() =>
      useDocumentTitle("Temporary", { preserveTitleOnUnmount: false }),
    );
    expect(document.title).toBe("Temporary");

    unmount();
    expect(document.title).toBe("Original");
  });
});
