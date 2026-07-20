import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useBattery } from "./use-battery";

describe("useBattery", () => {
  it("reports unsupported when the Battery API is missing", () => {
    const { result } = renderHook(() => useBattery());
    expect(result.current.supported).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.level).toBeNull();
  });
});
