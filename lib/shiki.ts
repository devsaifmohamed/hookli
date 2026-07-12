import { codeToHtml, createCssVariablesTheme, type ShikiTransformer } from "shiki";

/* Server-only highlighter. The css-variables theme emits var(--shiki-*) colors,
   mapped to brand tokens in globals.css (docs/DESIGN.md §5 CodeBlock). */
const cssVariablesTheme = createCssVariablesTheme({
  name: "hookli",
  variablePrefix: "--shiki-",
});

export type CodeLang = "tsx" | "ts" | "bash";

export type HighlightOptions = {
  /* Gutter line numbers (Usage snippets — T16 usehooks-ts anatomy). */
  lineNumbers?: boolean;
  /* 1-based line to emphasise — the hook-call line in a Usage snippet. */
  highlightLine?: number;
};

export function highlight(
  code: string,
  lang: CodeLang = "tsx",
  { lineNumbers = false, highlightLine }: HighlightOptions = {},
) {
  const transformers: ShikiTransformer[] = [];

  if (lineNumbers) {
    transformers.push({
      pre(node) {
        this.addClassToHast(node, "line-numbers");
      },
    });
  }

  if (highlightLine) {
    transformers.push({
      line(node, line) {
        if (line === highlightLine) this.addClassToHast(node, "highlighted-line");
      },
    });
  }

  return codeToHtml(code.trim(), { lang, theme: cssVariablesTheme, transformers });
}
