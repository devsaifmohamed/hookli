import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useBattery } from "./use-battery";
import { expectSSRSafe } from "../../test-utils/ssr";

describe("useBattery", () => {
  it("reports unsupported when the Battery API is missing", () => {
    const { result } = renderHook(() => useBattery());
    expect(result.current.supported).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.level).toBeNull();
  });
});

describe("useBattery on the server", () => {
  it("renders without browser globals", async () => {
    await expectSSRSafe("useBattery");
  });
});
