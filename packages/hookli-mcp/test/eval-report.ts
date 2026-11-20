import { searchHooks } from "../src/catalog.js";
import { HOLDOUT_CASES, TUNING_CASES, type SearchCase } from "./search-cases.js";

export function scoreCases(cases: SearchCase[]) {
  const misses: string[] = [];
  let top1 = 0, top3 = 0;
  for (const c of cases) {
    const names = searchHooks(c.query, { limit: 3 }).map((r) => r.hook.name);
    if (c.expect.includes(names[0])) top1++;
    if (names.some((n) => c.expect.includes(n))) top3++;
    else misses.push(`"${c.query}" -> [${names.join(", ")}] (want ${c.expect.join("|")})`);
  }
  return { total: cases.length, top1, top3, misses };
}

if (process.argv[1]?.endsWith("eval-report.ts")) {
  for (const [label, cases] of [["tuning", TUNING_CASES], ["holdout", HOLDOUT_CASES]] as const) {
    const r = scoreCases(cases);
    console.log(`${label}: top-1 ${r.top1}/${r.total} (${Math.round((100 * r.top1) / r.total)}%), top-3 ${r.top3}/${r.total} (${Math.round((100 * r.top3) / r.total)}%)`);
    if (process.env.SHOW_MISSES) r.misses.forEach((m) => console.log("   miss " + m));
  }
}
