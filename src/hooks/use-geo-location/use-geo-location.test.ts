import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useGeoLocation } from "./use-geo-location";

describe("useGeoLocation", () => {
  it("starts with no location and never crashes when geolocation is unavailable", () => {
    const { result } = renderHook(() => useGeoLocation());
    expect(result.current.location).toBeNull();
    expect(result.current).toHaveProperty("error");
  });
});
