import fs from "node:fs";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CATALOG_META } from "../src/catalog.js";
import { createMcpServer } from "../src/server.js";
import { stem, suggestForTask } from "../src/search.js";
import { CATALOG } from "../src/catalog.js";

/* The README (npm page) and the docs MCP page describe the server. These tests
   keep what they say in step with what the server actually does. */
const readme = fs.readFileSync(path.resolve(__dirname, "../README.md"), "utf8");
const docsPage = fs.readFileSync(path.resolve(__dirname, "../../../apps/docs/app/docs/mcp/page.tsx"), "utf8");

let client: Client;
beforeAll(async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await createMcpServer().connect(serverTransport);
  client = new Client({ name: "readme-test", version: "0.0.0" });
  await client.connect(clientTransport);
});
afterAll(() => client.close());

const codeBlocks = (lang: string) => [...readme.matchAll(new RegExp("```" + lang + "\\n([\\s\\S]*?)```", "g"))].map((m) => m[1]);

describe("README", () => {
  it("documents exactly the server's tools, resources and prompts", async () => {
    const tools = [...readme.matchAll(/^\| `(\w+)` \|/gm)].map((m) => m[1]).sort();
    expect(tools).toEqual((await client.listTools()).tools.map((t) => t.name).sort());

    const resources = [...readme.matchAll(/^- `(hookli:\/\/[^`]+)`/gm)].map((m) => m[1]).sort();
    const served = [
      ...(await client.listResources()).resources.map((r) => r.uri),
      ...(await client.listResourceTemplates()).resourceTemplates.map((t) => t.uriTemplate),
    ].sort();
    expect(resources).toEqual(served);

    const promptSection = readme.slice(readme.indexOf("## Available Prompts"));
    const prompts = [...promptSection.matchAll(/^- `([\w-]+)`/gm)].map((m) => m[1]).sort();
    expect(prompts).toEqual((await client.listPrompts()).prompts.map((p) => p.name).sort());
  });

  it("states the real hook count everywhere", () => {
    for (const text of [readme, docsPage]) {
      const counts = [...text.matchAll(/\b(\d{2,3}) (?:typed|hooks)\b/g)].map((m) => Number(m[1]));
      for (const n of counts) expect(n).toBe(CATALOG_META.hookCount);
    }
  });

  it("every JSON config is valid and starts the server with npx -y hookli-mcp", () => {
    const blocks = codeBlocks("json");
    expect(blocks.length).toBeGreaterThan(3);
    for (const block of blocks) {
      const config = JSON.parse(block);
      const servers = config.mcpServers ?? config.servers ?? config.context_servers;
      expect(servers?.hookli, block).toBeDefined();
      const { command, args } = servers.hookli;
      if (command === "node") expect(args[0]).toMatch(/packages\/hookli-mcp\/dist\/cli\.js$/);
      else expect([command, ...args]).toEqual(["npx", "-y", "hookli-mcp"]);
    }
  });

  it("the Codex TOML config names the same command", () => {
    const [toml] = codeBlocks("toml");
    expect(toml).toContain("[mcp_servers.hookli]");
    expect(toml).toContain('command = "npx"');
    expect(toml).toContain('args = ["-y", "hookli-mcp"]');
  });

  it("CLI add commands separate the server command with `--` (else `-y` is read as a CLI option)", () => {
    for (const text of [readme, docsPage]) {
      const commands = [...text.matchAll(/(?:claude|codex) mcp add[^\n`"<]*/g)].map((m) => m[0].trim());
      expect(commands.length).toBeGreaterThan(0);
      for (const cmd of commands) expect(cmd).toMatch(/ hookli -- npx -y hookli-mcp$/);
    }
  });
});

describe("docs MCP page", () => {
  it("lists exactly the server's tools", async () => {
    const listed = [...docsPage.matchAll(/^\s+name: "(\w+)",$/gm)].map((m) => m[1]).sort();
    expect(listed).toEqual((await client.listTools()).tools.map((t) => t.name).sort());
  });

  it("its example prompts return the hooks the page says they do", () => {
    const examples: Array<[string, string[]]> = [
      ["Add a debounced search bar that remembers the last query in localStorage.", ["useDebounce", "useLocalStorage"]],
      ["I need to close a dropdown whenever the user clicks outside or presses Escape.", ["useClickOutside", "useKeyPress"]],
    ];
    for (const [prompt, hooks] of examples) {
      expect(docsPage).toContain(prompt.replace(/'/g, "&apos;"));
      const names = suggestForTask(CATALOG, prompt).map((s) => s.hook.name);
      for (const h of hooks) {
        expect(names, prompt).toContain(h);
        expect(docsPage).toContain(`>${h}</code>`);
      }
    }
    expect(stem("debounced")).toBe(stem("debounce"));
  });
});
