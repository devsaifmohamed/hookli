import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTextSelection } from "./use-text-selection";
import { expectSSRSafe } from "../../test-utils/ssr";

describe("useTextSelection", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useTextSelection());
    expect(result.current).toBe("");
  });
});

describe("useTextSelection on the server", () => {
  it("renders without browser globals", async () => {
    await expectSSRSafe("useTextSelection");
  });
});
