import { useEffect, useLayoutEffect } from "react";
import { describe, expect, it } from "vitest";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";
import { expectSSRSafe } from "../../test-utils/ssr";

describe("useIsomorphicLayoutEffect", () => {
  it("uses useLayoutEffect in a DOM environment", () => {
    expect(typeof window).toBe("object");
    expect(useIsomorphicLayoutEffect).toBe(useLayoutEffect);
  });

  it("is one of React's effect hooks", () => {
    expect([useLayoutEffect, useEffect]).toContain(useIsomorphicLayoutEffect);
  });
});

describe("useIsomorphicLayoutEffect on the server", () => {
  it("renders without browser globals", async () => {
    await expectSSRSafe("useIsomorphicLayoutEffect", () => {}, []);
  });
});
