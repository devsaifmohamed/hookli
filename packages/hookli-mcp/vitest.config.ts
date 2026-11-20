import { defineConfig } from "vitest/config";

// `pnpm test` runs the fast in-process suite. The packed-package test
// (`*.e2e.test.ts`) needs a fresh build and network, so it has its own script:
// `pnpm run test:package`.
export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    exclude: ["test/**/*.e2e.test.ts", "**/node_modules/**"],
  },
});
