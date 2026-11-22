// Builds packages/hookli-mcp/src/data/catalog.json (+ meta.json) from the library:
// hook list + keywords from hooks.manifest.json, sources from packages/hookli/src,
// API tables + usage from apps/docs/lib/hook-docs.ts. Run from anywhere:
//   node scripts/build-mcp-catalog.mjs          (also runs as hookli-mcp `prebuild`)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "packages/hookli/hooks.manifest.json");
const libraryPkgPath = path.join(root, "packages/hookli/package.json");
const hookDocsPath = path.join(root, "apps/docs/lib/hook-docs.ts");
const outputPath = path.join(root, "packages/hookli-mcp/src/data/catalog.json");
const metaPath = path.join(root, "packages/hookli-mcp/src/data/meta.json");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
const libraryVersion = JSON.parse(fs.readFileSync(libraryPkgPath, "utf-8")).version;
const mcpVersion = JSON.parse(fs.readFileSync(path.join(root, "packages/hookli-mcp/package.json"), "utf-8")).version;

// 1. Parse hook-docs.ts
let docsCode = fs.readFileSync(hookDocsPath, "utf-8");
// Remove the file's own imports. Only the header is touched: the code snippets
// inside `usage` and `examples` strings keep their import lines.
const header = docsCode.match(/^(?:import[^;]*;\s*)+/);
if (header) docsCode = docsCode.slice(header[0].length);
// Remove type definitions
docsCode = docsCode.replace(/export\s+type\s+\w+\s*=\s*\{[\s\S]*?\n\};\s*/g, "");
// Strip type annotations on consts
docsCode = docsCode.replace(/:\s*TypeAlias\s*=/g, " =");
docsCode = docsCode.replace(/export\s+const\s+HOOK_DOCS[^=]*=/g, "const HOOK_DOCS =");
docsCode = docsCode.replace(/const\s+HOOK_DOCS[^=]*=/g, "const HOOK_DOCS =");
// Replace demo component references
docsCode = docsCode.replace(/demo:\s*[^,]+,/g, "demo: null,");
docsCode = docsCode.replace(/export\s+function\s+getHookDoc[^{]+{[\s\S]*}/, "");
docsCode += "\nmodule.exports = { HOOK_DOCS };";

const docsSandbox = { module: {}, exports: {} };
vm.runInNewContext(docsCode, docsSandbox);
const hookDocs = docsSandbox.module.exports.HOOK_DOCS || {};
console.log("Loaded docs for hooks:", Object.keys(hookDocs).length);

// 2. Read hook sources from packages/hookli/src/hooks/
function getHookSource(slug) {
  const primaryPath = path.join(root, `packages/hookli/src/hooks/${slug}/${slug}.ts`);
  if (fs.existsSync(primaryPath)) {
    return {
      path: `packages/hookli/src/hooks/${slug}/${slug}.ts`,
      source: fs.readFileSync(primaryPath, "utf-8"),
    };
  }
  const altPath = path.join(root, `packages/hookli/src/hooks/${slug}/index.ts`);
  if (fs.existsSync(altPath)) {
    return {
      path: `packages/hookli/src/hooks/${slug}/index.ts`,
      source: fs.readFileSync(altPath, "utf-8"),
    };
  }
  return { path: "", source: "" };
}

// Assemble full catalog
let sourcesFound = 0;
const catalog = manifest.hooks.map((entry) => {
  const doc = hookDocs[entry.slug] || {};
  const src = getHookSource(entry.slug);
  if (src.source) sourcesFound++;

  return {
    slug: entry.slug,
    name: entry.name,
    description: entry.description,
    category: entry.category,
    signature: entry.signature,
    parameters: (doc.parameters || []).map(p => ({
      name: p.name,
      type: p.type,
      defaultValue: p.defaultValue || null,
      description: p.description,
    })),
    returns: (doc.returns || []).map(r => ({
      name: r.name,
      type: r.type,
      description: r.description,
    })),
    typeAliases: (doc.typeAliases || []).map(t => ({
      name: t.name,
      description: t.description || null,
      rows: (t.rows || []).map(row => ({
        name: row.name,
        type: row.type,
        defaultValue: row.defaultValue || null,
        description: row.description,
      })),
    })),
    usage: (doc.usage || "").trim(),
    examples: (doc.examples || []).map((e) => ({ title: e.title, description: e.description || null, code: e.code.trim() })),
    source: (src.source || "").trim(),
    sourcePath: src.path || `packages/hookli/src/hooks/${entry.slug}/${entry.slug}.ts`,
    docsUrl: `https://hookli.vercel.app/docs/${entry.slug}`,
    keywords: entry.keywords ?? [],
  };
});

const missingSource = catalog.filter((h) => !h.source).map((h) => h.slug);
const missingKeywords = catalog.filter((h) => h.keywords.length === 0).map((h) => h.slug);
if (missingSource.length || missingKeywords.length) {
  console.error(`Catalog incomplete. No source: [${missingSource}]. No keywords in hooks.manifest.json: [${missingKeywords}].`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
// Unchanged files keep their mtime, so a later run doesn't make dist look stale (test:package).
const writeIfChanged = (file, text) => {
  if (!fs.existsSync(file) || fs.readFileSync(file, "utf-8") !== text) fs.writeFileSync(file, text, "utf-8");
};
writeIfChanged(outputPath, JSON.stringify(catalog, null, 2) + "\n");
writeIfChanged(metaPath, JSON.stringify({ libraryVersion, mcpVersion, hookCount: catalog.length }, null, 2) + "\n");

console.log(`MCP catalog: ${catalog.length} hooks, hookli ${libraryVersion}, source for ${sourcesFound}/${catalog.length}.`);
