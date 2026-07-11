import { CopyButton } from "@/components/CopyButton";
import { highlight, type CodeLang } from "@/lib/shiki";

/* Server component — highlighting happens at build/render time, zero client JS
   beyond the CopyButton. Frame per docs/DESIGN.md §4: ground-raised, slate/40
   border, 12px radius. */
export async function CodeBlock({
  code,
  lang = "tsx",
  title,
  className = "",
}: {
  code: string;
  lang?: CodeLang;
  title?: string;
  className?: string;
}) {
  const html = await highlight(code, lang);

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
      <div
        className="overflow-x-auto p-4 text-sm leading-relaxed [&_pre]:outline-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
