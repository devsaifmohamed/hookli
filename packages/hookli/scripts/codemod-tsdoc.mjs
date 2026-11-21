// One-off codemod for docs/plans/2026-11-21-single-source.md (PRs 3a to 3g): moves each
// hook's facts from apps/docs/lib/hook-docs.ts and hooks.manifest.json into the TSDoc of
// its own file, in the format build-catalog.mjs reads (§1).
//
//   node scripts/codemod-tsdoc.mjs use-toggle use-form …
//
// Per hook:
// - summary and details: the existing JSDoc wording is kept; a hook without one gets the
//   manifest description.
// - @category and @keywords: from the manifest.
// - @param, @returns, type-field and alias text: the docs table text wins.
// - usage and examples: `@example Usage`, then one `@example <title>` per docs example.
// - Types are never edited. Anything it can't place is printed as a warning to hand-fix.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOOK_DOCS = path.resolve(PACKAGE_ROOT, "../../apps/docs/lib/hook-docs.ts");
const WIDTH = 100;
const TAG_NAME = /^(?:\[\d+\] )?[\w$.]+$/;
// Tags the codemod writes. Any other tag on an existing comment is kept as it is.
const OWN_TAGS = new Set(["category", "keywords", "param", "returns", "return", "example"]);

/** The docs entry for a slug, from hook-docs.ts run in a sandbox (demo imports stubbed). */
export function loadHookDocs(file = HOOK_DOCS) {
  const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const module = { exports: {} };
  const demoModule = new Proxy({}, { get: (_, name) => String(name) });
  vm.runInNewContext(outputText, { module, exports: module.exports, require: () => demoModule });
  return (slug) => module.exports.getHookDoc(slug);
}

export const loadManifest = (root = PACKAGE_ROOT) =>
  JSON.parse(fs.readFileSync(path.join(root, "hooks.manifest.json"), "utf8")).hooks;

/** Greedy word wrap; the first line is `width - first` wide, the rest `width - rest`. */
function wrap(text, first, rest) {
  const lines = [];
  let line = "";
  for (const word of text.replace(/\s+/g, " ").trim().split(" ")) {
    const limit = WIDTH - (lines.length ? rest : first);
    if (line && line.length + 1 + word.length > limit) lines.push(line), (line = word);
    else line = line ? `${line} ${word}` : word;
  }
  return [...lines, line];
}

/** A TSDoc block at `indent`; one line (`/** text *\/`) when it fits. */
function block(lines, indent) {
  if (lines.some((l) => l.includes("*/"))) throw new Error(`"*/" can't go in a TSDoc comment: ${lines.join(" ")}`);
  if (lines.length === 1 && indent.length + lines[0].length + 7 <= WIDTH) return `/** ${lines[0]} */`;
  return ["/**", ...lines.map((l) => ` *${l ? ` ${l}` : ""}`), " */"].join(`\n${indent}`);
}

/** A tag with its text wrapped; continuation lines are indented two spaces. */
function tag(head, text, indent) {
  const prefix = indent.length + 3;
  const [first, ...rest] = wrap(`${head}${text ? ` ${text}` : ""}`, prefix, prefix + 2);
  return [first, ...rest.map((l) => `  ${l}`)];
}

const codeBlock = (code) => ["```tsx", ...code.replace(/^\n+|\s+$/g, "").split("\n"), "```"];

const sentence = (text) => (/[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`);

/** The comment's description lines and other tags, as written. */
function splitComment(jsDoc) {
  if (!jsDoc) return { description: [], keptTags: [] };
  const lines = jsDoc
    .getText()
    .replace(/^\/\*\*/, "")
    .replace(/\*\/$/, "")
    .split("\n")
    .map((l) => l.replace(/^\s*\* ?/, "").trimEnd());
  const firstTag = lines.findIndex((l) => /^@\w+/.test(l.trim()));
  const description = (firstTag < 0 ? lines : lines.slice(0, firstTag)).join("\n").trim();
  const keptTags = [];
  for (const line of firstTag < 0 ? [] : lines.slice(firstTag)) {
    const name = /^@(\w+)/.exec(line.trim())?.[1];
    if (name) keptTags.push({ keep: !OWN_TAGS.has(name), lines: [line] });
    else keptTags.at(-1).lines.push(line);
  }
  return { description: description ? description.split("\n") : [], keptTags: keptTags.filter((t) => t.keep).flatMap((t) => t.lines) };
}

const lastJsDoc = (node) => ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc).at(-1);
const indentOf = (sf, node) => /^[ \t]*/.exec(sf.text.slice(sf.text.lastIndexOf("\n", node.getStart(sf)) + 1))[0];

/** Replaces the node's TSDoc, or inserts one above it. */
function commentEdit(sf, node, jsDocNode, comment) {
  const jsDoc = lastJsDoc(jsDocNode);
  if (jsDoc) return { start: jsDoc.getStart(sf), end: jsDoc.end, text: comment };
  const start = node.getStart(sf);
  return { start, end: start, text: `${comment}\n${indentOf(sf, node)}` };
}

function findHook(sf, name) {
  for (const statement of sf.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name?.text === name) return { node: statement, docNode: statement };
    if (ts.isVariableStatement(statement)) {
      const decl = statement.declarationList.declarations.find((d) => ts.isIdentifier(d.name) && d.name.text === name);
      if (decl) return { node: statement, docNode: decl };
    }
  }
  return undefined;
}

function findMember(members, rowName) {
  const [head, ...rest] = rowName.split(".");
  const member = members.find((m) => {
    if (rowName === "(...args)") return ts.isCallSignatureDeclaration(m);
    if (ts.isIndexSignatureDeclaration(m)) return `[${m.parameters.map((p) => p.getText()).join(", ")}]` === rowName;
    return m.name?.getText() === head;
  });
  if (!rest.length || !member) return member;
  return member.type && ts.isTypeLiteralNode(member.type) ? findMember(member.type.members, rest.join(".")) : undefined;
}

/** The hook's own TSDoc block. */
function hookComment(sf, hook, entry, doc, warn) {
  const indent = indentOf(sf, hook.node);
  const { description, keptTags } = splitComment(lastJsDoc(hook.docNode));
  const lines = description.length ? [...description] : wrap(sentence(entry.description), indent.length + 3, indent.length + 3);
  lines.push("", `@category ${entry.category}`, ...tag("@keywords", entry.keywords.join(", "), indent));

  const fn = ts.isFunctionDeclaration(hook.docNode) ? hook.docNode : hook.docNode.initializer;
  const codeParams = (fn && "parameters" in fn ? fn.parameters : []).map((p) => (ts.isIdentifier(p.name) ? p.name.text : null));
  doc.parameters.forEach((row, i) => {
    if (codeParams[i] !== null && codeParams[i] !== row.name) warn(`docs parameter "${row.name}" is "${codeParams[i] ?? "missing"}" in the code`);
    lines.push(...tag(`@param ${row.name} -`, row.description, indent));
  });
  if (codeParams.length > doc.parameters.length) warn(`code has ${codeParams.length} parameters, the docs ${doc.parameters.length}`);

  for (const row of doc.returns) {
    if (!TAG_NAME.test(row.name)) warn(`returns row "${row.name}" is not a valid @returns name: rename it by hand`);
    lines.push(...tag(`@returns ${row.name} -`, row.description, indent));
  }
  lines.push(...keptTags);

  const examples = [{ title: "Usage", code: doc.usage }, ...(doc.examples ?? [])];
  for (const example of examples) {
    lines.push("", `@example ${example.title}`);
    if (example.description) lines.push(...wrap(example.description, indent.length + 3, indent.length + 3));
    lines.push(...codeBlock(example.code));
  }
  return block(lines, indent);
}

/** Edits for one docs type alias: its own TSDoc and each row's. */
function aliasEdits(sf, alias, warn) {
  const name = alias.name.split("<")[0];
  const decl = sf.statements.find((s) => (ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s)) && s.name.text === name);
  if (!decl) return warn(`type alias "${alias.name}" is not declared in this file: hand-fix`), [];
  const indent = indentOf(sf, decl);
  const { keptTags } = splitComment(lastJsDoc(decl));
  const members = ts.isInterfaceDeclaration(decl) ? decl.members : ts.isTypeLiteralNode(decl.type) ? decl.type.members : undefined;

  if (!members) {
    // A union or tuple: the alias text is the summary, the `value` row's text the rest.
    const value = alias.rows.find((r) => r.name === "value");
    if (alias.rows.length !== 1 || !value) warn(`type alias "${alias.name}" is not an object: expected one "value" row`);
    const text = [...wrap(sentence(alias.description ?? ""), indent.length + 3, indent.length + 3)];
    if (value?.description) text.push("", ...wrap(value.description, indent.length + 3, indent.length + 3));
    return [commentEdit(sf, decl, decl, block([...text, ...keptTags], indent))];
  }

  const edits = alias.description ? [commentEdit(sf, decl, decl, block([...wrap(alias.description, indent.length + 3, indent.length + 3), ...keptTags], indent))] : [];
  for (const row of alias.rows) {
    const member = findMember(members, row.name);
    if (!member) {
      warn(`type alias "${alias.name}" has no member "${row.name}"`);
      continue;
    }
    const memberIndent = indentOf(sf, member);
    const text = row.defaultValue ? `${row.description} Defaults to \`${row.defaultValue}\`.` : row.description;
    edits.push(commentEdit(sf, member, member, block(wrap(text, memberIndent.length + 4, memberIndent.length + 3), memberIndent)));
  }
  return edits;
}

export function codemod(slug, { getDoc, manifest, root = PACKAGE_ROOT }) {
  const warnings = [];
  const warn = (message) => warnings.push(`${slug}: ${message}`);
  const entry = manifest.find((h) => h.slug === slug);
  const doc = getDoc(slug);
  if (!entry || !doc) throw new Error(`${slug}: ${entry ? "no hook-docs.ts entry" : "not in hooks.manifest.json"}`);

  const file = path.join(root, "src", "hooks", slug, `${slug}.ts`);
  const source = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const hook = findHook(sf, entry.name);
  if (!hook) throw new Error(`${slug}: no top-level declaration of ${entry.name}`);

  const edits = [commentEdit(sf, hook.node, hook.docNode, hookComment(sf, hook, entry, doc, warn)), ...(doc.typeAliases ?? []).flatMap((a) => aliasEdits(sf, a, warn))];
  const output = edits.sort((a, b) => b.start - a.start).reduce((text, e) => text.slice(0, e.start) + e.text + text.slice(e.end), source);
  fs.writeFileSync(file, output);
  return warnings;
}

function main(slugs) {
  if (!slugs.length) {
    console.error("usage: node scripts/codemod-tsdoc.mjs <slug> [<slug> …]");
    process.exitCode = 1;
    return;
  }
  const options = { getDoc: loadHookDocs(), manifest: loadManifest() };
  const warnings = slugs.flatMap((slug) => codemod(slug, options));
  console.log(`codemod-tsdoc: ${slugs.length} hook(s) rewritten`);
  if (warnings.length) console.warn(`codemod-tsdoc: ${warnings.length} warning(s) to hand-fix\n  ${warnings.join("\n  ")}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
