# Build Warning Remediation Plan (Revised)

This document outlines the diagnosis and remediation plan to eliminate the `buffer` compatibility warning and the 500 kB Vite chunk warning, before beginning APB work.

## 1. Complete Frontmatter Corpus Inventory

To prove that a complex YAML parser is unneeded, a comprehensive, read-only script audited every markdown file under `content/lessons/**/*.md`.

**Results:**
- **Total markdown files scanned:** 88
- **Distinct keys found:** `id`, `title`, `summary`, `protocol`, `tier`, `level`, `order`, `tags`, `relatedLessons`, `prerequisites`, `visualIds`, `exerciseIds`, `glossaryTerms`, `checklistIds`, `section`.
- **Distinct value shapes found:**
  - *Quoted string:* (e.g., `title: "AHB Functional Coverage"`)
  - *Integer:* (e.g., `order: 31`)
  - *Empty array:* (e.g., `relatedLessons: []`)
  - *Non-empty inline array:* (e.g., `tags: ["ahb", "coverage"]`)
- **Unsupported forms completely absent:** Unquoted strings, booleans, nulls, multiline arrays, multiline strings, objects/maps, `!!binary` encodings, and all other YAML features.
- **String content features present:** Quoted strings contain colons, commas, escaped quotes (`\"`), and apostrophes. No YAML escape sequences (`\n`) or leading/trailing whitespace anomalies exist.
- **Duplicate keys:** None found.
- **Malformed delimiters:** None found. All files start cleanly with `---`.
- **Line endings:** LF only (`\n`). CRLF (`\r\n`) is entirely absent.

**Conclusion:** The claim that complex YAML paths (like `buffer` decoding) are unreachable is factually proven. A narrow, purpose-built parser is safe.

## 2. Replacement Parser Contract

The custom parser (`src/lib/markdown.ts`) will strictly handle this narrow grammar and fail predictably.

- **Grammar Supported:** Flat key-value pairs where the value is a double-quoted string, an integer, or an inline array (empty or containing double-quoted strings).
- **Delimiter Detection:** Must match exactly `^---\n` at the start of the file, up to the next `\n---\n`.
- **Line Endings:** Will support both LF and CRLF defensively.
- **BOM Support:** A UTF-8 Byte Order Mark (BOM) will be stripped if present before checking the opening `---`.
- **Key-Value Identification:** The first colon (`:`) on a line splits the key and value. Leading/trailing whitespace on the key or value is trimmed.
- **Quoted Strings:** Strips exactly one leading and trailing double-quote. Unescapes `\"` to `"`.
- **Integer Parsing:** If the value contains only digits, it parses via `parseInt(val, 10)`.
- **Arrays:** If the value starts with `[` and ends with `]`, it extracts the inner content. If empty, returns `[]`. If non-empty, splits by comma (ignoring commas inside quotes using a basic state machine or regex), strips quotes, and returns an array of strings.
- **Unsupported Forms:** Booleans, nulls, unquoted strings, nested objects, and multiline values are not supported. If an unsupported format is encountered on a line, that specific line is ignored, but the rest of the valid frontmatter is retained. 
- **Duplicate Keys:** The last parsed instance of a key overwrites earlier ones.
- **Malformed Delimiters:** If the opening `---` exists but the closing delimiter is missing, the file is treated as having NO frontmatter (returns `{ attributes: {}, body: rawContent }`).
- **Missing Frontmatter / Empty File:** Returns `{ attributes: {}, body: rawContent }`.

## 3. Compatibility-Verification Strategy

### Dedicated Parser Tests
`src/lib/markdown.test.ts` will test explicitly:
1. Supported scalars (integers, quoted strings with colons/commas/escapes).
2. Supported arrays (empty `[]` and inline `["a", "b"]`).
3. LF and CRLF handling.
4. Stripping a UTF-8 BOM.
5. Missing closing delimiter (must return empty attributes, preserve body).
6. Missing frontmatter entirely (must preserve body).
7. Empty file input.
8. Malformed lines (must ignore bad line, preserve good lines).
9. Preservation of horizontal rules (`---`) in the markdown body without confusing them for frontmatter.

### Full-Corpus Validation
A new test (`src/corpus-validation.test.ts`) will load every lesson through the new parser and assert:
- `getLessons()` returns exactly 88 lessons.
- The protocol distribution remains identical: Foundations (6), AHB (38), AXI (44).
- Every lesson has a valid string `id`, string `title`, integer `order`, and array `tags`.
- No IDs are duplicated across the entire corpus.
- This guarantees the parser swaps flawlessly with no data loss.

## 4. Complete Dependency Cleanup

The eventual implementation will remove the problematic module entirely:
- Remove the `import fm from 'front-matter'` statement in `src/lib/markdown.ts`.
- Run `npm uninstall front-matter`.
- Verify cleanup by running `npm ls front-matter js-yaml buffer`.
- *Note:* If `js-yaml` remains solely because another dependency (like `vitest`) relies on it in development, that is acceptable. The critical acceptance criterion is that the **production browser build** no longer includes it or emits the compatibility message.

## 5. Stage-Gated Remediation

To prevent unnecessary architectural complexity, remediation will be strictly stage-gated.

### Stage 1 — Parser Replacement & Dependency Removal
1. Implement the new parser contract in `src/lib/markdown.ts`.
2. Add parser tests and the full-corpus validation test.
3. Uninstall `front-matter`.
4. Run `npm run test` and `npm run build`.
5. **Record Metrics:** Test count, chunk output, minified/gzip sizes, and the presence of any warnings.

**Decision Gate:** 
- If Stage 1 produces a zero-warning build (i.e., the chunk drops below 500 kB naturally, and the `buffer` warning disappears), **STOP.** Do not introduce route complexity.
- If the `buffer` warning remains, stop and diagnose before doing any route splitting.
- If the 500 kB warning remains, proceed to Stage 2.

### Stage 2 — Route-Level Code Splitting (Only if needed)
If the eager content still causes the main chunk to exceed 500 kB, implement `React.lazy()` boundaries to split the bundle.

## 6. Route-Splitting Boundaries (Stage 2)

If Stage 2 is executed, the following architecture applies:

**Lazy-Loaded Routes (Split out of main chunk):**
- `Foundations` (landing page)
- `AHB` (landing page)
- `AXI` (landing page)
- `LessonPage` (Crucial: This will pull `react-markdown` and `VisualRenderer` into a separate chunk).
- `Visuals`, `DevVisuals` (Crucial: This pushes the 180 kB of visual JSON datasets in `visualLoaders.ts` into a separate chunk, as they are no longer statically reachable from AppShell).
- `Glossary`
- All quick-reference pages (`AHBSignals`, `SpecRules`, etc.)

**Eagerly Retained (Main chunk):**
- `App.tsx`, `AppShell`
- `Home`
- `loaders.ts` and the raw lesson markdown text (required for synchronous Sidebar population).
- `SearchBar`, `search.ts`, and `fuse.js` (required for synchronous, instant global search availability).

## 7. Loading and Error Behavior (Stage 2)

- **Loading State:** A shared fallback component (`<RouteLoader />`) will use `role="status"` and `aria-live="polite"` with standard text (e.g., "Loading..."). This avoids full-page blank states.
- **Error Boundary:** A route-level Error Boundary (`<RouteErrorBoundary />`) will catch failed lazy imports (e.g., if a user's network drops or an old chunk hash is deleted during deployment). It will render a useful error message and a "Retry / Reload Page" button.
- **Sidebar:** The sidebar remains 100% available and interactive while routes load, because `loaders.ts` remains eager.

## 8. Exact Expected File Changes

**Stage 1 Changes:**
- `src/lib/markdown.ts` (Implement custom parser)
- `src/lib/markdown.test.ts` (Add strict parser tests)
- `src/corpus-validation.test.ts` (New full-corpus validation test)
- `package.json` (Remove `front-matter`)
- `package-lock.json`
- `docs/BUILD_WARNING_REMEDIATION_PLAN.md`

**Stage 2 Changes (Only if Stage 1 fails to resolve the 500 kB warning):**
- `src/app/App.tsx` (Add `lazy`, `<Suspense>`, and Error Boundary wrappers)
- `src/app/App.test.tsx` (Update to `await` lazy-loaded routes during tests)
- `src/components/RouteLoader.tsx` (New loading fallback)
- `src/components/RouteErrorBoundary.tsx` (New error handling component)

## 9. Explicit Open Questions Resolved

1. **Should unsupported YAML syntax fail the entire lesson, skip only the bad field, or return empty attributes?**
   *Resolution:* Skip only the bad field, preserving the rest of the attributes. This is the most resilient approach. The corpus validation test guarantees our current files contain no unsupported syntax anyway.
2. **Should malformed lessons be excluded by `getLessons()` or rendered with an explicit content error?**
   *Resolution:* Excluded by `getLessons()`. The current `loaders.ts` already filters out lessons missing an `id` or `title`. A malformed lesson that fails to parse will be safely excluded from the sidebar and search, rather than crashing the UI.
3. **Is a custom parser still preferable to build-time parsing after the complete corpus inventory?**
   *Resolution:* Yes. A custom parser is trivially simple to write for this strict grammar, requires zero complex Vite plugin configurations, runs fast enough in the browser (88 files is minimal), and avoids diverging from standard client-side architecture.
4. **Which page routes must remain eager, if any?**
   *Resolution:* `Home` will remain eager to provide an instant initial paint. `AppShell` and `SearchBar` remain eager to preserve the static architecture.
5. **What should users see when a lazy route chunk fails to load?**
   *Resolution:* An Error Boundary presenting a clear message ("Failed to load page content") with a "Reload Page" button, keeping the sidebar and top navigation fully usable.
6. **What measured Stage 1 result triggers Stage 2?**
   *Resolution:* If the Vite chunk warning (`(!) Some chunks are larger than 500 kB after minification`) continues to appear in the build output, Stage 2 triggers. Otherwise, Stage 2 is discarded.
