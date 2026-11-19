import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG, CATALOG_META } from "../src/catalog.js";

/* The MCP promises agents current, real hookli code. These checks fail when the
   bundled catalog drifts from the library — run `node scripts/build-mcp-catalog.mjs`
   (it also runs on `pnpm --filter hookli-mcp build`). */
const root = path.resolve(__dirname, "../../..");
const lib = (p: string) => path.join(root, "packages/hookli", p);
const manifest = JSON.parse(fs.readFileSync(lib("hooks.manifest.json"), "utf8")) as {
  hooks: Array<{ name: string; slug: string; description: string; signature: string; keywords: string[] }>;
};

describe("bundled catalog matches the hookli library", () => {
  it("has exactly the manifest's hooks, in order, with the same docs fields", () => {
    expect(CATALOG.map((h) => h.name)).toEqual(manifest.hooks.map((h) => h.name));
    for (const [i, m] of manifest.hooks.entries()) {
      const c = CATALOG[i];
      expect({ slug: c.slug, description: c.description, signature: c.signature, keywords: c.keywords }).toEqual({
        slug: m.slug,
        description: m.description,
        signature: m.signature,
        keywords: m.keywords,
      });
    }
  });

  it("serves each hook's current source code, byte for byte", () => {
    const stale = CATALOG.filter((h) => {
      const file = lib(`src/hooks/${h.slug}/${h.slug}.ts`);
      return !fs.existsSync(file) || fs.readFileSync(file, "utf8").trim() !== h.source;
    }).map((h) => h.slug);
    expect(stale).toEqual([]);
  });

  it("reports the real library and server versions", () => {
    const libVersion = JSON.parse(fs.readFileSync(lib("package.json"), "utf8")).version;
    const mcpVersion = JSON.parse(fs.readFileSync(path.join(root, "packages/hookli-mcp/package.json"), "utf8")).version;
    expect(CATALOG_META).toEqual({ libraryVersion: libVersion, mcpVersion, hookCount: manifest.hooks.length });
  });

  it("every hook has curated search keywords", () => {
    expect(manifest.hooks.filter((h) => !h.keywords?.length).map((h) => h.name)).toEqual([]);
  });
});
