import { CopyButton } from "@/components/copy-button";
import { highlight, type CodeLang } from "@/lib/shiki";

/* Frameless highlighted code — the pane inside CodeBlock, also used bare as the
   Code tab of HookDemo (whose frame already owns the surface). Usage snippets
   pass `lineNumbers` + `highlightLine` for the usehooks-ts gutter treatment
   (T16); the styles live in globals.css keyed off shiki's .line class. */
export async function HighlightedCode({
  code,
  lang = "tsx",
  lineNumbers = false,
  highlightLine,
  className = "",
}: {
  code: string;
  lang?: CodeLang;
  lineNumbers?: boolean;
  highlightLine?: number;
  className?: string;
}) {
  const html = await highlight(code, lang, { lineNumbers, highlightLine });

  return (
    <div
      className={`overflow-x-auto p-4 text-sm leading-relaxed [&_pre]:outline-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/* Server component — highlighting happens at build/render time, zero client JS
   beyond the CopyButton. Frame per docs/DESIGN.md §4: ground-raised, slate/40
   border, 12px radius. */
export function CodeBlock({
  code,
  lang = "tsx",
  title,
  lineNumbers = false,
  highlightLine,
  className = "",
}: {
  code: string;
  lang?: CodeLang;
  title?: string;
  lineNumbers?: boolean;
  highlightLine?: number;
  className?: string;
}) {
  return (
    <figure
      className={`overflow-hidden rounded-xl border border-slate-syntax/40 bg-ground-raised ${className}`}
    >
      <figcaption className="flex items-center justify-between border-b border-slate-syntax/40 py-1 pl-4 pr-1">
        <span className="font-mono text-xs text-gray-body">
          {title ?? lang}
        </span>
        <CopyButton text={code.trim()} label={`Copy ${title ?? "code"}`} />
      </figcaption>
      <HighlightedCode
        code={code}
        lang={lang}
        lineNumbers={lineNumbers}
        highlightLine={highlightLine}
      />
    </figure>
  );
}
