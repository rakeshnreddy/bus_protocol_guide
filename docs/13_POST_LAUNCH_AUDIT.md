# Post-Launch App Audit (Phase 6 Final)

This document contains an honest, unvarnished self-audit of the Bus Protocol Guide app at the conclusion of Phase 6, before beginning Phase 7 expansion. No fixes have been applied during this audit; this is purely a gap analysis.

## 1. Metrics & Build Cross-Check

* **Test Suite:** 75/75 tests pass with 0 failures (`npm run test`).
* **Build Status:** **CRITICAL FAILURE**. `npm run build` fails with Exit Code 2 due to multiple TypeScript compilation errors (e.g., missing `@types/node` for `fs`/`path`, `KeyboardEvent` verbatim module syntax issues, `WaveformVisualizer.test.tsx` type mismatches, and `toHaveNoViolations` missing from `vitest-axe` types).
* **Lesson Counts:**
  * Foundations: Planned = 6, Actual = 6. (Match)
  * AHB: Planned = 38, Actual = 38. (Match)
  * AXI: Planned = 44, Actual = 46. (Mismatch: Duplicate `01_axi_intro.md` vs `01_what_is_axi.md` and subsequent numbering drift. The curriculum map is out of sync with the file system).

## 2. Audit Findings

### Critical (Breaks understanding or functionality)
* **TypeScript Build Failure:** The app cannot currently be built for production due to strict TypeScript errors in the tests and components. 
* **AXI Lesson Duplication & Numbering:** The AXI lesson folder has redundant files (`01_axi_intro.md` and `01_what_is_axi.md`), causing the numbering to shift and creating potential duplicate search index entries.
* **Missing Cross-Links in Quick Reference:** The `AHBSignals` and `AXISignals` quick reference pages do not link *back* to the specific lessons that teach those signals. A user looking up `AWVALID` cannot easily jump to the lesson that explains it in depth.

### Moderate (Noticeable rough edge)
* **Mobile Touch Targets inside SVGs:** While `.scroll-container` prevents layout breakage on mobile viewports (375px), interacting with specific beats or signals inside the `WaveformVisualizer` SVG is difficult because the clickable areas (lines/rectangles) are smaller than the 44x44px minimum touch target standard.
* **Knowledge Leaks:** In the AHB Track, wait states (`HREADY`) and pipelining are heavily referenced in the Section B (Signals) and Section C (Transfer Semantics) lessons, slightly assuming the user understands phase overlap before it is formally taught in Section D.
* **Visual Density vs Explanations:** The `TopologyViewer` is used in AXI interconnect lessons but is entirely static. It doesn't clearly support the text explaining *how* QoS or transaction routing works through the crossbar, acting more as a static diagram than a learning aid.
* **Shallow Glossary Entries:** AXI sideband signals (like `AxUSER`, `AxPROT`, `AxCACHE`) have very brief, shallow explanations in the glossary and quick reference, despite being complex topics critical to system-level verification (as outlined in the "become a true expert" project goal).

### Minor (Polish nice-to-have)
* **Tone Inconsistency:** The Foundations track uses very conceptual, conversational language, while the AHB track becomes immediately dense and specification-heavy. The transition could be smoothed.
* **Interactive Exercises on Mobile:** Some of the AXI waveform analysis exercises have long text descriptions that require constant scrolling back and forth on a 375px screen to view the visual and answer the multiple-choice question simultaneously.
* **Search Index:** Searching for generic terms like "Valid" brings up an overwhelming number of results across AXI and AHB without clearly bucketing them by protocol track in the UI.

## 3. Overall Verdict

**Is the app currently good enough to genuinely help someone become expert-level?**
*Almost, but it is not ready for Phase 7 yet.*

The core content is incredibly strong, and the conceptual framing (Foundations -> Protocol -> Verification) is highly effective. A learner would absolutely come away with a senior-level understanding of AHB and AXI.

However, the **app is currently unbuildable for production** due to TypeScript errors, the AXI curriculum has structural file duplication, and the quick-reference tools (which are crucial for the "daily-use tool" goal) lack bidirectional linking. 

**Recommendation:** Do not proceed to Phase 7 (Expansion Planning) yet. We must execute a short "Phase 6.5" to fix the TypeScript build failures, clean up the AXI lesson numbering, deepen the sideband signal documentation, and add bidirectional links from the reference pages to the lessons. Only once `npm run build` passes cleanly should we expand the curriculum.
