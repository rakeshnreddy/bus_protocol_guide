# Bus Protocol DV Academy — Coding Agent Handoff

Last updated: 2026-07-13

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

## AHB status

All four AHB visual batches are complete. Every one of the 38 AHB lessons has at least one inline, production-registry-resolved visual and has received a batch-level educational and protocol-accuracy review.

The registry currently contains 61 visuals:

| Type | Count |
| --- | ---: |
| Waveform | 29 |
| Timeline | 6 |
| Topology | 9 |
| Signal explorer | 11 |
| Coverage map | 2 |
| Formal property | 2 |
| Spec rule explorer | 2 |

Current registry diagnostics: 0 duplicates, 0 malformed/missing-ID files, 0 unsupported files, and 35 recovered root-level legacy assets.

Batch 4 (lessons 29–38) added or comprehensively upgraded:

- `topo-ahb-dv-environment`
- `sig-ahb-assertion-library`
- `cm-ahb-burst-resp`
- `fp-ahb-hready-liveness`
- `wf-ahb-bug-wait-state`
- `wf-ahb-bug-decoder-glitch`
- `sig-ahb-signoff-evidence`
- `sig-ahb-full`
- `sig-ahb-senior-recap`

Protocol claims are guarded by tests for HTRANS progression, two-cycle ERROR handling and optional cancellation, configured liveness/fairness, accepted-edge HSEL sampling, address/data phase ownership, version-specific signals, locks versus exclusives/security, and the 1 KB boundary.

## Verification evidence

Latest complete commands:

```text
npm run test
npm run build
```

Results:

- Test files: 38
- Tests: 324 passed, 0 failed
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB
- Loader chunk: 273.54 kB
- Lesson page chunk: 162.28 kB
- Visual renderer chunk: 140.56 kB
- Search chunk: 27.63 kB
- Largest chunk: 273.54 kB

Live browser verification covered AHB lessons 29–38, `/visuals`, and `/dev/visuals` at desktop and 375 px mobile width, including light/dark/system themes, mobile navigation, keyboard diagram inspection, internal horizontal scrolling, and console cleanliness. The explorer listed 61 cards and the dev gallery rendered all 61 visual headings without missing or unknown visuals.

## Exact continuation point

Next task: **AXI Visual Batch 1 — Lessons 01 through 11**.

Recover and improve existing AXI assets before creating new ones. Prioritize the five-channel model, channel independence, VALID/READY timing, basic read/write ownership, bursts, IDs, and backpressure. Apply the same production-registry, rendering, accessibility, geometry, protocol-accuracy, browser, test, and build gates used for AHB.

The detailed implementation history and per-lesson status are in `docs/AHB_AXI_VISUAL_COMPLETION_TRACKER.md`.
