// Builds generated/catalog.json, one record per hook with every fact about it, from
// the hooks' own code and TSDoc (docs/plans/2026-11-21-single-source.md, §1 to §3).
// It walks the real exports of src/index.ts with the TypeScript type checker, so the
// catalog is exactly the public API. Signatures and types are the code's own source
// text with whitespace normalised, never re-printed by TypeScript.
//
//   node scripts/build-catalog.mjs               list problems, exit 0
//   node scripts/build-catalog.mjs --strict      exit 1 on any problem
//   node scripts/build-catalog.mjs --manifest    also write hooks.manifest.json (the public `hookli/manifest`)
//   node scripts/build-catalog.mjs --readme      also write the README hook index and count, and its repo-root mirror
//   node scripts/build-catalog.mjs --root <dir>  build another package root (fixture tests)
//
// It always writes generated/catalog.json. Every file is written only when its content changed.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Where the package sits in the repo, for each hook's repo-relative `sourcePath`.
const PACKAGE_DIR = "packages/hookli";
const HOOK_NAME = /^use[A-Z0-9]/;
const SIBLING_HOOK = /^\.\.\/(use-[a-z0-9-]+)$/;
// `@returns name - text`, or `@returns [0] name - text` for a tuple member.
const RETURNS_TAG = /^(?:\[(\d+)\]\s+)?([\w$.]+)\s+-\s+([\s\S]*)$/;
const DEFAULTS_TO = /\s*Defaults to\s+(`[^`]*`|\S+?)\.?(?=\s|$)/;

export const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const flat = (value) => value.replace(/\s+/g, " ").trim();
// Text the `new:hook` starter writes, which must be replaced before the hook ships.
const PLACEHOLDER = /\bTODO\b/;
const readJson = (file, fallback) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback);

/** The library's compiler options (its tsconfig.json), or strict defaults for a root without one. */
export function compilerOptions(root) {
  const configPath = path.join(root, "tsconfig.json");
  if (!fs.existsSync(configPath)) {
    return { strict: true, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.CommonJS, skipLibCheck: true, esModuleInterop: true, noEmit: true };
  }
  const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
  return { ...ts.parseJsonConfigFileContent(config, ts.sys, root).options, noEmit: true };
}

// ---------------------------------------------------------------------------
// Source text, normalised: comments dropped, whitespace collapsed, no space inside
// brackets, no leading `|` / `&` of a multi-line union, no trailing commas.

const TRIVIA = new Set([
  ts.SyntaxKind.WhitespaceTrivia,
  ts.SyntaxKind.NewLineTrivia,
  ts.SyntaxKind.SingleLineCommentTrivia,
  ts.SyntaxKind.MultiLineCommentTrivia,
]);
const NO_SPACE_AFTER = new Set(["(", "[", "<"]);
const NO_SPACE_BEFORE = new Set([")", "]", ">", ",", ";"]);
const CLOSERS = new Set([")", "]", ">", "}"]);
const BEFORE_LEADING_OPERATOR = new Set(["(", "<", "[", ":", "=", ",", "=>", "extends", "|", "&"]);

export function normalise(source) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, source);
  const tokens = [];
  let gap = false;
  for (let kind = scanner.scan(); kind !== ts.SyntaxKind.EndOfFileToken; kind = scanner.scan()) {
    if (TRIVIA.has(kind)) gap = true;
    else tokens.push({ text: scanner.getTokenText(), gap }), (gap = false);
  }
  const kept = [];
  tokens.forEach((token, i) => {
    const previous = kept.at(-1)?.text;
    const next = tokens[i + 1]?.text;
    const leadingOperator = (token.text === "|" || token.text === "&") && (previous === undefined || BEFORE_LEADING_OPERATOR.has(previous));
    const trailingSeparator = (token.text === "," && CLOSERS.has(next)) || (token.text === ";" && next === "}");
    if (leadingOperator || trailingSeparator) {
      if (tokens[i + 1]) tokens[i + 1].gap ||= token.gap;
    } else kept.push(token);
  });
  return kept
    .map((token, i) => {
      const space = i > 0 && token.gap && !NO_SPACE_AFTER.has(kept[i - 1].text) && !NO_SPACE_BEFORE.has(token.text);
      return (space ? " " : "") + token.text;
    })
    .join("");
}

const text = (node) => normalise(node.getText());
const typeParams = (node) => (node.typeParameters?.length ? `<${node.typeParameters.map(text).join(", ")}>` : "");
const callText = (sig) => `${typeParams(sig)}(${sig.parameters.map(text).join(", ")}) => ${sig.type ? text(sig.type) : "any"}`;

// ---------------------------------------------------------------------------
// TSDoc: the comment is split here rather than by TypeScript's JSDoc parser, so code
// blocks inside `@example` keep their exact lines and indentation.

export function parseDoc(raw) {
  const lines = raw
    .replace(/^\/\*\*/, "")
    .replace(/\*\/$/, "")
    .split("\n")
    .map((line) => line.replace(/^\s*\* ?/, "").trimEnd());
  const description = [];
  const tags = [];
  let inFence = false;
  for (const line of lines) {
    const tag = !inFence && /^@(\w+)\s*(.*)$/.exec(line.trim());
    if (line.trim().startsWith("```")) inFence = !inFence;
    if (tag) tags.push({ tag: tag[1], text: tag[2] });
    else if (tags.length) tags.at(-1).text += `\n${line}`;
    else description.push(line);
  }
  return { description: description.join("\n").trim(), tags: tags.map((t) => ({ tag: t.tag, text: t.text.trim() })) };
}

const readDoc = (node) => parseDoc(ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc).at(-1)?.getText() ?? "");
const tagsOf = (doc, ...names) => doc.tags.filter((t) => names.includes(t.tag));

/** First sentence of the first paragraph, and everything after it. */
export function splitSummary(description) {
  const [first = "", ...rest] = description.split(/\n\s*\n/).filter((p) => p.trim());
  const sentence = flat(first);
  let end = sentence.length;
  let ticks = 0;
  for (let i = 0; i < sentence.length; i++) {
    if (sentence[i] === "`") ticks++;
    const closes = /[.!?]/.test(sentence[i]) && (i === sentence.length - 1 || /^ [A-Z"`'(]/.test(sentence.slice(i + 1, i + 3)));
    if (ticks % 2 === 0 && closes && !/\b(e\.g|i\.e|etc|vs)$/.test(sentence.slice(0, i))) {
      end = i + 1;
      break;
    }
  }
  // Soft-wrapped prose is joined; lists and code blocks keep their lines.
  const paragraph = (p) => (/^(\s*([-*+]|\d+\.)\s|```)/m.test(p) ? p.trim() : flat(p));
  const details = [sentence.slice(end).trim(), ...rest.map(paragraph)].filter(Boolean).join("\n\n");
  return { summary: sentence.slice(0, end), details };
}

/** A type member's own TSDoc: `Defaults to …` becomes `defaultValue`. */
function memberDoc(node) {
  const description = flat(readDoc(node).description);
  const match = DEFAULTS_TO.exec(description);
  if (!match) return { defaultValue: null, description };
  return { defaultValue: match[1].replace(/^`|`$/g, ""), description: flat(description.replace(match[0], " ")) };
}

function parseExample(tagText) {
  const lines = tagText.split("\n");
  const hasTitle = !lines[0].trim().startsWith("```");
  const title = hasTitle ? lines[0].trim() : "";
  const body = hasTitle ? lines.slice(1) : lines;
  const open = body.findIndex((l) => l.trim().startsWith("```"));
  const close = open < 0 ? -1 : body.findIndex((l, i) => i > open && l.trim().startsWith("```"));
  if (open < 0 || close < 0) return { title, description: flat(body.join(" ")), code: "" };
  return { title, description: flat(body.slice(0, open).join(" ")), code: body.slice(open + 1, close).join("\n") };
}

// ---------------------------------------------------------------------------
// Types reached from a hook's signature and return type.

// An optional member (`name?:`) carries `optional: true`; its type stays as written.
function memberRows(members, prefix = "") {
  return members.flatMap((member) => {
    const doc = { ...memberDoc(member), ...(member.questionToken && { optional: true }) };
    if (ts.isCallSignatureDeclaration(member)) return [{ name: "(...args)", type: callText(member), ...doc }];
    if (ts.isIndexSignatureDeclaration(member)) {
      return [{ name: `[${member.parameters.map(text).join(", ")}]`, type: text(member.type), ...doc }];
    }
    if (!member.name) return [];
    const name = prefix + member.name.getText();
    if (ts.isMethodSignature(member)) return [{ name, type: callText(member), ...doc }];
    if (ts.isPropertySignature(member) && member.type && ts.isTypeLiteralNode(member.type)) {
      return memberRows(member.type.members, `${name}.`);
    }
    return [{ name, type: member.type ? text(member.type) : "any", ...doc }];
  });
}

function aliasRecord(decl) {
  const doc = readDoc(decl);
  const generics = decl.typeParameters?.length ? `<${decl.typeParameters.map((t) => t.name.text).join(", ")}>` : "";
  const name = decl.name.text + generics;
  const body = ts.isInterfaceDeclaration(decl) ? decl : decl.type;
  if (ts.isInterfaceDeclaration(body) || ts.isTypeLiteralNode(body)) {
    return { name, description: flat(doc.description), rows: memberRows(body.members) };
  }
  // A union (or any other non-object type) is one `value` row. The alias keeps the
  // summary; the rest of its TSDoc describes the row.
  const { summary, details } = splitSummary(doc.description);
  return { name, description: summary, rows: [{ name: "value", type: text(body), defaultValue: null, description: details }] };
}

// ---------------------------------------------------------------------------

export function buildCatalog(packageRoot = PACKAGE_ROOT) {
  const root = fs.realpathSync(packageRoot);
  const srcDir = path.join(root, "src");
  const hooksDir = path.join(srcDir, "hooks");
  const inSrc = (file) => path.resolve(file).startsWith(srcDir + path.sep);
  const categories = readJson(path.join(root, "catalog", "categories.json"), []);
  const removed = readJson(path.join(root, "catalog", "removed-hooks.json"), []);
  const { version: libraryVersion } = readJson(path.join(root, "package.json"), {});

  const program = ts.createProgram([path.join(srcDir, "index.ts")], compilerOptions(root));
  const checker = program.getTypeChecker();
  const entry = checker.getSymbolAtLocation(program.getSourceFile(path.join(srcDir, "index.ts")));
  const exports = entry ? checker.getExportsOfModule(entry) : [];

  const problems = [];
  const report = (subject, field, problem) => problems.push(`${subject}: ${field}: ${problem}`);
  const resolve = (symbol) => (symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol);

  /** The interface or type alias a type name points at, when it is the library's own. A
      global type that src/ only augments (`WindowEventMap`) is not. */
  const localTypeDecl = (nameNode) => {
    const declarations = resolve(checker.getSymbolAtLocation(nameNode))?.declarations ?? [];
    if (!declarations.length || !declarations.every((d) => inSrc(d.getSourceFile().fileName))) return undefined;
    return declarations.find((d) => ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d));
  };

  /** Local types reached from `nodes`, transitively, in first-seen order. */
  function reachableTypes(nodes) {
    const seen = new Set();
    const visit = (node) => {
      const nameNode = ts.isTypeReferenceNode(node) ? node.typeName : ts.isExpressionWithTypeArguments(node) ? node.expression : null;
      const decl = nameNode && localTypeDecl(nameNode);
      if (decl && !seen.has(decl)) {
        seen.add(decl);
        ts.forEachChild(decl, visit);
      }
      ts.forEachChild(node, visit);
    };
    nodes.forEach(visit);
    return [...seen].map(aliasRecord);
  }

  /** Follows a return type node through local aliases to its object, interface or tuple. */
  const shapeOf = (node) => {
    while (node && ts.isParenthesizedTypeNode(node)) node = node.type;
    if (node && ts.isTypeReferenceNode(node)) {
      const decl = localTypeDecl(node.typeName);
      if (decl) return ts.isInterfaceDeclaration(decl) ? decl : shapeOf(decl.type);
    }
    return node;
  };

  /** One `@returns` row: its type is the tuple member, the property, or the whole return type.
      A lone row whose name is not a property describes the whole return (`useQueue`). */
  function returnRow(slug, tag, returnType, lone) {
    const match = RETURNS_TAG.exec(tag.text);
    const whole = returnType ? text(returnType) : "";
    if (!match) {
      report(slug, "returns", `write "@returns name - text" (or "@returns [0] name - text" for a tuple member), got "${flat(tag.text)}"`);
      return { name: "", type: whole, description: flat(tag.text) };
    }
    const [, index, name, description] = match;
    const row = { name: index === undefined ? name : `[${index}] ${name}`, type: whole, description: flat(description) };
    const shape = shapeOf(returnType);
    const resolved = returnType && checker.getTypeFromTypeNode(returnType);
    if (index !== undefined) {
      const element = shape && ts.isTupleTypeNode(shape) ? shape.elements[Number(index)] : undefined;
      const fromChecker = resolved && checker.isTupleType(resolved) ? checker.getTypeArguments(resolved)[Number(index)] : undefined;
      if (element) row.type = text(ts.isNamedTupleMember(element) ? element.type : element);
      else if (fromChecker) row.type = checker.typeToString(fromChecker);
      else report(slug, "returns", `"[${index}] ${name}": the return type has no tuple member ${index}`);
      return row;
    }
    const members = shape && (ts.isInterfaceDeclaration(shape) || ts.isTypeLiteralNode(shape)) ? shape.members : undefined;
    const member = members?.find((m) => m.name?.getText() === name);
    const property = !member && resolved?.getProperty(name);
    if (member) row.type = ts.isMethodSignature(member) ? callText(member) : member.type ? text(member.type) : "any";
    else if (property) row.type = checker.typeToString(checker.getTypeOfSymbolAtLocation(property, returnType));
    else if (members && !lone) report(slug, "returns", `"${name}" is not a property of the return type`);
    return row;
  }

  /** Return rows come from the code: every member of an object return, every element of a
      tuple return (named by its label or its `@returns [i] name` tag). A row's text is its
      `@returns` tag, else the member's own TSDoc, else empty. Any other return is described
      by its tags only, so it needs one unless it is `void`. */
  function returnRows(slug, tags, returnType) {
    const rows = tags.map((tag) => returnRow(slug, tag, returnType, tags.length === 1));
    const shape = shapeOf(returnType);
    if (shape && (ts.isInterfaceDeclaration(shape) || ts.isTypeLiteralNode(shape))) {
      const own = memberRows(shape.members);
      // A lone tag that names no member describes the whole return (`useQueue`).
      if (rows.length === 1 && !own.some((r) => r.name === rows[0].name)) return rows;
      return own.map(({ name, type, description }) => ({ name, type, description: rows.find((r) => r.name === name)?.description || description }));
    }
    if (shape && ts.isTupleTypeNode(shape)) {
      return shape.elements.map((element, i) => {
        const tagged = rows.find((r) => r.name.startsWith(`[${i}] `));
        const label = ts.isNamedTupleMember(element) ? element.name.text : undefined;
        if (!tagged && !label) report(slug, "returns", `tuple member ${i} has no name: label it in the type or add "@returns [${i}] name"`);
        const type = text(ts.isNamedTupleMember(element) ? element.type : element);
        return { name: tagged?.name ?? `[${i}] ${label ?? `arg${i}`}`, type, description: tagged?.description ?? "" };
      });
    }
    if (!returnType) report(slug, "returns", "no return type: annotate it so the return can be documented");
    else if (!rows.length && text(returnType) !== "void") report(slug, "returns", `returns ${text(returnType)} but has no "@returns name - text" tag`);
    return rows;
  }

  /** The declarations that make up a hook: its public signatures and where its TSDoc sits. */
  function declarationsOf(symbol) {
    const functions = (symbol.declarations ?? []).filter(ts.isFunctionDeclaration);
    if (functions.length) {
      const overloads = functions.filter((f) => !f.body);
      return { docNode: functions[0], signatures: overloads.length ? overloads : functions, all: functions };
    }
    const variable = symbol.declarations?.find(ts.isVariableDeclaration);
    const init = variable?.initializer;
    const fn = init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) ? init : undefined;
    return { docNode: variable, signatures: fn ? [fn] : [], all: fn ? [fn] : [], variable };
  }

  function parameterRows(slug, signatures, all, paramTags) {
    const described = new Map(
      paramTags.map((t) => {
        const match = /^\[?([\w$.]+)[^\s\]]*\]?\s*(?:-\s*)?([\s\S]*)$/.exec(t.text);
        return [match?.[1] ?? "", flat(match?.[2] ?? "")];
      }),
    );
    // A destructured parameter (`{ a, b }: Options`) has no name in the code, so it takes
    // the name of the @param in its position.
    const tagNames = [...described.keys()];
    const nameOf = (p, i) => (ts.isIdentifier(p.name) ? p.name.text : tagNames[i] ?? `arg${i}`);

    const rows = new Map();
    for (const sig of signatures) {
      sig.parameters.forEach((p, i) => {
        const row = rows.get(nameOf(p, i)) ?? { types: [] };
        const type = p.type ? text(p.type) : checker.typeToString(checker.getTypeAtLocation(p));
        if (!row.types.includes(type)) row.types.push(type);
        rows.set(nameOf(p, i), row);
      });
    }
    // Defaults come from whichever declaration has them (an overload's implementation too).
    const defaults = new Map();
    for (const sig of all) sig.parameters.forEach((p, i) => p.initializer && defaults.set(nameOf(p, i), text(p.initializer)));

    for (const name of tagNames) {
      if (!rows.has(name.split(".")[0])) report(slug, "parameters", `@param "${name}" names no parameter of ${slug}`);
    }
    return [...rows].map(([name, { types }]) => {
      // Overloads that type a parameter differently list every type.
      const type = types.length === 1 ? types[0] : types.map((t) => (t.includes("=>") ? `(${t})` : t)).join(" | ");
      return { name, type, defaultValue: defaults.get(name) ?? null, description: described.get(name) ?? "" };
    });
  }

  function hookRecord(name, symbol) {
    const { docNode, signatures, all, variable } = declarationsOf(symbol);
    const file = docNode.getSourceFile();
    const folder = path.relative(hooksDir, file.fileName).split(path.sep)[0];
    const slug = kebab(name);
    if (folder !== slug || path.basename(file.fileName) !== `${slug}.ts`) {
      report(slug, "slug", `${name} must live in src/hooks/${slug}/${slug}.ts (found ${path.relative(root, file.fileName)})`);
    }

    const doc = readDoc(docNode);
    const { summary, details } = splitSummary(doc.description);
    if (!summary) report(slug, "summary", "missing: add a TSDoc comment on the export");

    const category = tagsOf(doc, "category")[0]?.text ?? "";
    if (!category) report(slug, "category", "missing @category");
    else if (!categories.some((c) => c.id === category)) report(slug, "category", `"${category}" is not in catalog/categories.json`);

    const keywords = (tagsOf(doc, "keywords")[0]?.text ?? "").split(",").map(flat).filter(Boolean);
    if (!keywords.length) report(slug, "keywords", "missing @keywords");

    const [usage, ...examples] = tagsOf(doc, "example").map((tag) => parseExample(tag.text));
    if (!usage) report(slug, "usage", "missing: add an @example");
    for (const example of [usage, ...examples].filter(Boolean)) {
      if (!example.code) report(slug, "examples", `@example "${example.title}" has no code block`);
    }

    // `const useX: typeof useY = …` has no parameters of its own: the rows come from the
    // annotated type's call signature (e.g. React's useLayoutEffect declaration).
    const annotated =
      !signatures.length && variable?.type
        ? checker.getSignaturesOfType(checker.getTypeAtLocation(variable), ts.SignatureKind.Call).map((s) => s.declaration).filter(Boolean)
        : [];
    let signature = signatures.map((sig) => `${name}${typeParams(sig)}(${sig.parameters.map(text).join(", ")})${sig.type ? `: ${text(sig.type)}` : ""}`).join("\n");
    const returnType = signatures[0]?.type ?? annotated[0]?.type ?? variable?.type;
    if (!signatures.length) {
      if (annotated.length) signature = annotated.map((sig) => `${name}${typeParams(sig)}(${sig.parameters.map(text).join(", ")})${sig.type ? `: ${text(sig.type)}` : ""}`).join("\n");
      else if (variable?.type) signature = `${name}: ${text(variable.type)}`;
      else report(slug, "signature", `${name} is not a function and has no type annotation`);
    }

    const typeNodes = signatures.flatMap((sig) => [...(sig.typeParameters ?? []), ...sig.parameters, sig.type].filter(Boolean));
    const imports = file.statements.flatMap((s) => {
      const spec = (ts.isImportDeclaration(s) || ts.isExportDeclaration(s)) && s.moduleSpecifier && ts.isStringLiteral(s.moduleSpecifier) ? s.moduleSpecifier.text : "";
      return SIBLING_HOOK.exec(spec)?.[1] ?? [];
    });

    return {
      slug,
      name,
      summary,
      details,
      category,
      keywords,
      signature,
      parameters: parameterRows(slug, signatures.length ? signatures : annotated, signatures.length ? all : annotated, tagsOf(doc, "param")),
      returns: returnRows(slug, tagsOf(doc, "returns", "return"), returnType),
      typeAliases: reachableTypes(variable?.type && !signatures.length ? [variable.type] : typeNodes),
      usage: usage?.code ?? "",
      examples,
      aliases: [],
      source: file.text,
      sourcePath: `${PACKAGE_DIR}/${path.relative(root, file.fileName).split(path.sep).join("/")}`,
      deps: [...new Set(imports)],
    };
  }

  const hooks = [];
  const aliases = [];
  for (const exported of exports) {
    const target = resolve(exported);
    if (!HOOK_NAME.test(exported.name) || !(target.flags & ts.SymbolFlags.Value)) continue;
    // `export const useOld = useNew;` is an alias too (the form that keeps `@deprecated` in the .d.ts).
    const constAlias = target.declarations?.find(
      (d) => ts.isVariableDeclaration(d) && d.initializer && ts.isIdentifier(d.initializer),
    );
    if (constAlias) aliases.push({ exported, target: { name: constAlias.initializer.text }, docNode: constAlias.parent.parent });
    else if (target.name !== exported.name) aliases.push({ exported, target });
    else hooks.push(hookRecord(exported.name, target));
  }

  // `export { useNew as useOld }` or `export const useOld = useNew` (with `@deprecated`) is an
  // alias of the hook, not a hook.
  for (const { exported, target, docNode } of aliases) {
    const hook = hooks.find((h) => h.name === target.name);
    const specifier = exported.declarations?.find(ts.isExportSpecifier);
    const node = docNode ?? (specifier ? specifier.parent.parent : undefined);
    const deprecated = node ? tagsOf(readDoc(node), "deprecated")[0] : undefined;
    hook?.aliases.push({ name: exported.name, slug: kebab(exported.name), deprecated: deprecated ? flat(deprecated.text) : null });
  }

  // X1: a hook folder that the barrel does not export.
  const exportedFolders = new Set(hooks.map((h) => h.sourcePath.split("/").at(-2)));
  const folders = fs.existsSync(hooksDir) ? fs.readdirSync(hooksDir, { withFileTypes: true }).filter((d) => d.isDirectory()) : [];
  for (const { name } of folders) {
    if (!exportedFolders.has(name)) report(name, "barrel", `no hook is exported from src/index.ts (add export * from "./${name}" to src/hooks/index.ts)`);
  }

  // X12: a hook that imports a sibling folder which is no longer an exported hook.
  for (const hook of hooks) {
    for (const dep of hook.deps) {
      if (!hooks.some((h) => h.slug === dep)) report(hook.slug, "deps", `imports ../${dep}, which is not an exported hook`);
    }
  }

  // Starter placeholders left in the TSDoc.
  for (const hook of hooks) {
    const fields = {
      summary: hook.summary,
      details: hook.details,
      category: hook.category,
      keywords: hook.keywords.join(", "),
      usage: hook.usage,
      parameters: hook.parameters.map((p) => p.description).join(" "),
      returns: hook.returns.map((r) => r.description).join(" "),
    };
    for (const [field, value] of Object.entries(fields)) {
      if (PLACEHOLDER.test(value ?? "")) report(hook.slug, field, "replace the TODO placeholder from the new:hook starter");
    }
  }

  // X11: a removed hook that still exists.
  for (const entry of removed) {
    if (hooks.some((h) => h.slug === entry.slug || h.name === entry.name)) {
      report(entry.slug, "removed", "listed in catalog/removed-hooks.json but the hook is still exported");
    }
  }

  // X13: a category no hook uses.
  for (const { id } of categories) {
    if (!hooks.some((h) => h.category === id)) report("catalog/categories.json", id, "no hook has this category");
  }

  return { catalog: { libraryVersion, categories, removed, hooks }, problems };
}

/** The public `hookli/manifest`: one slim entry per hook, the shape outside users rely on. */
export function manifestOf(catalog) {
  const hooks = catalog.hooks.map(({ slug, name, summary, category, signature, keywords }) => ({
    slug,
    name,
    description: summary,
    category,
    signature,
    keywords,
  }));
  return { $schema: "hookli hooks manifest", hooks };
}

/** The README with its hook-count badge and the category-grouped index between the HOOKS markers. */
export function readmeOf(catalog, readme) {
  const region = /(<!-- HOOKS:START[\s\S]*?-->)[\s\S]*?(<!-- HOOKS:END -->)/;
  if (!region.test(readme)) throw new Error("build-catalog: README.md has no HOOKS:START / HOOKS:END markers");
  const count = catalog.hooks.length;
  const bullet = (h) => `- **[\`${h.name}\`](https://hookli.vercel.app/docs/${h.slug})** — ${h.summary}`;
  const grouped = catalog.categories
    .map(({ id, label }) => {
      const items = catalog.hooks.filter((h) => h.category === id);
      return `### ${label} (${items.length})\n\n${items.map(bullet).join("\n")}`;
    })
    .join("\n\n");
  return readme
    .replace(/badge\/\d+_hooks-/g, `badge/${count}_hooks-`)
    .replace(/alt="\d+ hooks"/g, `alt="${count} hooks"`)
    .replace(region, `$1\n\n${grouped}\n\n$2`);
}

const MIRROR_BANNER = "<!-- GENERATED — do not edit. Source: packages/hookli/README.md (run `pnpm --filter hookli run readme`). -->\n\n";

/** Writes `text` only when it differs, so an unchanged output keeps its mtime. */
function writeIfChanged(file, text) {
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === text) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

function main(argv) {
  const strict = argv.includes("--strict");
  const rootFlag = argv.indexOf("--root");
  const root = rootFlag >= 0 ? path.resolve(argv[rootFlag + 1]) : PACKAGE_ROOT;
  const started = performance.now();
  const { catalog, problems } = buildCatalog(root);

  const failed = strict && problems.length > 0;
  if (!failed) {
    const out = path.join(root, "generated", "catalog.json");
    writeIfChanged(out, `${JSON.stringify(catalog, null, 2)}\n`);
    if (argv.includes("--manifest")) writeIfChanged(path.join(root, "hooks.manifest.json"), `${JSON.stringify(manifestOf(catalog), null, 2)}\n`);
    if (argv.includes("--readme")) {
      const readme = readmeOf(catalog, fs.readFileSync(path.join(root, "README.md"), "utf8"));
      writeIfChanged(path.join(root, "README.md"), readme);
      // The repo page shows the package README. Only the real package has a repo root above it.
      if (root === PACKAGE_ROOT) writeIfChanged(path.join(root, "..", "..", "README.md"), MIRROR_BANNER + readme);
    }
    console.log(`build-catalog: ${catalog.hooks.length} hooks -> ${path.relative(process.cwd(), out)} (${Math.round(performance.now() - started)} ms)`);
  }
  if (problems.length) {
    const note = strict ? "" : " (not failing; --strict fails on these)";
    (strict ? console.error : console.warn)(`build-catalog: ${problems.length} problem(s)${note}\n  ${problems.join("\n  ")}`);
  }
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
