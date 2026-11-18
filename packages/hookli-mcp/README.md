# hookli-mcp

> The official **Model Context Protocol (MCP)** server for [hookli](https://hookli.vercel.app) — giving AI assistants direct access to all 66 typed, SSR-safe, zero-dependency React hooks.

---

## What It Enables

With `hookli-mcp` connected, AI assistants (Cursor, Claude Desktop, Antigravity, Copilot, etc.) can:
- **Discover hooks:** Query the complete catalog by category (`state`, `effects`, `dom`, `data`).
- **Inspect exact APIs:** Fetch typed signatures, parameter tables, return shapes, and TypeScript type aliases.
- **Search by intent:** Natural language search (e.g. *"how to debounce an input"*, *"click outside listener"*).
- **Read source code:** View the exact implementation to see SSR guards and zero-dependency patterns.
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

`hookli-mcp` is published on npm as a standalone executable. Because it operates over standard I/O (`stdio`), it works identically across all modern AI coding assistants.

### ⚡ The Universal Config
Paste this JSON block into **any** MCP-compatible editor or client config file:

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

#### 1. Claude Code CLI (1 command)
Run directly in your terminal:
```bash
claude mcp add hookli npx -y hookli-mcp
```
Or scope it to the current project repository:
```bash
claude mcp add --scope project hookli npx -y hookli-mcp
```

#### 2. Cursor IDE
Add to your project's `.cursor/mcp.json` (or via **Cursor Settings → Features → MCP → Add New MCP Server**):
- **Name:** `hookli`
- **Type:** `command`
- **Command:** `npx -y hookli-mcp`

Or in `.cursor/mcp.json`:
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

#### 3. Google Antigravity (IDE & CLI)
Add to your workspace `.gemini/mcp.json` or global `~/.gemini/antigravity/mcp.json`:
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

#### 4. OpenAI Codex / ChatGPT Desktop
In ChatGPT Desktop (**Settings → Developer → MCP Servers → Edit Config**) or `~/.codex/mcp.json`:
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

#### 5. Claude Desktop
Edit your `claude_desktop_config.json`:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

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

#### 6. Windsurf
Edit `~/.codeium/windsurf/mcp_config.json`:
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

#### 7. VS Code Extensions (Cline / Roo Code / Continue)
Open Cline MCP settings (`cline_mcp_settings.json`):
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

#### 8. Zed Editor
Add to `~/.config/zed/settings.json`:
```json
{
  "context_servers": [
    "hookli": {
      "command": {
        "path": "npx",
        "args": ["-y", "hookli-mcp"]
      }
    }
  ]
}
```

#### 9. Local Development / Monorepo Run
If developing locally inside the `hookli` monorepo:
```json
{
  "mcpServers": {
    "hookli": {
      "command": "node",
      "args": ["${workspaceRoot}/packages/hookli-mcp/dist/cli.js"]
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
