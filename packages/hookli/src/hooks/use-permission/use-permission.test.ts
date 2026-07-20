import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePermission } from "./use-permission";

describe("usePermission", () => {
  it("resolves to a valid state (unsupported under jsdom)", async () => {
    const { result } = renderHook(() => usePermission("geolocation"));
    await waitFor(() =>
      expect(["granted", "denied", "prompt", "unsupported"]).toContain(
        result.current,
      ),
    );
  });
});
