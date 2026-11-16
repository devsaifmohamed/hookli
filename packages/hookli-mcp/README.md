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

### 1. Cursor (`.cursor/mcp.json` or Global Settings)
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

### 2. Claude Code CLI (1 command)
```bash
claude mcp add hookli npx -y hookli-mcp
```
Or scoped to current project:
```bash
claude mcp add --scope project hookli npx -y hookli-mcp
```

### 3. Claude Desktop (`claude_desktop_config.json`)
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

### 4. Windsurf (`~/.codeium/windsurf/mcp_config.json`)
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

### 3. Antigravity MCP Config (`mcp.json`)
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
