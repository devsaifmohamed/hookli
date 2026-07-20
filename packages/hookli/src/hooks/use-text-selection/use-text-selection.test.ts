import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTextSelection } from "./use-text-selection";

describe("useTextSelection", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useTextSelection());
    expect(result.current).toBe("");
  });
});
