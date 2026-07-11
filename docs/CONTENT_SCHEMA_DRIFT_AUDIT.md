# Content Schema Drift Audit

## 1. Current Working-Tree State

The repository is currently on branch `main` at commit `5c3d9e070a23a5438e6085119cd9d4142d78e5fe` as the base. The following changes are present in the working tree, reflecting Stage 1 parser migration, the AXI metadata repair, and Stage 2 route splitting implementation:

**Modified Files:**
* `content/lessons/axi/34_axi_simulation_strategy.md` (thru `44_axi_interview_recap.md`) - *11 AXI files repaired*
* `package.json`, `package-lock.json`
* `src/app/App.tsx`, `src/app/App.test.tsx`
* `src/lib/markdown.ts`, `src/lib/markdown.test.ts`
* `src/styles/global.css`

**Untracked / Added Files:**
* `docs/BUILD_WARNING_REMEDIATION_PLAN.md`
* `src/components/routing/RouteErrorBoundary.tsx` (and `.test.tsx`)
* `src/components/routing/RouteLoadingFallback.tsx` (and `.test.tsx`)
* `src/corpus-validation.test.ts`

No other files have been modified. The route splitting implementation remains completely intact.

## 2. Exact Lesson-Schema Inventory

An automated parse of all 88 lesson files (`content/lessons/**/*.md`) was performed against the canonical `Lesson` model.

* **Total lessons:** 88
* **Protocol Breakdown:**
  * Foundations: 6
  * AHB: 38
  * AXI: 44
* **Files with at least one missing field:** 6 (Exactly the 6 Foundations lessons).
* **11 repaired AXI files status:** Pass completely.
* **38 AHB files status:** Pass completely (they explicitly declare `[]` for empty lists).

**Missing Field Occurrences:**
* `prerequisites`: 6 missing
* `relatedLessons`: 6 missing
* `checklistIds`: 5 missing
*(All missing occurrences correspond exclusively to `01_bus_mental_models.md` through `06_senior_dv_mindset.md`).*

**Field Analysis:**
* The missing fields (`prerequisites`, `relatedLessons`, `checklistIds`) are collection types (arrays). They are **safely defaultable to `[]`** and represent an absence of relations, not missing data.
* No core metadata fields (`id`, `title`, `summary`, `protocol`, `tier`, `level`, `order`) were missing from any of the 88 files.
* **Type Errors:** 0 wrong types detected across existing values.
* **Invalid Ref IDs:** 0 empty reference IDs detected.

## 3. Lesson Runtime-Impact Analysis

Inspection of all runtime consumers (`src/lib/loaders.ts`, `src/lib/search.ts`, `src/components/LessonRenderer.tsx`, `src/cross-link.test.ts`) reveals two distinct classifications for fields:

**Core Required Metadata**
* `id`, `title`: `loaders.ts` explicitly checks for their existence. If missing, the lesson is completely ignored and dropped at load time.
* `protocol`, `order`: `loaders.ts` safely falls back to defaults (`'foundations'` and `0`) if missing.
* `summary`, `tier`, `level`: Assumed to exist by the UI.

**Collection Metadata**
* `tags`, `prerequisites`, `relatedLessons`, `visualIds`, `exerciseIds`, `glossaryTerms`, `checklistIds`
* **Runtime expectation:** The runtime code is **highly defensive**. 
  * `LessonRenderer.tsx` uses optional chaining (`lesson.prerequisites?.length > 0`).
  * `loaders.ts` relies on optional chaining (`lesson.glossaryTerms?.includes(...)`).
  * `search.ts` defaults to an empty array (`(lesson.tags || []).join(...)`).
* **Conclusion:** The UI application behaves correctly even if these fields are missing. The only consumer that crashes is `src/corpus-validation.test.ts`, which was explicitly written to strictly enforce the presence of array fields.

## 4. Exact Glossary-Schema Inventory

An audit of all 3 JSON files under `content/glossary/**/*.json` was performed.

* **Total glossary files:** 3 (`foundations.json`, `ahb.json`, `axi.json`)
* **Total entries:** 116
* **Duplicates:** 4 duplicate terms detected (`Transaction`, `Burst`, `Beat`, `Handshake`), which exist across multiple files. 0 duplicate IDs.

**Missing Canonical Fields:**
* `id`: 14 missing
* `expandedForm`: 116 missing
* `protocolScope`: 116 missing
* `relatedSignals`: 116 missing
* `relatedLessons`: 116 missing

**Legacy Field Usage:**
* `expansion`: Used 36 times (in place of `expandedForm`).
* `relatedTerms`: Used 14 times.
* **Entries missing both expansion and expandedForm:** 80 (Many terms are not acronyms, so this is valid).
* **Empty definitions:** 0

**Analysis:**
* `protocolScope` can be safely derived directly from the source filename (`ahb.json` -> `ahb`).
* `id` can be safely derived by slugifying the `term` (with deduplication strategies if necessary).
* `expandedForm` can be derived from the legacy `expansion` field.

## 5. Glossary Runtime-Impact Analysis

* **`src/pages/Glossary.tsx`**: Uses `entry.protocolScope.includes(filter)` and `entry.protocolScope.map(...)`. Because `protocolScope` is missing entirely across all 116 entries, this page **crashes instantly** upon render.
* **`src/components/interactive/GlossaryTermInline.tsx`**: Safely consumes `term`, `definition`, and `expandedForm` (handles missing). It does not crash.
* **`src/lib/loaders.ts`**: Safely defaults to `[]` when reading `relatedLessons` from the JSON entry. It actually overwrites `relatedLessons` dynamically based on reverse lookups from `Lesson.glossaryTerms`.

The `/glossary` crash is isolated to the glossary page and occurs solely because the component code trusts the TypeScript `GlossaryEntry` interface (`protocolScope: string[]`), which is violated by the raw JSON data.

## 6. Strategy Comparison

### Strategy A — Normalize every source content file
* **Action:** Backfill 6 foundation markdown files with empty arrays. Rewrite 116 glossary JSON entries to strictly match the canonical schema.
* **Evaluate:** Generates a massive, low-value diff consisting entirely of empty arrays and field migrations. High risk of merge conflicts for anyone actively editing prose or definitions. Does not protect against future authoring omissions.

### Strategy B — Normalize at the loader boundary
* **Action:** Map and default fields inside `src/lib/loaders.ts` before returning them to the application.
* **Evaluate:** Centralizes schema enforcement. Missing collection arrays become `[]`. `protocolScope` is automatically tagged based on the filename. `expansion` maps to `expandedForm`. The TypeScript return type becomes 100% truthful. Zero content files need changing.

### Strategy C — Make canonical fields optional and guard every consumer
* **Action:** Change `GlossaryEntry.protocolScope` to `string[] | undefined`, add `?` throughout `Glossary.tsx`.
* **Evaluate:** Degrades the canonical content model. Forces all UI components to handle missing data forever, increasing complexity and risking future hidden crashes.

## 7. Recommended Remediation

**Recommendation:** A carefully justified hybrid of **Strategy B** (Loader Normalization) with minor targeted updates to tests.

1. **Lesson Boilerplate:** Do not mechanically backfill markdown files with empty arrays.
2. **Loader Guarantees:** `src/lib/loaders.ts` should enforce the canonical `Lesson` and `GlossaryEntry` objects, mapping missing arrays to `[]`.
3. **Core Lesson Rejections:** `id`, `title`, and `protocol` should be required by the loader; failure to provide them should discard the lesson (with a console warning).
4. **Glossary Derivation:** The loader should rewrite `expansion` to `expandedForm`, assign `protocolScope` based on the JSON file's basename, and generate an `id` from the term if missing.
5. **Legacy Fields:** `relatedTerms` should be retained in the raw type but mapped to a new optional field in the canonical model so it is not silently discarded.
6. **Tests:** `corpus-validation.test.ts` should be updated to test the parsed outputs from `loaders.ts` rather than demanding raw Markdown frontmatter compliance.

This approach eliminates the Glossary crash, makes TypeScript types truthful, preserves all prose/definitions, avoids a giant low-value diff, and cleanly supports future APB content.

## 8. Proposed Implementation Phases

### Phase A — Canonical Loader Normalization
* **Files:** `src/lib/loaders.ts`, `src/types/content.ts`
* **Action:** Update `getLessons` and `getGlossaryEntries` to normalize raw data into strict canonical objects (defaulting arrays, mapping `expansion` -> `expandedForm`, deriving `protocolScope`). Add `relatedTerms` to the `GlossaryEntry` interface.
* **Criteria:** No UI code changes. All returned objects strictly match TypeScript types.

### Phase B — Test Realignment
* **Files:** `src/corpus-validation.test.ts`, `src/lib/loaders.test.ts`
* **Action:** Update corpus validation to verify the *normalized* output of the loaders, removing the brittle raw-frontmatter checks. Add tests for loader normalizations (e.g., verifying `ahb` scope is applied to terms in `ahb.json`).
* **Criteria:** `npm run test` executes with zero failures.

### Phase C — Defensive Glossary Rendering
* **Files:** `src/pages/Glossary.tsx`
* **Action:** Apply optional chaining (`?.`) as a defense-in-depth measure, even though the loader guarantees the array.
* **Criteria:** Glossary page loads successfully without runtime exceptions.

*Note: No lesson prose, metadata, or glossary JSON definition changes are required in any phase.*
