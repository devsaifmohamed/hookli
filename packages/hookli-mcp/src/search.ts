import type { HookCatalogItem, HookCategory } from "./types.js";

/**
 * Plain-language search over the hook catalog.
 *
 * Developers (and their agents) describe a need, not a hook name: "close the
 * menu when I click outside", "wait until the user stops typing". The engine:
 *
 * 1. tokenizes + drops filler words ("the", "when", "user", ...),
 * 2. stems so "typing" / "type" / "typed" meet,
 * 3. expands common developer wording to library vocabulary ("offline" ->
 *    network, "esc" -> escape key) at a lower weight,
 * 4. scores each term by rarity (IDF) times the best field it hits
 *    (hook name > curated keywords > description > category),
 * 5. adds a bonus when a whole multi-word keyword phrase appears.
 *
 * Curated keywords live in packages/hookli/hooks.manifest.json (`keywords`).
 */

const STOPWORDS = new Set(
  (
    "a an and are as at be been but by can could do does for from get gets got has have how i if in into is it its " +
    "just let lets like me my need needs of on or our should so some something that the their them then there these " +
    "this to too up us use used using via want wants was we what when where whether which while who will with " +
    "without would you your react hook hooks component components user users app page thing things way make makes " +
    "know show only any all one also"
  ).split(" "),
);

/** Everyday developer wording -> words the catalog uses. Applied at reduced weight. */
const SYNONYMS = new Map<string, string[]>(Object.entries({
  refresh: ["persist", "storage"],
  reload: ["persist", "storage"],
  reloads: ["persist", "storage"],
  visits: ["persist", "localstorage"],
  remember: ["persist", "storage"],
  save: ["persist", "storage"],
  keep: ["persist"],
  typing: ["debounce", "input"],
  keystroke: ["debounce", "input"],
  waits: ["debounce", "delay"],
  wait: ["debounce", "delay"],
  backend: ["api", "request"],
  server: ["api", "ssr"],
  endpoint: ["api", "request"],
  periodically: ["interval", "polling"],
  poll: ["polling", "interval"],
  repeatedly: ["interval", "repeat"],
  every: ["interval"],
  dismiss: ["close", "outside"],
  inactivity: ["idle", "inactive"],
  inactive: ["idle"],
  afk: ["idle"],
  logout: ["idle", "timeout"],
  visible: ["viewport", "visibility"],
  viewport: ["view", "intersection"],
  onscreen: ["viewport", "view"],
  appears: ["viewport", "view"],
  mobile: ["breakpoint", "media", "screen"],
  tablet: ["breakpoint", "media"],
  breakpoint: ["media", "responsive"],
  offline: ["network", "online"],
  internet: ["network", "online"],
  connection: ["network", "online"],
  disconnected: ["network", "offline"],
  tab: ["visibility", "tab"],
  hidden: ["visibility", "hidden"],
  background: ["visibility", "hidden"],
  esc: ["escape", "key"],
  escape: ["key", "keydown"],
  shortcut: ["hotkeys", "keyboard"],
  combo: ["hotkeys", "shortcut"],
  ctrl: ["hotkeys", "shortcut"],
  cmd: ["hotkeys", "shortcut"],
  clipboard: ["copy"],
  share: ["copy", "link"],
  paste: ["clipboard", "copy"],
  stepper: ["step", "wizard"],
  wizard: ["step"],
  onboarding: ["step", "wizard"],
  feed: ["infinite", "load"],
  endless: ["infinite", "scroll"],
  spinner: ["loading", "async"],
  theme: ["dark", "color", "scheme"],
  scheme: ["dark", "theme"],
  night: ["dark"],
  reposition: ["drag", "move"],
  floating: ["drag"],
  drag: ["draggable", "move"],
  dimensions: ["size", "width", "height"],
  truncation: ["truncate", "more"],
  truncate: ["read", "more"],
  clamp: ["truncate"],
  gps: ["geolocation", "location"],
  coordinates: ["location", "position"],
  camera: ["permission"],
  microphone: ["permission"],
  notifications: ["permission"],
  throttle: ["rate", "limit"],
  often: ["throttle", "rate"],
  frequency: ["throttle", "rate"],
  paging: ["pagination", "page"],
  pages: ["pagination", "page"],
  prev: ["previous"],
  hydration: ["client", "ssr"],
  browser: ["client"],
  tooltip: ["hover"],
  mouseover: ["hover"],
  countdown: ["timer", "seconds"],
  resend: ["countdown", "timer"],
  hold: ["press", "long"],
  highlighted: ["selection", "selected"],
  selected: ["selection"],
  title: ["document"],
}));

/** Multi-word phrasings whose meaning is not in their single words. */
const PHRASE_SYNONYMS: Array<[RegExp, string[]]> = [
  [/\bstop(?:s|ped|ping)? (?:using|interacting|moving|responding)\b/, ["idle", "inactive"]],
  [/\b(?:no|without) (?:activity|interaction|input)\b/, ["idle", "inactive"]],
  [/\bstop(?:s|ped)? typing\b/, ["debounce"]],
  [/\bonce on mount\b|\bonly once\b/, ["once", "mount"]],
  [/\bfirst render\b/, ["skip", "update"]],
];

const FIELD_WEIGHT = { name: 3, keywords: 3, description: 1.5, category: 0.5 } as const;
const SYNONYM_WEIGHT = 0.5;
const PHRASE_BONUS = 2.5;
/** Query mentions every word of the hook's name ("screen" -> useScreen). */
const NAME_BONUS = 4;

export function stem(word: string): string {
  const w = word.toLowerCase();
  for (const suffix of ["ence", "ance", "ing", "ies", "ied", "ed", "es", "s", "e"]) {
    if (w.endsWith(suffix) && w.length - suffix.length >= 3) {
      if (suffix === "s" && w.endsWith("ss")) return w;
      let base = w.slice(0, -suffix.length);
      if (suffix === "ies" || suffix === "ied") return `${base}y`;
      // "stopped" -> "stop", "running" -> "run" (keep "scroll", "press", "buzz")
      if ((suffix === "ed" || suffix === "ing") && /([^aeiouslz])\1$/.test(base)) base = base.slice(0, -1);
      return base;
    }
  }
  return w;
}

/** Lowercase words; splits camelCase ("useLocalStorage" -> use local storage) and punctuation. */
export function words(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter(Boolean);
}

function contentTokens(text: string): string[] {
  return words(text)
    .filter((w) => !STOPWORDS.has(w) && w.length > 1)
    .map(stem);
}

type IndexedHook = {
  hook: HookCatalogItem;
  fields: Record<keyof typeof FIELD_WEIGHT, Set<string>>;
  /** Exact (unstemmed) words of the hook name, for the name bonus. */
  nameWords: string[];
  phrases: string[][];
};

let cachedIndex: { source: HookCatalogItem[]; hooks: IndexedHook[]; idf: Map<string, number> } | null = null;

function buildIndex(catalog: HookCatalogItem[]) {
  if (cachedIndex?.source === catalog) return cachedIndex;
  const hooks: IndexedHook[] = catalog.map((hook) => {
    const keywordText = hook.keywords.join(" ");
    return {
      hook,
      fields: {
        name: new Set(contentTokens(hook.name.replace(/^use/, ""))),
        keywords: new Set(contentTokens(keywordText)),
        description: new Set(contentTokens(hook.description)),
        category: new Set(contentTokens(hook.category)),
      },
      phrases: hook.keywords.map(contentTokens).filter((p) => p.length > 1),
      nameWords: words(hook.name.replace(/^use/, "")),
    };
  });
  const docFreq = new Map<string, number>();
  for (const h of hooks) {
    const all = new Set([...h.fields.name, ...h.fields.keywords, ...h.fields.description, ...h.fields.category]);
    for (const t of all) docFreq.set(t, (docFreq.get(t) ?? 0) + 1);
  }
  const n = hooks.length;
  const idf = new Map<string, number>();
  for (const [t, df] of docFreq) idf.set(t, Math.log(1 + (n - df + 0.5) / (df + 0.5)));
  cachedIndex = { source: catalog, hooks, idf };
  return cachedIndex;
}

export type SearchResult = { hook: HookCatalogItem; score: number };

export function rankHooks(
  catalog: HookCatalogItem[],
  query: string,
  options?: { category?: HookCategory; limit?: number },
): SearchResult[] {
  const limit = options?.limit ?? 10;
  const { hooks, idf } = buildIndex(catalog);
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const rawWords = words(q).filter((w) => !STOPWORDS.has(w));
  const terms = new Map<string, number>();
  for (const w of rawWords) {
    if (w.length < 2) continue;
    terms.set(stem(w), 1);
  }
  for (const w of rawWords) {
    for (const syn of SYNONYMS.get(w) ?? SYNONYMS.get(stem(w)) ?? []) {
      for (const t of contentTokens(syn)) if (!terms.has(t)) terms.set(t, SYNONYM_WEIGHT);
    }
  }
  for (const [pattern, extra] of PHRASE_SYNONYMS) {
    if (pattern.test(q)) for (const t of extra.map(stem)) terms.set(t, Math.max(terms.get(t) ?? 0, 0.8));
  }
  const rawWordSet = new Set(words(q));
  const queryStems = new Set([...terms].filter(([, w]) => w === 1).map(([t]) => t));

  const results: SearchResult[] = [];
  for (const h of hooks) {
    if (options?.category && h.hook.category !== options.category) continue;
    const name = h.hook.name.toLowerCase();
    let score = 0;
    if (name === q || h.hook.slug === q || name === `use${q.replace(/[\s-]/g, "")}`) score += 100;

    for (const [term, weight] of terms) {
      let best = 0;
      for (const field of Object.keys(FIELD_WEIGHT) as (keyof typeof FIELD_WEIGHT)[]) {
        if (h.fields[field].has(term)) best = Math.max(best, FIELD_WEIGHT[field]);
      }
      if (best) score += best * weight * (idf.get(term) ?? 0);
    }
    if (h.nameWords.length > 0 && h.nameWords.every((w) => rawWordSet.has(w))) {
      score += NAME_BONUS * h.nameWords.length;
    }
    for (const phrase of h.phrases) {
      if (phrase.every((t) => queryStems.has(t))) {
        score += PHRASE_BONUS * phrase.length;
      } else if (phrase.every((t) => terms.has(t))) {
        // completed with synonyms ("esc" -> "escape key"): weaker evidence
        score += PHRASE_BONUS * SYNONYM_WEIGHT * phrase.length;
      }
    }
    if (score > 0) results.push({ hook: h.hook, score: Math.round(score * 10) / 10 });
  }

  results.sort((a, b) => b.score - a.score || a.hook.name.localeCompare(b.hook.name));
  return results.slice(0, limit);
}

export type Suggestion = { hook: HookCatalogItem; score: number; covers: string };

/**
 * Splits a feature description into its requirements ("closes on ESC, closes on
 * outside click, and locks scroll") and finds the best hook for each one.
 */
export function suggestForTask(catalog: HookCatalogItem[], task: string, max = 6): Suggestion[] {
  const clauses = task
    .split(/[,;.\n]|\band\b|\bwith\b|\bplus\b|\balso\b|\bthen\b|\bwhile\b/i)
    .map((c) => c.trim())
    .filter((c) => contentTokens(c).length > 0);

  // Rank candidates per requirement, then hand out hooks strongest-match-first so
  // one hook is not claimed by a requirement that only loosely needs it.
  const ranked = clauses
    .map((clause, order) => ({ clause, order, results: rankHooks(catalog, clause, { limit: 3 }) }))
    .filter((c) => c.results.length > 0 && c.results[0].score >= 2);
  const pairs = ranked
    .flatMap((c) => c.results.filter((r) => r.score >= c.results[0].score * 0.5).map((r) => ({ c, r })))
    .sort((a, b) => b.r.score - a.r.score);

  const picked = new Map<string, Suggestion & { order: number }>();
  const covered = new Set<number>();
  for (const { c, r } of pairs) {
    if (covered.has(c.order) || picked.has(r.hook.name)) continue;
    picked.set(r.hook.name, { ...r, covers: c.clause, order: c.order });
    covered.add(c.order);
  }
  // A requirement can need two hooks ("draggable widget that remembers its position").
  for (const c of ranked) {
    const second = c.results.find((r) => !picked.has(r.hook.name) && r.score >= c.results[0].score * 0.6);
    if (second) picked.set(second.hook.name, { ...second, covers: c.clause, order: c.order + 0.5 });
  }
  if (picked.size === 0) {
    for (const r of rankHooks(catalog, task, { limit: 3 })) {
      picked.set(r.hook.name, { ...r, covers: task, order: 0 });
    }
  }
  // Fill slots with each requirement's primary hook first, then second hooks.
  const all = [...picked.values()];
  const primaries = all.filter((s) => Number.isInteger(s.order));
  const secondaries = all.filter((s) => !Number.isInteger(s.order));
  return [...primaries, ...secondaries]
    .slice(0, max)
    .sort((a, b) => a.order - b.order)
    .map(({ hook, score, covers }) => ({ hook, score, covers }));
}
