/* Canonical origin for metadataBase, sitemap and robots. Placeholder until the
   human deploys — override with NEXT_PUBLIC_SITE_URL, no trailing slash. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://hookli.vercel.app";
export const GITHUB_URL = "https://github.com/saifmohamedsv/hookli";
export const NPM_URL = "https://www.npmjs.com/package/hookli";
export const TAGLINE =
  "Simple React hooks. Typed. SSR-safe. Zero dependencies.";
