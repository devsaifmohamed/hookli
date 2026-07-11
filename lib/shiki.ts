import { codeToHtml, createCssVariablesTheme } from "shiki";

/* Server-only highlighter. The css-variables theme emits var(--shiki-*) colors,
   mapped to brand tokens in globals.css (docs/DESIGN.md §5 CodeBlock). */
const cssVariablesTheme = createCssVariablesTheme({
  name: "hookli",
  variablePrefix: "--shiki-",
});

export type CodeLang = "tsx" | "ts" | "bash";

export function highlight(code: string, lang: CodeLang = "tsx") {
  return codeToHtml(code.trim(), { lang, theme: cssVariablesTheme });
}
