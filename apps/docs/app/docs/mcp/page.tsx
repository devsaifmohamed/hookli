import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import {
  ArrowRightIcon,
  ServerIcon,
  SparklesIcon,
} from "@/components/icons";
import { HOOKS } from "@/lib/hooks-registry";
import { GITHUB_URL, HOOKLI_VERSION } from "@/lib/site";
import { McpTabGroup } from "@/components/mcp-tab-group";
import { CopyMcpConfig } from "@/components/copy-mcp-config";

export const metadata: Metadata = {
  title: "Model Context Protocol (MCP) — AI Agent Setup",
  description:
    `Connect all ${HOOKS.length} hookli React hooks directly to Cursor, Claude Code, Claude Desktop, and CLI coding agents via Model Context Protocol.`,
  openGraph: {
    title: "hookli-mcp — Model Context Protocol for React Hooks",
    description:
      `Native MCP tools for Cursor, Claude Code, and Windsurf: real TypeScript signatures, real source and SSR-safe code for all ${HOOKS.length} hooks.`,
    url: "/docs/mcp",
  },
};

const UNIVERSAL_CONFIG = `{
  "mcpServers": {
    "hookli": {
      "command": "npx",
      "args": ["-y", "hookli-mcp"]
    }
  }
}`;

const LOCAL_CONFIG = `{
  "mcpServers": {
    "hookli": {
      "command": "node",
      "args": ["/absolute/path/to/hookli/packages/hookli-mcp/dist/cli.js"]
    }
  }
}`;

const MCP_TOOLS = [
  {
    name: "list_hooks",
    desc: `Lists all ${HOOKS.length} hooks or filters by category (state, effects, dom, data) or keyword.`,
  },
  {
    name: "get_hook",
    desc: "Returns exact TypeScript signatures, parameters, return types, and usage code.",
  },
  {
    name: "search_hooks",
    desc: "Plain-language search over hook names, descriptions and curated keywords, ranked by relevance.",
  },
  {
    name: "get_hook_source",
    desc: "Retrieves the exact zero-dependency TypeScript implementation to inspect SSR guards.",
  },
  {
    name: "suggest_hooks_for_task",
    desc: "Analyzes UI requirements and recommends how to compose multiple hookli hooks.",
  },
];

export default function McpDocsPage() {
  return (
    <div className="flex flex-col">
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 font-mono text-xs font-semibold text-accent border border-accent/25">
            <ServerIcon className="size-3.5" />
            Model Context Protocol
          </span>
          <span className="rounded-full bg-white/[0.04] px-2.5 py-0.5 font-mono text-xs text-gray-body border border-white/[0.06]">
            hookli v{HOOKLI_VERSION}
          </span>
        </div>
        <CopyMcpConfig />
      </div>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl text-fg">
        hookli for AI Agents & IDEs
      </h1>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-body">
        <strong className="text-fg">hookli-mcp</strong> is an official Model Context Protocol (MCP) server that gives
        AI coding assistants and autonomous CLI agents direct, tool-based access to all {HOOKS.length} typed, zero-dependency, SSR-safe React hooks.
      </p>

      {/* Glass Callout Banner */}
      <div className="relative overflow-hidden mt-6 rounded-2xl bg-gradient-to-r from-accent/[0.09] via-accent/[0.03] to-transparent p-5 border border-accent/15">
        <div className="flex items-start gap-3">
          <SparklesIcon className="size-5 shrink-0 text-accent mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-fg">Why an MCP server?</h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-body">
              Documentation in 2026 isn&apos;t just for humans with eyes — it&apos;s for AI agents with tools. Instead of pasting docs into chat or letting LLMs hallucinate outdated signatures, hookli-mcp exposes live query tools directly over stdio.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-red-400" />
            <h3 className="text-sm font-semibold text-red-400">Without MCP (Prompt Hallucinations)</h3>
          </div>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-gray-body/90">
            <li>• LLMs guess arguments from outdated training data</li>
            <li>• Generates broken signatures or unneeded runtime dependencies (e.g. lodash)</li>
            <li>• Misses browser environment checks, causing Next.js hydration mismatches</li>
            <li>• Requires manually copy-pasting API tables into chat</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-accent/20 bg-accent/[0.04] p-5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent" />
            <h3 className="text-sm font-semibold text-accent">With hookli-mcp (Native Agent Tools)</h3>
          </div>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-gray-body">
            <li>• Signatures, docs and source are generated from the library itself, so they match the release</li>
            <li>• Finds the right hook from plain-language requests</li>
            <li>• Zero runtime dependencies; every hook is server-render tested</li>
            <li>• Multi-hook composition patterns generated automatically</li>
          </ul>
        </div>
      </div>

      {/* Setup */}
      <h2 className="mt-14 text-2xl font-semibold text-fg">Setup</h2>
      <p className="mt-2 text-sm text-gray-body">
        Most MCP clients use the same JSON config. Pick how you work:
      </p>

      <McpTabGroup
        ideContent={
          <div className="flex flex-col gap-5">
            <p className="text-sm text-gray-body">
              Paste this into your editor&apos;s MCP config file. The JSON is the same for the editors below — only the file path changes.
              VS Code, Zed and Codex use their own format: see the{" "}
              <a href={`${GITHUB_URL}/tree/main/packages/hookli-mcp#client-specific-setup-guides`} className="text-accent underline underline-offset-2">
                setup guide
              </a>
              .
            </p>
            <CodeBlock code={UNIVERSAL_CONFIG} lang="json" title="mcp config" />

            {/* Where to put it */}
            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.05]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-body">Where to paste it</h4>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {[
                  { tool: "Cursor", path: ".cursor/mcp.json" },
                  { tool: "Antigravity", path: "~/.gemini/config/mcp_config.json" },
                  { tool: "Claude Desktop", path: "~/Library/Application Support/Claude/claude_desktop_config.json" },
                  { tool: "Windsurf", path: "~/.codeium/windsurf/mcp_config.json" },
                  { tool: "Cline", path: "cline_mcp_settings.json" },
                ].map((row) => (
                  <div key={row.tool} className="flex items-baseline gap-3 px-4 py-2.5">
                    <span className="text-xs font-medium text-fg whitespace-nowrap w-28 shrink-0">{row.tool}</span>
                    <code className="text-xs text-accent font-mono break-all">{row.path}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
        cliContent={
          <div className="flex flex-col gap-5">
            <p className="text-sm text-gray-body">
              For CLI-based agents, run a single command in your terminal:
            </p>

            <div>
              <h4 className="text-xs font-semibold text-fg mb-2">Claude Code</h4>
              <CodeBlock code="claude mcp add hookli -- npx -y hookli-mcp" lang="bash" title="Terminal" />
              <p className="text-xs text-gray-body mt-2">
                Scope to current repo only: <code className="text-accent font-mono text-xs bg-white/[0.04] px-1.5 py-0.5 rounded">claude mcp add --scope project hookli -- npx -y hookli-mcp</code>
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-fg mb-2">Verify</h4>
              <CodeBlock code="claude mcp list" lang="bash" title="Terminal" />
            </div>
          </div>
        }
        localContent={
          <div className="flex flex-col gap-5">
            <p className="text-sm text-gray-body">
              When developing inside the hookli monorepo or testing local changes, point directly to the built file:
            </p>
            <CodeBlock code={LOCAL_CONFIG} lang="json" title="mcp config (local)" />
          </div>
        }
      />

      {/* Autonomous CLI Agent Deep Dive */}
      <h2 className="mt-14 text-2xl font-semibold text-fg">How CLI Agents Work with hookli-mcp</h2>
      <p className="mt-2 text-sm text-gray-body">
        Unlike web chatbots where you copy-paste code, autonomous CLI agents (like <strong>Claude Code</strong>) execute the whole implementation cycle directly in your repository:
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5">
          <span className="flex size-6 items-center justify-center rounded-full bg-accent/15 font-mono text-xs font-semibold text-accent">1</span>
          <h3 className="mt-3 text-sm font-semibold text-fg">Intent & Discovery</h3>
          <p className="mt-2 text-xs leading-relaxed text-gray-body">
            You ask: <em>&ldquo;Add a debounced search bar that remembers the last query in localStorage.&rdquo;</em> The agent calls <code className="text-accent font-mono">suggest_hooks_for_task</code> to discover <code className="text-fg font-mono">useDebounce</code> and <code className="text-fg font-mono">useLocalStorage</code>.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5">
          <span className="flex size-6 items-center justify-center rounded-full bg-accent/15 font-mono text-xs font-semibold text-accent">2</span>
          <h3 className="mt-3 text-sm font-semibold text-fg">Signatures & SSR Guards</h3>
          <p className="mt-2 text-xs leading-relaxed text-gray-body">
            The agent invokes <code className="text-accent font-mono">get_hook</code> and <code className="text-accent font-mono">get_hook_source</code> to pull the exact signature and source, including its SSR guards, before writing a single line.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5">
          <span className="flex size-6 items-center justify-center rounded-full bg-accent/15 font-mono text-xs font-semibold text-accent">3</span>
          <h3 className="mt-3 text-sm font-semibold text-fg">Autonomous Code Writing</h3>
          <p className="mt-2 text-xs leading-relaxed text-gray-body">
            The CLI agent writes the component file, installs <code className="text-fg font-mono">hookli</code> if needed, and can verify the build with your project&apos;s typechecker.
          </p>
        </div>
      </div>

      {/* Available Tools Grid */}
      <h2 className="mt-14 text-2xl font-semibold text-fg">Available MCP Tools</h2>
      <p className="mt-2 text-sm text-gray-body">
        Once connected, your AI assistant will automatically invoke these 5 tools when you ask questions about React hooks:
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MCP_TOOLS.map((tool) => (
          <div
            key={tool.name}
            className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 transition-all duration-200 hover:bg-white/[0.04] hover:border-accent/25"
          >
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-accent" />
              <code className="font-mono text-xs font-semibold text-accent">{tool.name}</code>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-body">{tool.desc}</p>
          </div>
        ))}
      </div>

      {/* Prompting Guide */}
      <h2 className="mt-14 text-2xl font-semibold text-fg">How to Prompt Your AI</h2>
      <p className="mt-2 text-sm text-gray-body">
        You don&apos;t need to remember tool names. Simply talk to Claude Code, Cursor, or your CLI naturally:
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">Intent Search</span>
          <p className="mt-2 font-mono text-xs text-fg leading-relaxed">
            &quot;I need to close a dropdown whenever the user clicks outside or presses Escape.&quot;
          </p>
          <p className="mt-3 text-xs text-gray-body">
            AI calls <code className="text-accent font-mono">suggest_hooks_for_task</code> → recommends <code className="text-fg font-mono">useClickOutside</code> + <code className="text-fg font-mono">useKeyPress</code>.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">Debouncing & Persistence</span>
          <p className="mt-2 font-mono text-xs text-fg leading-relaxed">
            &quot;Create a search bar with 300ms debounce that stores the last query in localStorage.&quot;
          </p>
          <p className="mt-3 text-xs text-gray-body">
            AI calls <code className="text-accent font-mono">get_hook</code> → returns exact types for <code className="text-fg font-mono">useDebounceValue</code> and <code className="text-fg font-mono">useLocalStorage</code>.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">Modal & Scroll Lock</span>
          <p className="mt-2 font-mono text-xs text-fg leading-relaxed">
            &quot;Build a slide-over drawer and prevent background body scrolling when it opens.&quot;
          </p>
          <p className="mt-3 text-xs text-gray-body">
            AI calls <code className="text-accent font-mono">get_hook</code> for <code className="text-fg font-mono">useScrollLock</code> with SSR-safe cleanup.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">Library Migration</span>
          <p className="mt-2 font-mono text-xs text-fg leading-relaxed">
            &quot;Replace react-use useDebounce in this component with hookli.&quot;
          </p>
          <p className="mt-3 text-xs text-gray-body">
            AI calls <code className="text-accent font-mono">get_hook</code> to map legacy arguments to hookli&apos;s clean API.
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl p-6 border border-white/[0.06] bg-ground-raised/80">
        <div>
          <h3 className="text-base font-semibold text-fg">Explore All {HOOKS.length} Hooks</h3>
          <p className="mt-1 text-sm text-gray-body">
            Check out live interactive previews, parameters, and full TypeScript source code.
          </p>
        </div>
        <Link
          href="/docs"
          className="flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-ground shadow-md shadow-accent/25 transition-all hover:bg-accent-hover active:scale-95 shrink-0"
        >
          <span>Browse Docs Index</span>
          <ArrowRightIcon className="size-4 text-ground" />
        </Link>
      </div>
    </div>
  );
}
