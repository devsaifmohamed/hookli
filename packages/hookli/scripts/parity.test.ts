// @vitest-environment node
// Release-branch-only parity check (docs/plans/2026-11-21-single-source.md §5, deleted in
// PR 6): for every hook already migrated to TSDoc (it has @category), the generated
// catalog must say what apps/docs/lib/hook-docs.ts and hooks.manifest.json say today,
// field by field. Every difference must be listed, with its reason, in
// parity-approved.json. The summary is not compared: the JSDoc wording replaces the
// manifest description by decision (CEO).
import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { buildCatalog } from "./build-catalog.mjs";
import { loadHookDocs, loadManifest } from "./codemod-tsdoc.mjs";

type Row = { name: string; type: string; defaultValue?: string | null; description?: string | null };
type Alias = { name: string; description?: string | null; rows: Row[] };
type Example = { title: string; description?: string | null; code: string };
type Diff = { slug: string; field: string; docs: unknown; catalog: unknown };
type Approval = Diff & { reason: string };

const blank = (value: unknown) => (value === undefined || value === "" ? null : value);
const code = (value: string) => value.trim();

function diffHook(slug: string, hook: any, entry: any, doc: any): Diff[] {
  const diffs: Diff[] = [];
  const same = (field: string, docs: unknown, catalog: unknown) => {
    if (JSON.stringify(blank(docs)) !== JSON.stringify(blank(catalog))) diffs.push({ slug, field, docs: blank(docs), catalog: blank(catalog) });
  };
  const rows = (field: string, docsRows: Row[], catalogRows: Row[], withDefault: boolean) => {
    same(`${field}[]`, docsRows.map((r) => r.name), catalogRows.map((r) => r.name));
    for (const docsRow of docsRows) {
      const row = catalogRows.find((r) => r.name === docsRow.name);
      if (!row) continue;
      same(`${field}.${row.name}.type`, docsRow.type, row.type);
      if (withDefault) same(`${field}.${row.name}.defaultValue`, docsRow.defaultValue, row.defaultValue);
      same(`${field}.${row.name}.description`, docsRow.description, row.description);
    }
  };

  same("category", entry.category, hook.category);
  same("keywords", entry.keywords, hook.keywords);
  same("signature", entry.signature, hook.signature);
  rows("parameters", doc.parameters, hook.parameters, true);
  rows("returns", doc.returns, hook.returns, false);

  const docsAliases: Alias[] = doc.typeAliases ?? [];
  same("typeAliases[]", docsAliases.map((a) => a.name), hook.typeAliases.map((a: Alias) => a.name));
  for (const docsAlias of docsAliases) {
    const alias = hook.typeAliases.find((a: Alias) => a.name === docsAlias.name);
    if (!alias) continue;
    same(`typeAliases.${alias.name}.description`, docsAlias.description, alias.description);
    rows(`typeAliases.${alias.name}.rows`, docsAlias.rows, alias.rows, true);
  }

  same("usage", code(doc.usage), code(hook.usage));
  const docsExamples: Example[] = doc.examples ?? [];
  same("examples[]", docsExamples.map((e) => e.title), hook.examples.map((e: Example) => e.title));
  for (const docsExample of docsExamples) {
    const example = hook.examples.find((e: Example) => e.title === docsExample.title);
    if (!example) continue;
    same(`examples.${example.title}.description`, docsExample.description, example.description);
    same(`examples.${example.title}.code`, code(docsExample.code), code(example.code));
  }
  return diffs;
}

const getDoc = loadHookDocs();
const manifest = loadManifest();
const { catalog } = buildCatalog();
const migrated = catalog.hooks.filter((h: any) => h.category);
const diffs = migrated.flatMap((hook: any) => diffHook(hook.slug, hook, manifest.find((e: any) => e.slug === hook.slug), getDoc(hook.slug)));
const approved: Approval[] = JSON.parse(fs.readFileSync(new URL("./parity-approved.json", import.meta.url), "utf8"));

const key = ({ slug, field, docs, catalog }: Diff) => JSON.stringify([slug, field, docs, catalog]);
const approvedKeys = new Set(approved.map(key));
const diffKeys = new Set(diffs.map(key));

describe("parity: migrated hooks vs hook-docs.ts and the manifest", () => {
  it("compares at least one migrated hook", () => {
    expect(migrated.length).toBeGreaterThan(0);
  });

  it("every migrated hook has a docs entry and a manifest entry", () => {
    const missing = migrated.filter((h: any) => !getDoc(h.slug) || !manifest.some((e: any) => e.slug === h.slug)).map((h: any) => h.slug);
    expect(missing).toEqual([]);
  });

  it("every difference is approved in parity-approved.json", () => {
    expect(diffs.filter((d: Diff) => !approvedKeys.has(key(d))), "approve each with a reason, or fix the TSDoc").toEqual([]);
  });

  it("every approval still matches a difference", () => {
    expect(approved.filter((a) => !diffKeys.has(key(a))), "remove stale entries from parity-approved.json").toEqual([]);
  });

  it("every approval gives a reason", () => {
    expect(approved.filter((a) => !a.reason?.trim())).toEqual([]);
  });
});
