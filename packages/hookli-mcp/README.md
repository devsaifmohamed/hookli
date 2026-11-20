# hookli-mcp

> The official **Model Context Protocol (MCP)** server for [hookli](https://hookli.vercel.app) — giving AI assistants direct access to all 66 typed, SSR-safe, zero-dependency React hooks.

---

## What It Enables

With `hookli-mcp` connected, AI assistants (Claude Code, Cursor, Claude Desktop, VS Code Copilot, Windsurf, Codex, Zed, etc.) can:
- **Discover hooks:** Query the complete catalog by category (`state`, `effects`, `dom`, `data`).
- **Inspect exact APIs:** Fetch typed signatures, parameter tables, return shapes, and TypeScript type aliases.
- **Search in plain words:** Describe what you need (e.g. *"wait until the user stops typing"*, *"close when clicking outside"*) and get the matching hook.
- **Read source code:** Get the exact implementation that ships in the `hookli` package.
- **Architect compositions:** Ask the MCP server how to compose multiple hooks for a given UI feature.

---

## Quick Start

### 1-Click Run via npx
```bash
npx -y hookli-mcp
```

### Local Development / Monorepo Run
```bash
node packages/hookli-mcp/dist/cli.js
```

---

## Configuration for AI Clients

`hookli-mcp` runs over standard I/O (`stdio`): every client starts it with `npx -y hookli-mcp`. Most clients take the same `mcpServers` JSON; VS Code, Zed and Codex use their own formats, shown below.

### The common config (`mcpServers`)
Used by Claude Desktop, Cursor, Windsurf, Antigravity, Cline and Roo Code:

```json
{
  "mcpServers": {
    "hookli": {
      "command": "npx",
      "args": ["-y", "hookli-mcp"]
    }
  }
}
```

---

### Client-Specific Setup Guides

#### 1. Claude Code
Run in your terminal (the `--` separates Claude's options from the server command):
```bash
claude mcp add hookli -- npx -y hookli-mcp
```
Or share it with everyone on the repository (writes `.mcp.json`):
```bash
claude mcp add --scope project hookli -- npx -y hookli-mcp
```
Check it with `claude mcp list`.

#### 2. Cursor
Paste the common config into `.cursor/mcp.json` in your project, or `~/.cursor/mcp.json` for all projects.

#### 3. Claude Desktop
Paste the common config into `claude_desktop_config.json`:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Restart Claude Desktop afterwards.

#### 4. Windsurf
Paste the common config into `~/.codeium/windsurf/mcp_config.json`, then fully quit and reopen Windsurf.

#### 5. Google Antigravity
Paste the common config into `~/.gemini/config/mcp_config.json` (all projects) or `.agents/mcp_config.json` (one workspace). In the IDE: **…** in the agent panel → **MCP Servers** → **Manage MCP Servers** → **View raw config**.

#### 6. VS Code (GitHub Copilot)
VS Code uses a `servers` key. Add to `.vscode/mcp.json`:
```json
{
  "servers": {
    "hookli": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "hookli-mcp"]
    }
  }
}
```

#### 7. Cline / Roo Code (VS Code extensions)
Open the extension's MCP settings (`cline_mcp_settings.json` / `mcp_settings.json`) and paste the common config.

#### 8. OpenAI Codex (CLI and IDE extension)
```bash
codex mcp add hookli -- npx -y hookli-mcp
```
Or add to `~/.codex/config.toml`:
```toml
[mcp_servers.hookli]
command = "npx"
args = ["-y", "hookli-mcp"]
```

#### 9. Zed
Zed uses a `context_servers` key. Add to your settings file (`zed: open settings file`):
```json
{
  "context_servers": {
    "hookli": {
      "command": "npx",
      "args": ["-y", "hookli-mcp"],
      "env": {}
    }
  }
}
```

#### 10. Local development (inside this monorepo)
Build first (`pnpm --filter hookli-mcp run build`), then point your client at the built file with an absolute path:
```json
{
  "mcpServers": {
    "hookli": {
      "command": "node",
      "args": ["/absolute/path/to/hookli/packages/hookli-mcp/dist/cli.js"]
    }
  }
}
```

---

## Available Tools

| Tool | Description | Inputs |
|---|---|---|
| `list_hooks` | List all 66 hooks with signatures and descriptions | `category?` (`state`, `effects`, `dom`, `data`), `query?` |
| `get_hook` | Get complete documentation, parameters, returns, and usage | `name` (e.g. `useDebounce`, `useLocalStorage`) |
| `search_hooks` | Natural language and use-case search with relevance ranking | `query` (e.g. *"detect outside clicks"*), `category?`, `limit?` |
| `get_hook_source` | Inspect the pure TypeScript implementation | `name` |
| `suggest_hooks_for_task` | Recommends how to compose hooks for a feature | `taskDescription` |

---

## Available Resources

- `hookli://catalog`: Complete catalog of 66 hooks with all metadata as JSON.
- `hookli://manifest`: Lightweight library summary.
- `hookli://hooks/{slug}`: Dynamic Markdown documentation for any hook.

---

## Available Prompts

- `implement-hook`: Scaffold a typed, SSR-safe component using a specific hookli hook.
- `migrate-to-hookli`: Migrate an existing component from `react-use` or `usehooks-ts` to `hookli`.
