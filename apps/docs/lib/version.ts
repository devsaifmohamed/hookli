import hookliPackage from "hookli/package.json";

/* The workspace library's version, so the docs never show a stale release number.
   Kept out of site.ts so client chunks that only need URLs don't bundle package.json. */
export const HOOKLI_VERSION: string = hookliPackage.version;
