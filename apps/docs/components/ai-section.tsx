import { CopyButton } from "@/components/copy-button";
import { SectionHeading } from "@/components/section-heading";
import { BracesIcon, CopyIcon, ExternalLinkIcon } from "@/components/icons";
import { buildLlmsIndex } from "@/lib/llms";
import { HOOKS } from "@/lib/hooks-registry";
import { SITE_URL } from "@/lib/site";

/* Landing section that surfaces the AI-friendly surfaces (llms.txt, per-hook
   Copy-for-AI, Open-in-ChatGPT/Claude) so visitors know the docs are built to
   be read by a model, not just a human. Server component: the /llms.txt body
   is built once from the registry and handed to the client CopyButton leaf. */

const CARDS = [
  {
    Icon: BracesIcon,
    title: "One file, the whole library",
    body: (
      <>
        Point any model at{" "}
        <code className="text-sm">/llms.txt</code> for the map, or{" "}
        <code className="text-sm">/llms-full.txt</code> for every signature,
        usage and source — generated from the same registry the docs use.
      </>
    ),
  },
  {
    Icon: CopyIcon,
    title: "Copy any hook for AI",
    body: (
      <>
        Every hook page has a one-click <strong className="text-fg">Copy for AI</strong> —
        clean Markdown, ready to paste into your chat and start building.
      </>
    ),
  },
  {
    Icon: ExternalLinkIcon,
    title: "Straight into your chat",
    body: (
      <>
        Jump into ChatGPT or Claude prefilled with the hook&apos;s context and a
        live docs link. Your AI pair is in the loop from line one.
      </>
    ),
  },
];

export function AiSection() {
  const llmsIndex = buildLlmsIndex();
  const prompt = `I'm using hookli, a zero-dependency, typed, SSR-safe React hooks library (${HOOKS.length} hooks). Full reference: ${SITE_URL}/llms-full.txt — help me pick and use the right hooks for my app.`;
  const chatgptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
  const linkClass =
    "inline-flex min-h-11 items-center gap-1.5 text-sm text-gray-body underline-offset-4 transition-colors duration-200 hover:text-fg hover:underline";

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="AI-ready"
        title="Bring your AI — it speaks hookli"
        subtitle={
          <>
            Vibe-coding with an LLM? hookli ships a machine-readable map of all{" "}
            {HOOKS.length} hooks, so your assistant recommends and wires them up
            correctly — no stale copy-paste.
          </>
        }
      />

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {CARDS.map(({ Icon, title, body }) => (
          <div key={title} className="surface flex flex-col gap-4 rounded-xl p-6">
            <span
              aria-hidden="true"
              className="surface flex size-11 items-center justify-center rounded-lg text-accent"
            >
              <Icon className="size-5" />
            </span>
            <h3 className="text-base font-semibold text-fg">{title}</h3>
            <p className="text-sm text-gray-body">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-x-6 gap-y-3 sm:flex-row sm:flex-wrap">
        <CopyButton
          text={llmsIndex}
          copyLabel="Copy llms.txt"
          label="Copy the hookli llms.txt index to your clipboard"
        />
        <a href="/llms.txt" className={linkClass}>
          <BracesIcon className="size-4" aria-hidden="true" />
          View /llms.txt
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
      </div>
    </section>
  );
}
