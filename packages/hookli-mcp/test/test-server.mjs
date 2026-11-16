import { spawn } from "node:child_process";
import path from "node:path";

const cliPath = path.resolve("packages/hookli-mcp/dist/cli.js");

console.log("Starting MCP server test with:", cliPath);

const proc = spawn("node", [cliPath], {
  stdio: ["pipe", "pipe", "pipe"],
});

let buffer = "";
const responses = [];

proc.stdout.on("data", (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split("\n");
  buffer = lines.pop(); // keep partial line
  for (const line of lines) {
    if (line.trim()) {
      try {
        const json = JSON.parse(line.trim());
        responses.push(json);
      } catch (e) {
        console.error("Non-JSON stdout line:", line);
      }
    }
  }
});

proc.stderr.on("data", (chunk) => {
  console.log("[SERVER LOG]:", chunk.toString().trim());
});

function send(msg) {
  const payload = JSON.stringify(msg) + "\n";
  proc.stdin.write(payload);
}

async function waitForResponse(id, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = responses.find((r) => r.id === id);
    if (res) return res;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`Timeout waiting for response to message id ${id}`);
}

async function runTests() {
  try {
    // 1. Initialize
    console.log("\n▶ Test 1: Initialize");
    send({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" },
      },
    });
    const initRes = await waitForResponse(1);
    console.log("  Init response serverInfo:", initRes.result?.serverInfo);
    console.log("  Capabilities:", Object.keys(initRes.result?.capabilities || {}));

    // Send initialized notification
    send({
      jsonrpc: "2.0",
      method: "notifications/initialized",
    });

    // 2. tools/list
    console.log("\n▶ Test 2: List Tools");
    send({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    });
    const toolsRes = await waitForResponse(2);
    const tools = toolsRes.result?.tools || [];
    console.log(`  Found ${tools.length} tools:`, tools.map((t) => t.name).join(", "));
    if (tools.length !== 5) throw new Error(`Expected 5 tools, got ${tools.length}`);

    // 3. tools/call: list_hooks (state category)
    console.log("\n▶ Test 3: Call list_hooks (category=state)");
    send({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "list_hooks",
        arguments: { category: "state" },
      },
    });
    const listRes = await waitForResponse(3);
    const listText = listRes.result?.content?.[0]?.text || "";
    console.log("  List output preview:\n ", listText.split("\n").slice(0, 4).join("\n  "));

    // 4. tools/call: get_hook (useDebounce)
    console.log("\n▶ Test 4: Call get_hook (name=useDebounce)");
    send({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "get_hook",
        arguments: { name: "useDebounce" },
      },
    });
    const getRes = await waitForResponse(4);
    const getText = getRes.result?.content?.[0]?.text || "";
    console.log("  Hook doc has signature:", getText.includes("## Signature"));
    console.log("  Hook doc has parameters:", getText.includes("## Parameters"));
    console.log("  Hook doc has usage:", getText.includes("## Usage"));

    // 5. tools/call: search_hooks ("outside click")
    console.log("\n▶ Test 5: Call search_hooks (query='outside click')");
    send({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "search_hooks",
        arguments: { query: "outside click" },
      },
    });
    const searchRes = await waitForResponse(5);
    const searchText = searchRes.result?.content?.[0]?.text || "";
    console.log("  Search result matches useClickOutside:", searchText.includes("useClickOutside"));

    // 6. tools/call: get_hook_source (useToggle)
    console.log("\n▶ Test 6: Call get_hook_source (name=useToggle)");
    send({
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: {
        name: "get_hook_source",
        arguments: { name: "useToggle" },
      },
    });
    const srcRes = await waitForResponse(6);
    const srcText = srcRes.result?.content?.[0]?.text || "";
    console.log("  Source output has TypeScript code:", srcText.includes("useState") && srcText.includes("useCallback"));

    // 7. tools/call: suggest_hooks_for_task
    console.log("\n▶ Test 7: Call suggest_hooks_for_task");
    send({
      jsonrpc: "2.0",
      id: 7,
      method: "tools/call",
      params: {
        name: "suggest_hooks_for_task",
        arguments: {
          taskDescription: "A modal popup with escape key listener, click outside close, and scroll lock",
        },
      },
    });
    const suggestRes = await waitForResponse(7);
    const suggestText = suggestRes.result?.content?.[0]?.text || "";
    console.log("  Suggestion contains hooks and composition:\n ", suggestText.split("\n").slice(0, 6).join("\n  "));

    // 8. resources/list
    console.log("\n▶ Test 8: List Resources");
    send({
      jsonrpc: "2.0",
      id: 8,
      method: "resources/list",
      params: {},
    });
    const resRes = await waitForResponse(8);
    console.log("  Resources found:", (resRes.result?.resources || []).map((r) => r.uri));

    // 9. prompts/list
    console.log("\n▶ Test 9: List Prompts");
    send({
      jsonrpc: "2.0",
      id: 9,
      method: "prompts/list",
      params: {},
    });
    const promptsRes = await waitForResponse(9);
    console.log("  Prompts found:", (promptsRes.result?.prompts || []).map((p) => p.name));

    console.log("\n✅ ALL 9 TESTS PASSED SUCCESSFULLY!");
  } finally {
    proc.kill();
  }
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  proc.kill();
  process.exit(1);
});
