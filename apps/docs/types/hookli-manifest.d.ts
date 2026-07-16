// Types for the library's `hookli/manifest` subpath export (a JSON file). Keeps the
// docs' registry import resolvable without relying on JSON-subpath type inference.
declare module "hookli/manifest" {
  const manifest: {
    hooks: Array<{
      slug: string;
      name: string;
      description: string;
      category: string;
      signature: string;
    }>;
  };
  export default manifest;
}
