import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useGeoLocation } from "./use-geo-location";
import { expectSSRSafe } from "../../test-utils/ssr";

describe("useGeoLocation", () => {
  it("starts with no location and never crashes when geolocation is unavailable", () => {
    const { result } = renderHook(() => useGeoLocation());
    expect(result.current.location).toBeNull();
    expect(result.current).toHaveProperty("error");
  });
});

describe("useGeoLocation on the server", () => {
  it("renders without browser globals", async () => {
    await expectSSRSafe("useGeoLocation");
  });
});
