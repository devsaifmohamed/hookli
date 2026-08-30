import { CopyButton } from "@/components/copy-button";
import { ExternalLinkIcon } from "@/components/icons";
import { hookDocUrl, hookToMarkdown } from "@/lib/hook-markdown";
import type { HookEntry } from "@/lib/hooks-registry";

/* The "Copy for AI" row under each hook's summary. Renders the hook's Markdown
   (from the shared renderer) into the clipboard via the labeled CopyButton
   variant — the same single clipboard implementation the code blocks use — and
   offers to open the same context in ChatGPT or Claude, plus a raw-Markdown
   link (the /docs/<slug>/llms.txt twin). Server component: the Markdown is built
   at render time and handed to the client CopyButton leaf as a string. */

const linkClass =
  "inline-flex min-h-11 items-center gap-1 rounded-md text-accent underline-offset-4 transition-colors duration-200 hover:text-accent-hover hover:underline";

export function HookAiActions({ hook }: { hook: HookEntry }) {
  const markdown = hookToMarkdown(hook);
  const docUrl = hookDocUrl(hook.slug);
  const prompt = `I'm using the ${hook.name} React hook from the hookli library. Explain what it does and show me how to use it. Reference: ${docUrl}`;
  const chatgptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

  return (
    <div
      role="group"
      aria-label={`Use ${hook.name} with AI`}
      className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      <CopyButton
        text={markdown}
        copyLabel="Copy for AI"
        label={`Copy for AI: ${hook.name} documentation as Markdown`}
      />
      <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <a href={`/docs/${hook.slug}/llms.txt`} className={linkClass}>
          View as Markdown
        </a>
        <a
          href={chatgptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Open in ChatGPT
          <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
        </a>
        <a
          href={claudeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Open in Claude
          <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
        </a>
      </span>
    </div>
  );
}
