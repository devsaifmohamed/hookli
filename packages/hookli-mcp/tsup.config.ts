import { defineConfig } from "tsup";

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
