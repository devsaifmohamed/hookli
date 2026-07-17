import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useExpandableText } from "./use-expandable-text";

const LONG = "The quick brown fox jumps over the lazy dog again and again";

describe("useExpandableText", () => {
  it("returns the full text and is not truncated with no limits", () => {
    const { result } = renderHook(() => useExpandableText(LONG));
    expect(result.current.text).toBe(LONG);
    expect(result.current.isTruncated).toBe(false);
  });

  it("caps to maxChars on a word boundary and appends the ellipsis", () => {
    const { result } = renderHook(() => useExpandableText(LONG, { maxChars: 20 }));
    // 20 chars lands mid-word ("The quick brown fox "); backs off to "fox".
    expect(result.current.text).toBe("The quick brown fox…");
    expect(result.current.isTruncated).toBe(true);
    expect(result.current.isExpanded).toBe(false);
  });

  it("does not truncate when the text fits the character budget", () => {
    const { result } = renderHook(() =>
      useExpandableText("short", { maxChars: 20 }),
    );
    expect(result.current.text).toBe("short");
    expect(result.current.isTruncated).toBe(false);
  });

  it("honours a custom ellipsis", () => {
    const { result } = renderHook(() =>
      useExpandableText(LONG, { maxChars: 20, ellipsis: " [more]" }),
    );
    expect(result.current.text).toBe("The quick brown fox [more]");
  });

  it("toggle/expand/collapse reveal and re-hide the full text", () => {
    const { result } = renderHook(() => useExpandableText(LONG, { maxChars: 20 }));

    act(() => result.current.toggle());
    expect(result.current.isExpanded).toBe(true);
    expect(result.current.text).toBe(LONG);

    act(() => result.current.collapse());
    expect(result.current.isExpanded).toBe(false);
    expect(result.current.text).toBe("The quick brown fox…");

    act(() => result.current.expand());
    expect(result.current.isExpanded).toBe(true);
    expect(result.current.text).toBe(LONG);
  });

  it("respects defaultExpanded", () => {
    const { result } = renderHook(() =>
      useExpandableText(LONG, { maxChars: 20, defaultExpanded: true }),
    );
    expect(result.current.isExpanded).toBe(true);
    expect(result.current.text).toBe(LONG);
    // still reports truncation so the "show less" control stays visible
    expect(result.current.isTruncated).toBe(true);
  });

  it("applies the line-clamp style only while collapsed with maxLines set", () => {
    const { result } = renderHook(() =>
      useExpandableText(LONG, { maxLines: 3 }),
    );
    expect(result.current.clampStyle.WebkitLineClamp).toBe(3);
    expect(result.current.clampStyle.overflow).toBe("hidden");

    act(() => result.current.expand());
    expect(result.current.clampStyle.WebkitLineClamp).toBeUndefined();
  });

  // NOTE: line-based truncation detection relies on real layout (scrollHeight /
  // getComputedStyle line-height), which jsdom does not compute — so isTruncated
  // via `maxLines` is exercised in the browser demo, not here.
});
