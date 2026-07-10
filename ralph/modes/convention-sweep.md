You are running the loop in **convention-sweep** mode. Each `prd.json` task states a
**convention rule** to enforce across the codebase (not a feature to build).

Task shape (in `prd.json`):
- `rule` — the convention, precisely stated (e.g. "no raw string comparisons for a
  question type — use the `QuizQuestionType` enum").
- `scope` — a glob or directory to sweep (e.g. `frontend/storefront-v2/src/modules/account`).
- `good` / `bad` — a tiny before/after example so "compliant" is unambiguous.

Per iteration:
1. Pick the single highest-priority `todo` rule.
2. **Find every violation** in `scope` with parallel-subagent search (grep + read).
   Do not assume zero from one search. Count them.
3. Fix **one coherent slice** (≤15 files) — a **pure refactor, no behaviour change**.
   Prefer the deterministic fixer where one exists; `check.sh` already runs
   `eslint --fix` / `prettier`, so don't hand-format.
4. `bash ralph/check.sh` must be green (types + lint + i18n unchanged, tests still pass).
5. Commit; then:
   - if violations remain, **keep the rule `todo`** and append the remaining count to
     `progress.txt` (the next iteration continues the same rule), OR split the remainder
     into a new `todo` task;
   - if the rule is fully swept, set it `done`.
6. Never change public behaviour, copy, or i18n values to satisfy a rule — if a rule
   would require that, record it in `progress.txt` and set the task `blocked` instead.

Encode the rule as a lint rule when you can — a deterministic rule can't be fudged and
makes the next sweep free.
