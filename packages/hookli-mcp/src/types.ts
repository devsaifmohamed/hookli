export type HookCategory = "state" | "effects" | "dom" | "data";

export interface ApiRow {
  name: string;
  type: string;
  defaultValue?: string | null;
  description: string;
}

export interface TypeAliasDoc {
  name: string;
  description?: string | null;
  rows: ApiRow[];
}

export interface HookExample {
  title: string;
  description: string | null;
  code: string;
}

export interface HookCatalogItem {
  slug: string;
  name: string;
  description: string;
  category: HookCategory;
  signature: string;
  parameters: ApiRow[];
  returns: ApiRow[];
  typeAliases: TypeAliasDoc[];
  usage: string;
  /** Extra examples for patterns the main usage does not show. */
  examples: HookExample[];
  source: string;
  sourcePath: string;
  docsUrl: string;
  /** Curated search phrases from hooks.manifest.json. */
  keywords: string[];
}
