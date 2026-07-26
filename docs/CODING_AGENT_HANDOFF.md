# Bus Protocol DV Academy — Coding Agent Handoff

Last updated: 2026-07-27

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

All four AHB visual batches, all four AXI visual batches, Phase V3 presentation/retention polish, audit R4 executable models, and all six Task 7 packages are complete. Every AHB and AXI lesson retains registry-resolved inline visual support. The production registry now contains 88 visuals:

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

`docs/AUDIT_REMEDIATION_TRACKER.md` tracks 102 terminal rows: 101 Implemented and one Superseded by spec-validated correction, with zero Not started, In progress or Blocked rows. The original superseded claim remains the audit recommendation that the selected AHB base address width is configurable; IHI 0011A and IHI 0033B.b both define `HADDR[31:0]`.

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

GitHub Actions run [29617021398](https://github.com/rakeshnreddy/bus_protocol_guide/actions/runs/29617021398) independently passed locked install, all 646 tests and the production build on `main` in 1m2s with zero job annotations. `actions/setup-node@v7` uses the current action runtime; no warning suppression was introduced.

## Release-candidate production gate

`v1.0.0-rc.1` is deployed at [busprotocolguide.vercel.app](https://busprotocolguide.vercel.app). The Vercel production build reached `Ready`, and the catch-all rewrite served direct AHB, AXI, Visuals Explorer, development visual, and glossary URLs successfully.

The post-deployment accessibility pass gave the named lesson-progress and visual-position metadata explicit group semantics. A focused regression test covers both accessible names.

Latest local gate:

- Test files: 50
- Tests: 654 passed, 0 failed
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB
- Loader chunk: 404.47 kB
- Lesson page chunk: 172.04 kB
- Visual renderer chunk: 318.42 kB
- Search chunk: 27.63 kB
- Largest chunk: 404.47 kB, below 500 kB

Production checks passed at 1440 × 1000 and exactly 375 × 812 for the home page, representative AHB and AXI lessons, `/visuals`, `/dev/visuals`, `/glossary`, and production search. Direct-route loading, TSTRB content, system/light/dark themes, reduced motion, 44 px controls, internal mobile scrolling, page containment, and console/page cleanliness passed. The live AXI accessibility scan reported zero WCAG A/AA violations.

## Learner pilot readiness

The release candidate now includes a facilitator guide, anonymized session
template, aggregate report template, and privacy-safe GitHub finding form.
`src/release-readiness.test.ts` guards the production URL, exact task routes,
boundary examples, scoring criteria, privacy fields, and APB exclusion.

The dated facilitator dry run exercised all eight pilot tasks on production.
Both live calculators produced the expected AHB 1 KB and AXI 4 KB/lane results;
the formal WLAST interaction exposed its AWID 9 accepted-beat diagnostic;
search and Visuals Explorer discovery succeeded; and the exact `375 × 812`
repeat passed containment, 44 px, internal-scroll, reduced-motion, and console
checks. This dry run proves facilitator readiness, not learner comprehension.
Real results from 3–5 anonymized participants are still required before
promotion to `v1.0.0`.

`npm run pilot:simulate` adds a deterministic recovery simulation across four
personas: new-to-AMBA, AHB-experienced, AXI-experienced, and senior mobile/
keyboard. The simulation executes real content probes, `calculateBurst`,
`evaluateFormalProperty`, production search, and visual-registry lookup. It
passes 20/24 synthetic protocol first attempts (83.3%), recovers all four
seeded misconceptions, completes all eight discovery/mobile attempts, and
finds zero failed probes. Its result type permanently sets
`canPromoteRelease: false`; it advances recovery confidence without being
misrepresented as human evidence.

`npm run pilot:aggregate` now validates and aggregates versioned, privacy-safe
session JSON. It requires all eight task records, explicit recovery and
usability evidence, one production URL and full tested commit, the 3–5-person
experience mix, resolved finding IDs, and regression/deployment evidence for a
fixed release blocker. It fails closed for incomplete records, obvious
identifying fields, email-like values, mixed targets, and privacy-unsafe
content. Synthetic or mixed evidence is always `not-eligible`;
`conditional-go` is limited to open wording/discoverability follow-ups; and
`canPromoteStable` is true only for a fully eligible human `go`.

The versioned structure is documented in
`docs/LEARNER_PILOT_DATA_FORMAT.md` and
`docs/learner-pilot/session.schema.json`. Raw session JSON belongs under the
ignored `pilot-sessions/` directory and must not be committed.

Latest complete local gate after the evidence-aggregation package:

- Test files: 52
- Tests: 660 passed, 0 failed
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB
- Loader chunk: 404.47 kB
- Lesson page chunk: 172.04 kB
- Visual renderer chunk: 318.42 kB
- Search chunk: 27.63 kB
- Largest chunk: 404.47 kB, below 500 kB

## Final publication state

AHB and AXI audit remediation is complete. Both `origin/agent/axi-visual-batches-1-2` and `origin/main` were fast-forwarded to the same verified history without force or a pull request. The six source audit reports remain unchanged.

Do not begin APB unless the product directive changes. Future work should preserve the 88-lesson/88-visual reference closure, the warning-free 660-test/build gate, and the protocol distinctions encoded by the remediation suites.
