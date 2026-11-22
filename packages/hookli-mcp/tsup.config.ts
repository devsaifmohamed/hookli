import fs from "node:fs";
import { defineConfig } from "tsup";

// The server bundles the library's catalog, which the library build writes.
if (!fs.existsSync(new URL("../hookli/generated/catalog.json", import.meta.url))) {
  throw new Error("hookli-mcp: ../hookli/generated/catalog.json is missing. Run `pnpm --filter hookli build` first.");
}

export default defineConfig({
  entry: {
    index: "src/index.ts",
    cli: "src/cli.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  banner: ({ entry }) => {
    if (entry === "cli") {
      return { js: "#!/usr/bin/env node\n" };
    }
    return {};
  },
});
