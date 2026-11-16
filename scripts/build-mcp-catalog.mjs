import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const manifestPath = path.resolve("packages/hookli/hooks.manifest.json");
const hookDocsPath = path.resolve("apps/docs/lib/hook-docs.ts");
const outputPath = path.resolve("packages/hookli-mcp/src/data/catalog.json");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

// 1. Parse hook-docs.ts
let docsCode = fs.readFileSync(hookDocsPath, "utf-8");
// Remove component imports & type imports
docsCode = docsCode.replace(/import\s+\{[^}]+\}\s+from\s+["'][^"']+["'];/g, "");
docsCode = docsCode.replace(/import\s+type\s+\{[^}]+\}\s+from\s+["'][^"']+["'];/g, "");
// Remove type definitions
docsCode = docsCode.replace(/export\s+type\s+TypeAlias\s*=\s*\{[\s\S]*?\};\s*/g, "");
docsCode = docsCode.replace(/export\s+type\s+HookDoc\s*=\s*\{[\s\S]*?\};\s*/g, "");
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
  const primaryPath = path.resolve(`packages/hookli/src/hooks/${slug}/${slug}.ts`);
  if (fs.existsSync(primaryPath)) {
    return {
      path: `packages/hookli/src/hooks/${slug}/${slug}.ts`,
      source: fs.readFileSync(primaryPath, "utf-8"),
    };
  }
  const altPath = path.resolve(`packages/hookli/src/hooks/${slug}/index.ts`);
  if (fs.existsSync(altPath)) {
    return {
      path: `packages/hookli/src/hooks/${slug}/index.ts`,
      source: fs.readFileSync(altPath, "utf-8"),
    };
  }
  return { path: "", source: "" };
}

// Tag generator for search & use-cases
function deriveUseCases(hook) {
  const name = hook.name.toLowerCase();
  const desc = hook.description.toLowerCase();
  const slug = hook.slug;
  const tags = new Set();

  tags.add(hook.category);
  tags.add(slug);
  tags.add(name);

  // Common intents & keywords
  if (name.includes("debounce") || name.includes("throttle")) {
    tags.add("rate limiting");
    tags.add("search input");
    tags.add("resize delay");
    tags.add("typing delay");
    tags.add("api optimization");
  }
  if (name.includes("storage")) {
    tags.add("persistence");
    tags.add("remember state");
    tags.add("offline data");
    tags.add("cache");
    tags.add("session");
  }
  if (name.includes("click") || name.includes("mouse") || name.includes("hover")) {
    tags.add("interaction");
    tags.add("dom events");
    tags.add("popover");
    tags.add("dropdown");
    tags.add("modal");
  }
  if (name.includes("hotkey") || name.includes("key")) {
    tags.add("shortcuts");
    tags.add("keyboard navigation");
    tags.add("accessibility");
  }
  if (name.includes("scroll") || name.includes("intersection")) {
    tags.add("lazy loading");
    tags.add("infinite list");
    tags.add("viewport");
    tags.add("visibility");
  }
  if (name.includes("dark") || name.includes("theme")) {
    tags.add("theme switching");
    tags.add("dark mode");
    tags.add("color mode");
  }
  if (name.includes("fetch") || name.includes("async") || name.includes("mutation")) {
    tags.add("data fetching");
    tags.add("api call");
    tags.add("server requests");
    tags.add("loading states");
  }
  if (name.includes("form") || name.includes("step") || name.includes("counter")) {
    tags.add("user input");
    tags.add("wizard");
    tags.add("state management");
  }
  if (name.includes("media") || name.includes("screen") || name.includes("window")) {
    tags.add("responsive");
    tags.add("mobile detection");
    tags.add("viewport size");
  }
  if (name.includes("clipboard")) {
    tags.add("copy paste");
    tags.add("share link");
  }

  const words = desc.replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(w => w.length > 3);
  for (const w of words) {
    tags.add(w);
  }

  return Array.from(tags);
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
    source: (src.source || "").trim(),
    sourcePath: src.path || `packages/hookli/src/hooks/${entry.slug}/${entry.slug}.ts`,
    docsUrl: `https://hookli.vercel.app/docs/${entry.slug}`,
    useCases: deriveUseCases(entry),
  };
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(catalog, null, 2), "utf-8");

console.log(`Successfully compiled catalog for ${catalog.length} hooks (found source for ${sourcesFound}/${catalog.length}) at: ${outputPath}`);
