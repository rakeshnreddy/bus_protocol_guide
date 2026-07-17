# Bus Protocol DV Academy — Coding Agent Handoff

Last updated: 2026-07-18

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

All four AHB visual batches, all four AXI visual batches, Phase V3 presentation/retention polish, and audit R4 executable models are present. All six Task 7 packages are implemented; five have complete local automated/browser evidence and the CI package awaits its published-main run. Every AHB and AXI lesson retains registry-resolved inline visual support. The production registry now contains 88 visuals:

| Type | Count |
| --- | ---: |
| Waveform | 31 |
| Timeline | 11 |
| Topology | 13 |
| Signal explorer | 19 |
| Coverage map | 2 |
| Formal property | 2 |
| Spec rule explorer | 2 |
| Checker model | 8 |

Current registry diagnostics: 0 duplicates, 0 malformed/missing-ID files, 0 unsupported files, and 35 recovered root-level legacy assets.

Phase V3 provides a consistent visual-inspection workflow and retrieval panel across all 88 lessons. The Visuals Explorer groups the complete registry by protocol and supports search, type/protocol filters, production previews, empty-state recovery, and light/dark/system themes.

## Phase V4 status

Both AHB/AXI Applied DV Practice batches are complete. A reusable `diagnostic-lab` exercise schema, strict production normalization, responsive evidence table, three-step diagnostic workflow, per-step reasoning feedback, scoring, and reset behavior are implemented.

Sixteen primary-source-reviewed labs are integrated: eight AHB and eight AXI. Batch 1 covers pipeline ownership, stall stability, optional post-ERROR recovery, configured liveness, AXI4 write-response prerequisites, stalled R-payload stability, safety-versus-progress classification, and per-ID ordering. Batch 2 covers AHB arbitration handover, retimed response selection, exclusive-monitor verdicts, sampled HSEL, AXI 4 KB request checking, response routing, source-scoped local IDs, and safe ID narrowing.

The loader also normalizes historical exercise metadata and rejects malformed lab records. All declared lesson exercise references resolve. Legacy exercises were corrected where they confused protocol rules with recommendations or configured policy.

## Audit-remediation status

`docs/AUDIT_REMEDIATION_TRACKER.md` now tracks 102 rows: the historical 96-row audits1-6 program plus six Task 7 findings supplied by the user on 2026-07-18. AXI-T7-01 through AXI-T7-05 are terminal with source, test/build and live-browser evidence; AXI-T7-06 waits only for the published-main GitHub Actions run. The original superseded claim remains the audit recommendation that the selected AHB base address width is configurable; IHI 0011A and IHI 0033B.b both define `HADDR[31:0]`.

R3 corrected synchronous channel/dependency terminology, exact WRAP lengths, AXI4-Lite outstanding nuance, optional early-W acceptance and required buffering, full USER payload stability, response independence/prerequisites, per-ID/destination ordering, accepted LAST retirement, AXI3 WID versus AXI4 AW order, lane/WSTRB legality, and exact final-byte/end-exclusive 4 KB math. Ten AXI spec rules now carry IHI 0022H section and requirement-type provenance.

R4 introduced a reusable typed `checker-model` visual with native scenario/step controls, retained-state inspection, typed requirement results and a reviewable traceability table. Eight assets implement Foundations DV, AHB core/system/formal rigor, AXI write/read/burst checking and cross-protocol signoff evidence. They are integrated into nine audited/signoff lessons and production rendering/catalog discovery.

R5 extended that existing interaction with the missing Foundation/AHB policy states, six AXI write-order/stall modes, read-gap/backpressure/early-RLAST modes, registry-boundary malformed-model isolation, and a live AHB/AXI burst/lane/boundary calculator. Exact formula tests cover unaligned lane masks, WRAP address order, accepted LAST, AHB 1 KB and AXI 4 KB final-byte/end-exclusive splits.

R6 added a whole-corpus closure guard, revalidated all declared references and reconciled shared/late-AXI wording. Original-AHB locking now describes arbitration-path ownership rather than universal address exclusion; RETRY and SPLIT teach their distinct eligibility/`HSPLITx` behavior; AXI channel prose retains mandatory cross-channel dependencies; WRAP lengths are exact; and the 4 KB rule consistently uses first/final-byte decode regions rather than virtual-memory page rationale. The stale AHB burst-reference route was corrected. No APB curriculum, route, tracker or standalone asset was added.

R2 introduced no APB curriculum. The existing AHB bridge lesson alone received its audited upstream-direction, Setup/Access, read/write, and buffering corrections. The production `TopologyViewer` remains the only topology renderer.

## Verification evidence

Latest complete commands:

```text
npm run test
npm run build
```

Historical R6 results:

- Test files: 48
- Tests: 635 passed, 0 failed
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB
- Loader chunk: 400.75 kB
- Lesson page chunk: 172.01 kB
- Visual renderer chunk: 312.02 kB
- Search chunk: 27.63 kB
- Largest chunk: 400.75 kB

Latest live browser verification covered every one of the 88 lesson routes at 1440 × 1000 and exactly 375 × 812 (176 lesson checks), plus eight shared/reference routes at both viewports (16 checks). Every lesson and visual rendered without missing or blank content, page overflow, undersized tested control, reduced-motion violation, console warning, or page error. Search, light/dark/system themes, topology pointer/Enter/Space and pressed state, 44 px connector hit areas and mobile internal scrolling passed. Ten representative axe WCAG A/AA scans reported zero serious or critical violations after active sidebar-order and Visuals-filter contrast were corrected.

Latest Task 7 local automated results:

- Test files: 49
- Tests: 646 passed, 0 failed
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB
- Loader chunk: 404.47 kB
- Lesson page chunk: 172.01 kB
- Visual renderer chunk: 318.42 kB
- Search chunk: 27.63 kB
- Largest chunk: 404.47 kB

The Task 7 browser rerun passed AXI 28/29/33/37/39 plus `/visuals`, `/dev/visuals`, `/glossary` and production search at desktop and exactly 375 × 812. The AXI-Stream TSTRB waveform, transaction-aware WLAST failure message, exact debug data, AXI-to-AHB topology and AXI4-Lite wording rendered correctly. Pointer/Enter/Space, pressed state, 44 px topology-edge targets, mobile internal scrolling, light/dark/system themes and reduced motion passed with no page overflow, blank/missing state, console warning or page error.

## Exact continuation point

Task 7 is locally complete and verified. The only nonterminal row is AXI-T7-06: commit the browser evidence, fast-forward the verified commit to the topic branch and `main`, and wait for GitHub Actions to reproduce `npm run test` and `npm run build`. The six source audit reports remain unchanged.

Continue from the current `agent/axi-visual-batches-1-2` worktree. Rerun the complete automated gate, commit the evidence, fast-forward `main`, push, and wait for the GitHub Actions run before marking AXI-T7-06 terminal. Do not reset the existing branch, edit the six audit reports, or begin APB.
