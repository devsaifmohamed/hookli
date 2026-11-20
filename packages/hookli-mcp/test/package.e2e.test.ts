import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import meta from "../src/data/meta.json";

/* What a user gets from `npx -y hookli-mcp`: pack the built package exactly as
   `npm publish` would, install the tarball into an empty project with npm (so
   only the declared dependencies are available), then start its `hookli-mcp`
   bin over stdio and talk to it with a real MCP client.

   Needs a fresh `pnpm run build` and network access (npm install). */
const pkgDir = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"));
let tmp: string;
let app: string;
let tarballFiles: string[];
let client: Client;
let stderr = "";
/* Anything on stdout that isn't a JSON-RPC message corrupts the protocol for
   stricter clients; the SDK client reports such lines here. */
const protocolErrors: Error[] = [];

beforeAll(async () => {
  // Refuse to test a stale build: dist must be newer than every source and data file.
  const built = path.join(pkgDir, "dist/cli.js");
  if (!fs.existsSync(built)) throw new Error("Run `pnpm run build` first.");
  const newestSource = Math.max(
    ...fs.readdirSync(path.join(pkgDir, "src"), { recursive: true, withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => fs.statSync(path.join(e.parentPath, e.name)).mtimeMs),
  );
  if (fs.statSync(built).mtimeMs < newestSource) throw new Error("dist is older than src; run `pnpm run build` first.");
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hookli-mcp-pack-"));
  execFileSync("pnpm", ["pack", "--pack-destination", tmp], { cwd: pkgDir, stdio: "pipe" });
  const tarball = path.join(tmp, `hookli-mcp-${pkg.version}.tgz`);
  tarballFiles = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" }).trim().split("\n");

  app = path.join(tmp, "app");
  fs.mkdirSync(app);
  fs.writeFileSync(path.join(app, "package.json"), JSON.stringify({ name: "consumer", private: true }));
  execFileSync("npm", ["install", tarball, "--no-audit", "--no-fund", "--loglevel=error"], { cwd: app, stdio: "pipe" });

  const transport = new StdioClientTransport({
    command: path.join(app, "node_modules/.bin/hookli-mcp"),
    args: [],
    cwd: app,
    stderr: "pipe",
  });
  transport.stderr?.on("data", (chunk) => (stderr += String(chunk)));
  client = new Client({ name: "hookli-mcp-package-test", version: "0.0.0" });
  client.onerror = (error) => protocolErrors.push(error);
  await client.connect(transport);
});

afterAll(async () => {
  await client?.close();
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
});

describe("the published hookli-mcp package", () => {
  it("contains the built server and nothing else", () => {
    const files = tarballFiles.map((f) => f.replace(/^package\//, ""));
    for (const f of ["package.json", "README.md", "dist/cli.js", "dist/index.js", "dist/index.mjs", "dist/index.d.ts"]) {
      expect(files).toContain(f);
    }
    expect(files.filter((f) => /^(src|test)\//.test(f) || f.endsWith(".tgz"))).toEqual([]);
  });

  it("declares only the dependencies the server needs, all resolvable after install", () => {
    expect(Object.keys(pkg.dependencies).sort()).toEqual(["@modelcontextprotocol/sdk", "zod"]);
    const installed = JSON.parse(fs.readFileSync(path.join(app, "node_modules/hookli-mcp/package.json"), "utf8"));
    // The form npm publishes; "./dist/cli.js" makes npm print a misleading "invalid and removed" warning.
    expect(installed.bin).toEqual({ "hookli-mcp": "dist/cli.js" });
    expect(fs.readFileSync(path.join(app, "node_modules/hookli-mcp/dist/cli.js"), "utf8").startsWith("#!/usr/bin/env node\n")).toBe(true);
  });

  it("starts over stdio, logs only to stderr, and reports its real versions", () => {
    expect(client.getServerVersion()).toMatchObject({ name: "hookli", version: pkg.version });
    expect(stderr).toContain(`hookli MCP server v${pkg.version} running on stdio (hookli ${meta.libraryVersion}, ${meta.hookCount} hooks)`);
  });

  it("writes nothing but protocol messages to stdout", async () => {
    await client.ping();
    expect(protocolErrors.map((e) => e.message)).toEqual([]);
  });

  it("serves all five tools, three resources and two prompts", async () => {
    expect((await client.listTools()).tools).toHaveLength(5);
    expect((await client.listResources()).resources).toHaveLength(2);
    expect((await client.listResourceTemplates()).resourceTemplates).toHaveLength(1);
    expect((await client.listPrompts()).prompts).toHaveLength(2);
  });

  it("answers a plain-language search with the bundled catalog", async () => {
    const res = await client.callTool({ name: "search_hooks", arguments: { query: "wait until the user stops typing", limit: 3 } });
    expect((res.content as Array<{ text: string }>)[0].text).toMatch(/1\. `useDebounce/);
  });

  it("returns real hook source and the full catalog", async () => {
    const src = await client.callTool({ name: "get_hook_source", arguments: { name: "useIdle" } });
    const file = fs.readFileSync(path.resolve(pkgDir, "../hookli/src/hooks/use-idle/use-idle.ts"), "utf8").trim();
    expect((src.content as Array<{ text: string }>)[0].text).toContain(file);
    const catalog = await client.readResource({ uri: "hookli://catalog" });
    expect(JSON.parse((catalog.contents[0] as { text: string }).text)).toHaveLength(meta.hookCount);
  });

  it("works as a library from both ESM and CommonJS", () => {
    const check = "const s = m.createMcpServer(); if (typeof s.connect !== 'function' || m.CATALOG.length !== %d) process.exit(1);";
    const n = String(meta.hookCount);
    execFileSync("node", ["--input-type=module", "-e", `import * as m from "hookli-mcp"; ${check.replace("%d", n)}`], { cwd: app });
    execFileSync("node", ["-e", `const m = require("hookli-mcp"); ${check.replace("%d", n)}`], { cwd: app });
  });
});
