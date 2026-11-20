import fs from "node:fs";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CATALOG, CATALOG_META, formatHookMarkdown } from "../src/catalog.js";
import { createMcpServer } from "../src/server.js";

/* End-to-end: a real MCP client talks to the server over an in-memory transport,
   exactly as Claude Code / Cursor would over stdio. */
let client: Client;

beforeAll(async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await createMcpServer().connect(serverTransport);
  client = new Client({ name: "hookli-mcp-test", version: "0.0.0" });
  await client.connect(clientTransport);
});

afterAll(async () => {
  await client.close();
});

const text = (r: unknown) => (r as { content: Array<{ text: string }> }).content[0].text;
const isError = (r: unknown) => (r as { isError?: boolean }).isError === true;
const resourceText = async (uri: string) => {
  const res = await client.readResource({ uri });
  return res.contents[0] as { uri: string; mimeType: string; text: string };
};
const promptText = async (name: string, args: Record<string, string>) => {
  const res = await client.getPrompt({ name, arguments: args });
  expect(res.messages).toHaveLength(1);
  expect(res.messages[0].role).toBe("user");
  return (res.messages[0].content as { text: string }).text;
};
const libraryFile = (rel: string) => fs.readFileSync(path.resolve(__dirname, "../../hookli", rel), "utf8");

describe("hookli MCP server", () => {
  it("exposes the five tools", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(
      ["get_hook", "get_hook_source", "list_hooks", "search_hooks", "suggest_hooks_for_task"].sort(),
    );
  });

  it("identifies itself with the hookli-mcp version", () => {
    expect(client.getServerVersion()).toMatchObject({ name: "hookli", version: CATALOG_META.mcpVersion });
  });

  it("list_hooks returns every hook and filters by category", async () => {
    expect(text(await client.callTool({ name: "list_hooks", arguments: {} }))).toContain("useToggle");
    const dom = text(await client.callTool({ name: "list_hooks", arguments: { category: "data" } }));
    expect(dom).toContain("useFetch");
    expect(dom).not.toContain("useToggle");
  });

  it("search_hooks answers a plain-language request", async () => {
    const out = text(
      await client.callTool({ name: "search_hooks", arguments: { query: "wait until the user stops typing", limit: 3 } }),
    );
    expect(out).toMatch(/1\. `useDebounce/);
  });

  it("get_hook returns docs with signature and usage", async () => {
    const out = text(await client.callTool({ name: "get_hook", arguments: { name: "use-idle" } }));
    expect(out).toContain("# useIdle");
    expect(out).toContain("## Signature");
    expect(out).toContain("## Usage");
  });

  it("get_hook_source returns the library's real source file", async () => {
    const out = text(await client.callTool({ name: "get_hook_source", arguments: { name: "useIdle" } }));
    const file = fs.readFileSync(path.resolve(__dirname, "../../hookli/src/hooks/use-idle/use-idle.ts"), "utf8").trim();
    expect(out).toContain(file);
  });

  it("suggest_hooks_for_task maps requirements to hooks", async () => {
    const out = text(
      await client.callTool({
        name: "suggest_hooks_for_task",
        arguments: { taskDescription: "modal that closes on ESC, closes on outside click and locks body scroll" },
      }),
    );
    for (const hook of ["useKeyPress", "useClickOutside", "useScrollLock"]) expect(out).toContain(hook);
  });

  it("manifest resource reports the bundled library version", async () => {
    const res = await client.readResource({ uri: "hookli://manifest" });
    const body = JSON.parse((res.contents[0] as { text: string }).text);
    expect(body.version).toBe(CATALOG_META.libraryVersion);
    expect(body.hooks).toHaveLength(CATALOG_META.hookCount);
  });

  it("unknown hooks return a helpful error instead of crashing", async () => {
    const out = text(await client.callTool({ name: "get_hook", arguments: { name: "useNope" } }));
    expect(out.toLowerCase()).toContain("not found");
  });
});

describe("tools: every hook and every branch", () => {
  it("list_hooks lists all hooks with a correct count, and filters by text", async () => {
    const all = text(await client.callTool({ name: "list_hooks", arguments: {} }));
    expect(all).toContain(`(${CATALOG.length} found)`);
    for (const hook of CATALOG) expect(all).toContain(`\`${hook.name}\``);

    const debounce = text(await client.callTool({ name: "list_hooks", arguments: { query: "debounce" } }));
    expect(debounce).toContain("useDebounce");
    expect(debounce).not.toContain("useToggle");

    const none = text(await client.callTool({ name: "list_hooks", arguments: { category: "dom", query: "zzzz" } }));
    expect(none).toContain("(0 found)");
  });

  it("list_hooks: each category returns exactly that category's hooks", async () => {
    for (const category of ["state", "effects", "dom", "data"] as const) {
      const out = text(await client.callTool({ name: "list_hooks", arguments: { category } }));
      const expected = CATALOG.filter((h) => h.category === category);
      expect(expected.length).toBeGreaterThan(0);
      expect(out).toContain(`(${expected.length} found)`);
      for (const hook of CATALOG) {
        if (hook.category === category) expect(out).toContain(`\`${hook.name}\``);
        else expect(out).not.toContain(`**\`${hook.name}\`**`);
      }
    }
  });

  it("rejects bad inputs instead of guessing", async () => {
    const bad = [
      { name: "list_hooks", arguments: { category: "network" } },
      { name: "search_hooks", arguments: { query: "scroll", limit: 0 } },
      { name: "search_hooks", arguments: { query: "scroll", limit: 21 } },
      { name: "search_hooks", arguments: {} },
      { name: "get_hook", arguments: {} },
      { name: "suggest_hooks_for_task", arguments: {} },
    ];
    for (const call of bad) {
      const result = await client.callTool(call).catch((error: Error) => ({ isError: true, error }));
      expect(isError(result), JSON.stringify(call)).toBe(true);
    }
  });

  it("get_hook and get_hook_source work for every hook, by name and by slug", async () => {
    for (const hook of CATALOG) {
      for (const id of [hook.name, hook.slug]) {
        const doc = await client.callTool({ name: "get_hook", arguments: { name: id } });
        expect(isError(doc), id).toBe(false);
        expect(text(doc)).toContain(`# ${hook.name}`);
        expect(text(doc)).toContain(hook.signature);
      }
      const src = text(await client.callTool({ name: "get_hook_source", arguments: { name: hook.slug } }));
      expect(src).toContain(libraryFile(`src/hooks/${hook.slug}/${hook.slug}.ts`).trim());
      expect(src).toContain(`File: \`${hook.sourcePath}\``);
    }
  });

  it("get_hook on a near miss is an error that suggests the right hook", async () => {
    const res = await client.callTool({ name: "get_hook", arguments: { name: "debounce" } });
    expect(isError(res)).toBe(true);
    expect(text(res)).toContain("Did you mean");
    expect(text(res)).toContain("useDebounce");
  });

  it("get_hook_source on an unknown hook is an error", async () => {
    const res = await client.callTool({ name: "get_hook_source", arguments: { name: "useNope" } });
    expect(isError(res)).toBe(true);
    expect(text(res)).toContain("not found");
  });

  it("get_hook_source's 'zero runtime dependencies' line is true", () => {
    const pkg = JSON.parse(libraryFile("package.json"));
    expect(pkg.dependencies ?? {}).toEqual({});
    for (const hook of CATALOG) {
      const specs = [...hook.source.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)].map((m) => m[1]);
      for (const spec of specs) expect(spec, hook.name).toMatch(/^(react|\.\.\/use-[a-z0-9-]+)$/);
    }
  });

  it("search_hooks honours category and limit, and explains an empty result", async () => {
    const limited = text(await client.callTool({ name: "search_hooks", arguments: { query: "scroll", limit: 2 } }));
    expect(limited.match(/^### \d+\./gm)).toHaveLength(2);

    const dom = text(await client.callTool({ name: "search_hooks", arguments: { query: "state", category: "dom" } }));
    const names = [...dom.matchAll(/^### \d+\. `(\w+)`/gm)].map((m) => m[1]);
    expect(names.length).toBeGreaterThan(0);
    for (const n of names) expect(CATALOG.find((h) => h.name === n)?.category).toBe("dom");

    const empty = text(await client.callTool({ name: "search_hooks", arguments: { query: "the and with" } }));
    expect(empty).toContain("No hookli hooks matched");
  });

  it("suggest_hooks_for_task prints an import line with exactly the suggested hooks", async () => {
    const out = text(
      await client.callTool({
        name: "suggest_hooks_for_task",
        arguments: { taskDescription: "copy a link to the clipboard and show a toast when offline" },
      }),
    );
    const listed = [...out.matchAll(/^### \d+\. `(\w+)`/gm)].map((m) => m[1]);
    expect(listed).toContain("useCopyToClipboard");
    expect(listed).toContain("useNetworkState");
    expect(out).toContain(`import { ${listed.join(", ")} } from "hookli";`);
  });

  it("suggest_hooks_for_task says so when nothing matches", async () => {
    const out = text(await client.callTool({ name: "suggest_hooks_for_task", arguments: { taskDescription: "xyzzy qwerty" } }));
    expect(out).toContain("Could not identify");
  });
});

describe("resources", () => {
  it("lists the catalog, the manifest and the per-hook template", async () => {
    const { resources } = await client.listResources();
    expect(resources.map((r) => r.uri).sort()).toEqual(["hookli://catalog", "hookli://manifest"]);
    const { resourceTemplates } = await client.listResourceTemplates();
    expect(resourceTemplates.map((t) => t.uriTemplate)).toEqual(["hookli://hooks/{slug}"]);
  });

  it("hookli://catalog is the full catalog as JSON", async () => {
    const res = await resourceText("hookli://catalog");
    expect(res.mimeType).toBe("application/json");
    expect(JSON.parse(res.text)).toEqual(CATALOG);
  });

  it("hookli://manifest summarises every hook", async () => {
    const body = JSON.parse((await resourceText("hookli://manifest")).text);
    expect(body.library).toBe("hookli");
    expect(body.hooks.map((h: { name: string }) => h.name)).toEqual(CATALOG.map((h) => h.name));
    for (const h of body.hooks) {
      expect(Object.keys(h).sort()).toEqual(["category", "description", "docsUrl", "name", "signature", "slug"]);
    }
  });

  it("hookli://hooks/{slug} serves markdown docs for every hook", async () => {
    for (const hook of CATALOG) {
      const res = await resourceText(`hookli://hooks/${hook.slug}`);
      expect(res.mimeType).toBe("text/markdown");
      expect(res.uri).toBe(`hookli://hooks/${hook.slug}`);
      expect(res.text).toContain(`# ${hook.name}`);
      expect(res.text).toContain(hook.signature);
    }
  });

  it("hookli://hooks/{slug} rejects an unknown hook", async () => {
    await expect(client.readResource({ uri: "hookli://hooks/use-nope" })).rejects.toThrow(/not found/);
  });
});

describe("prompts", () => {
  it("lists both prompts with their arguments", async () => {
    const { prompts } = await client.listPrompts();
    const byName = Object.fromEntries(prompts.map((p) => [p.name, p]));
    expect(Object.keys(byName).sort()).toEqual(["implement-hook", "migrate-to-hookli"]);
    const args = (name: string) => byName[name].arguments?.map((a) => `${a.name}:${a.required ? "required" : "optional"}`);
    expect(args("implement-hook")).toEqual(["hookName:required", "useCase:optional"]);
    expect(args("migrate-to-hookli")).toEqual(["sourceLibrary:required", "currentCode:required"]);
  });

  it("implement-hook embeds the hook's docs and the goal", async () => {
    const out = await promptText("implement-hook", { hookName: "useDebounce", useCase: "search box" });
    expect(out).toContain("My specific goal is: search box");
    expect(out).toContain("# useDebounce");
    expect(out).toContain("## Signature");
  });

  it("implement-hook works without a goal and flags an unknown hook", async () => {
    const plain = await promptText("implement-hook", { hookName: "use-idle" });
    expect(plain).not.toContain("My specific goal");
    expect(plain).toContain("# useIdle");
    expect(await promptText("implement-hook", { hookName: "useNope" })).toContain("not found in catalog");
  });

  it("migrate-to-hookli embeds the code and the real hook count, for each source library", async () => {
    for (const lib of ["react-use", "usehooks-ts", "custom"]) {
      const out = await promptText("migrate-to-hookli", { sourceLibrary: lib, currentCode: "const x = useToggle();" });
      expect(out).toContain(`from \`${lib}\` to \`hookli\``);
      expect(out).toContain("const x = useToggle();");
      expect(out).toContain(`hookli features ${CATALOG_META.hookCount} typed`);
    }
  });

  it("migrate-to-hookli rejects an unsupported source library", async () => {
    await expect(
      client.getPrompt({ name: "migrate-to-hookli", arguments: { sourceLibrary: "ahooks", currentCode: "x" } }),
    ).rejects.toThrow();
  });
});


describe("catalog code snippets", () => {
  // Agents paste these as-is, so each must import what it uses.
  it("every usage snippet and example imports its hook from hookli", () => {
    const missing = CATALOG.flatMap((h) =>
      [h.usage, ...h.examples.map((e) => e.code)]
        .filter((code) => !new RegExp(`import \\{[^}]*\\b${h.name}\\b[^}]*\\} from "hookli"`).test(code))
        .map(() => h.name),
    );
    expect(missing).toEqual([]);
  });

  it("examples appear in the hook markdown that get_hook returns", () => {
    const hover = CATALOG.find((h) => h.name === "useHover")!;
    expect(hover.examples.length).toBeGreaterThan(0);
    const md = formatHookMarkdown(hover);
    for (const e of hover.examples) {
      expect(md).toContain(`### ${e.title}`);
      expect(md).toContain(e.code);
    }
  });
});
