# Bus Protocol DV Academy — Coding Agent Handoff

Last updated: 2026-07-16

## Product directive

- Complete AHB and AXI visual learning before beginning another protocol.
- Do not add APB curriculum, routes, trackers, or standalone assets.
- Preserve lesson prose and keep protocol requirements distinct from product policy or recommendations.
- Follow the protocol-accuracy and block-diagram gates in `AGENTS.md`.

## Completed foundation

- The narrow browser-safe frontmatter parser and loader-boundary content normalization remain in place.
- Route, loader, and search splitting keep every production chunk below the existing 500 kB warning threshold.
- The visual registry discovers root and nested JSON, uses conservative legacy inference, preserves source diagnostics, isolates malformed assets, and never overwrites duplicate IDs.
- All 88 lessons pass declared/inline visual-reference integrity checks.
- The light/dark/system theme, responsive app shell, curriculum navigation, Visuals Explorer, and lesson progress/navigation are complete.
- The production `TopologyViewer` and structured geometry checks implement the reusable block-diagram standard documented in `AGENTS.md` and `docs/03_VISUAL_SYSTEM.md`.

## AHB/AXI visual and retention status

All four AHB visual batches, all four AXI visual batches, and Phase V3 presentation/retention polish are complete. Every AHB and AXI lesson has reviewed, registry-resolved inline visual support. The production registry contains 79 visuals:

| Type | Count |
| --- | ---: |
| Waveform | 31 |
| Timeline | 11 |
| Topology | 12 |
| Signal explorer | 19 |
| Coverage map | 2 |
| Formal property | 2 |
| Spec rule explorer | 2 |

Current registry diagnostics: 0 duplicates, 0 malformed/missing-ID files, 0 unsupported files, and 35 recovered root-level legacy assets.

Phase V3 provides a consistent visual-inspection workflow and retrieval panel across all 88 lessons. The Visuals Explorer groups the complete registry by protocol and supports search, type/protocol filters, production previews, empty-state recovery, and light/dark/system themes.

## Phase V4 status

Both AHB/AXI Applied DV Practice batches are complete. A reusable `diagnostic-lab` exercise schema, strict production normalization, responsive evidence table, three-step diagnostic workflow, per-step reasoning feedback, scoring, and reset behavior are implemented.

Sixteen primary-source-reviewed labs are integrated: eight AHB and eight AXI. Batch 1 covers pipeline ownership, stall stability, optional post-ERROR recovery, configured liveness, AXI4 write-response prerequisites, stalled R-payload stability, safety-versus-progress classification, and per-ID ordering. Batch 2 covers AHB arbitration handover, retimed response selection, exclusive-monitor verdicts, sampled HSEL, AXI 4 KB request checking, response routing, source-scoped local IDs, and safe ID narrowing.

The loader also normalizes historical exercise metadata and rejects malformed lab records. All declared lesson exercise references resolve. Legacy exercises were corrected where they confused protocol rules with recommendations or configured policy.

## Verification evidence

Latest complete commands:

```text
npm run test
npm run build
```

Results:

- Test files: 44
- Tests: 513 passed, 0 failed
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB
- Loader chunk: 349.98 kB
- Lesson page chunk: 171.84 kB
- Visual renderer chunk: 221.20 kB
- Search chunk: 27.63 kB
- Largest chunk: 349.98 kB

Live browser verification covered all sixteen Phase V4 lessons at desktop width and exactly 375 × 812. Every diagnostic lab rendered without missing content or page overflow. Evidence tables remained in internal scroll regions, Arrow/Home/End keyboard scrolling worked, choices/actions exceeded 44 px, representative AHB and AXI diagnoses completed, light/dark themes applied correctly, and the console stayed clean.

## Exact continuation point

The planned AHB/AXI visual-first, presentation, retention, and applied-DV work is complete. Continue only with targeted maintenance driven by learner feedback or a specific protocol-accuracy finding. Do not create an audit-only phase and do not begin APB without an explicit product-directive change.

The detailed implementation history and per-lesson status are in `docs/AHB_AXI_VISUAL_COMPLETION_TRACKER.md`.
