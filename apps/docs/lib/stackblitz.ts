"use client";

import type { HookDoc } from "@/lib/hook-docs";
import type { HookEntry } from "@/lib/hooks-registry";

/* StackBlitz Project Definition (mirrors @stackblitz/sdk Project type) */
export interface StackBlitzProject {
  title: string;
  description: string;
  template: "node";
  files: Record<string, string>;
  dependencies?: Record<string, string>;
}

/**
 * Transforms a hookli doc usage snippet into a self-contained React App.tsx.
 * Handles the standard `export function Demo()` pattern as well as props-based components.
 */
function usageToAppTsx(usage: string): string {
  const code = usage.trim();

  // Standard case: Demo function
  if (/export\s+function\s+Demo\s*\(/.test(code)) {
    return code.replace(
      /export\s+function\s+Demo\s*\(/,
      "export default function App(",
    );
  }

  // Edge case: Review component (use-expandable-text)
  if (/export\s+function\s+Review\s*\(/.test(code)) {
    return `${code}\n\nexport default function App() {\n  return (\n    <div className="card">\n      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem", color: "#fff" }}>useExpandableText Playground</h2>\n      <Review body="hookli is a collection of typed, zero-dependency, SSR-safe React hooks for state, DOM, and data chores every modern React application repeats. This text demonstrates how to smoothly truncate and expand long content." />\n    </div>\n  );\n}\n`;
  }

  // Edge case: Modal component (use-scroll-lock)
  if (/export\s+function\s+Modal\s*\(/.test(code)) {
    return `import React, { useState } from "react";\n${code}\n\nexport default function App() {\n  const [open, setOpen] = useState(true);\n  return (\n    <div className="card">\n      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem", color: "#fff" }}>useScrollLock Playground</h2>\n      <p style={{ marginBottom: "1rem", color: "#94a3b8" }}>Scroll locking is active while modal is open.</p>\n      <button onClick={() => setOpen(!open)}>\n        {open ? "Close Modal" : "Open Modal"}\n      </button>\n      {open && <Modal onClose={() => setOpen(false)} />}\n    </div>\n  );\n}\n`;
  }

  // Fallback: If it already has export default
  if (/export\s+default\s+function/.test(code)) {
    return code;
  }

  // Fallback: Replace any exported function with App
  return code.replace(
    /export\s+function\s+[A-Za-z0-9_]+\s*\(/,
    "export default function App(",
  );
}

function makePackageJson(slug: string): string {
  return JSON.stringify(
    {
      name: `hookli-${slug}-playground`,
      private: true,
      version: "0.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc -b && vite build",
        preview: "vite preview",
      },
      dependencies: {
        react: "^19.0.0",
        "react-dom": "^19.0.0",
      },
      devDependencies: {
        "@types/react": "^19.0.0",
        "@types/react-dom": "^19.0.0",
        "@vitejs/plugin-react": "^4.3.4",
        typescript: "^5.6.3",
        vite: "^6.0.0",
      },
    },
    null,
    2,
  );
}

const VITE_CONFIG = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
`;

const TSCONFIG = JSON.stringify(
  {
    compilerOptions: {
      target: "ES2020",
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      isolatedModules: true,
    },
    include: ["src"],
  },
  null,
  2,
);

function makeIndexHtml(hookName: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${hookName} — hookli playground</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

const MAIN_TSX = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

const INDEX_CSS = `* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  min-height: 100vh;
  background-color: #07080a;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

#root {
  width: 100%;
  max-width: 580px;
  padding: 2rem;
}

.card {
  background-color: #0d0f14;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
}

button {
  background-color: #7c3aed;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  margin: 4px;
  transition: all 0.15s ease;
}

button:hover {
  background-color: #8b5cf6;
}

button:active {
  transform: scale(0.98);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input, textarea, select {
  background-color: #131722;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  margin: 6px 0;
  width: 100%;
  outline: none;
}

input:focus, textarea:focus, select:focus {
  border-color: #8b5cf6;
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background-color: rgba(255, 255, 255, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #a78bfa;
}
`;

/** Where the hook sources live inside the playground (imported as "./hookli"). */
const LOCAL_LIB = "src/hookli";

/** `useLocalStorage` -> `use-local-storage` (the manifest's slug convention). */
export function hookNameToSlug(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/** Hook names a usage snippet imports from "hookli". */
export function importedHooks(code: string): string[] {
  const names: string[] = [];
  for (const m of code.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']hookli["']/g)) {
    for (const part of m[1].split(",")) {
      const name = part.replace(/^\s*type\s+/, "").split(/\s+as\s+/)[0].trim();
      if (/^use[A-Z]/.test(name)) names.push(name);
    }
  }
  return names;
}

export type SandboxSources = {
  get: (slug: string) => { path: string; source: string } | undefined;
  closure: (slugs: readonly string[]) => string[];
};

/**
 * Builds a complete StackBlitz Project definition for any hook. The playground
 * ships the hook's real source (plus any sibling hooks it imports) under
 * src/hookli/, and the example imports from there — so editing the hook updates
 * the preview live, and nothing is fetched from npm.
 */
export function createStackBlitzProject(
  hook: HookEntry,
  doc: HookDoc,
  sources: SandboxSources,
): StackBlitzProject {
  const slugs = sources.closure([hook.slug, ...importedHooks(doc.usage).map(hookNameToSlug)]);
  const hookFiles: Record<string, string> = {};
  for (const slug of slugs) {
    const entry = sources.get(slug);
    if (!entry) continue;
    hookFiles[`${LOCAL_LIB}/${slug}/${slug}.ts`] = entry.source;
    hookFiles[`${LOCAL_LIB}/${slug}/index.ts`] = `export * from "./${slug}";\n`;
  }
  hookFiles[`${LOCAL_LIB}/index.ts`] =
    `// hookli source for this playground — the same files that ship in the npm package.\n` +
    slugs.map((slug) => `export * from "./${slug}";`).join("\n") +
    "\n";

  const appTsx =
    `// ${hook.name}'s real implementation is in ${LOCAL_LIB}/${hook.slug}/${hook.slug}.ts — edit it and the preview updates.\n` +
    usageToAppTsx(doc.usage).replace(/from\s*["']hookli["']/g, 'from "./hookli"');

  return {
    title: `${hook.name} — hookli playground`,
    description: hook.description,
    template: "node",
    files: {
      "package.json": makePackageJson(hook.slug),
      "index.html": makeIndexHtml(hook.name),
      "vite.config.ts": VITE_CONFIG,
      "tsconfig.json": TSCONFIG,
      "src/main.tsx": MAIN_TSX,
      "src/App.tsx": appTsx,
      "src/index.css": INDEX_CSS,
      ...hookFiles,
    },
  };
}

let sdkPromise: Promise<typeof import("@stackblitz/sdk")> | null = null;

function loadSdk() {
  if (!sdkPromise) {
    sdkPromise = import("@stackblitz/sdk");
  }
  return sdkPromise;
}

/**
 * Opens a hook playground in a new tab via StackBlitz SDK.
 * 0 KB initial bundle cost — SDK is dynamically imported on demand.
 */
export async function openInStackBlitz(
  hook: HookEntry,
  doc: HookDoc,
): Promise<void> {
  // Both chunks load on click only: the SDK and the generated hook sources (~140 KB)
  // never ship in the page's initial JavaScript.
  const [sdkModule, { getHookSource, getHookSourceClosure }] = await Promise.all([
    loadSdk(),
    import("@/lib/hook-sources"),
  ]);
  const sdk = sdkModule.default ?? sdkModule;
  const project = createStackBlitzProject(hook, doc, {
    get: getHookSource,
    closure: getHookSourceClosure,
  });

  sdk.openProject(project, {
    newWindow: true,
    openFile: `src/App.tsx,${LOCAL_LIB}/${hook.slug}/${hook.slug}.ts`,
  });
}
