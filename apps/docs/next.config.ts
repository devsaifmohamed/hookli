import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/* A deprecated alias (for example useDefault) has no page of its own: its URL redirects
   to the hook it points to. The aliases come from the library's catalog, which the
   library build writes before the docs build (turbo ^build). */
const catalogPath = path.join(__dirname, "../../packages/hookli/generated/catalog.json");
if (!fs.existsSync(catalogPath)) throw new Error("hookli-docs: packages/hookli/generated/catalog.json is missing. Run `pnpm --filter hookli build` first.");
const { hooks } = JSON.parse(fs.readFileSync(catalogPath, "utf8")) as {
  hooks: Array<{ slug: string; aliases: Array<{ slug: string }> }>;
};

const nextConfig: NextConfig = {
  async redirects() {
    return hooks.flatMap((hook) =>
      hook.aliases.map((alias) => ({ source: `/docs/${alias.slug}`, destination: `/docs/${hook.slug}`, permanent: true })),
    );
  },
};

export default nextConfig;
