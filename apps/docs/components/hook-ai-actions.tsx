import { CopyButton } from "@/components/copy-button";
import { ExternalLinkIcon, SparklesIcon } from "@/components/icons";
import { hookDocUrl, hookToMarkdown } from "@/lib/hook-markdown";
import type { HookEntry } from "@/lib/hooks-registry";

/* AI actions card — compact surface card sitting below the import snippet.
   Shows Copy for AI, Open in ChatGPT, Open in Claude. */

export function HookAiActions({ hook }: { hook: HookEntry }) {
  const markdown = hookToMarkdown(hook);
  const docUrl = hookDocUrl(hook.slug);
  const prompt = `I'm using the ${hook.name} React hook from the hookli library. Explain what it does and show me how to use it. Reference: ${docUrl}`;
  const chatgptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

  return (
    <div className="surface mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3">
      {/* Label */}
      <div className="flex items-center gap-2 text-sm text-gray-body">
        <SparklesIcon className="size-4 shrink-0 text-accent" aria-hidden="true" />
        <span>Use with AI</span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton
          text={markdown}
          copyLabel="Copy docs"
          label={`Copy ${hook.name} documentation as Markdown for AI`}
        />

        <a
          href={chatgptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-gray-outline px-3 text-sm text-gray-body transition-colors duration-200 hover:border-accent hover:text-accent"
        >
          ChatGPT
          <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
        </a>

        <a
          href={claudeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-gray-outline px-3 text-sm text-gray-body transition-colors duration-200 hover:border-accent hover:text-accent"
        >
          Claude
          <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
        </a>

        <a
          href={`/docs/${hook.slug}/llms.txt`}
          className="hidden text-sm text-gray-body underline-offset-4 hover:text-fg hover:underline sm:inline"
        >
          .txt
        </a>
      </div>
    </div>
  );
}
