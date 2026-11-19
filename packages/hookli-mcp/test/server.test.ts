import fs from "node:fs";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CATALOG_META } from "../src/catalog.js";
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
