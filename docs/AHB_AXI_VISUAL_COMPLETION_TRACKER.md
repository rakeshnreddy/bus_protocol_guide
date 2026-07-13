# AHB/AXI Visual Completion Tracker

Last updated: 2026-07-13

## Current directive

Finish AHB and AXI visual and interactive learning to a high educational standard. All four AHB visual batches are complete. The next implementation batch is **AXI Visual Batch 1 — Lessons 01 through 11**.

## Phase V0 — Visual recovery

Status: complete.

- The production registry discovers both `content/visuals/*.json` and recursively nested visual JSON files through one non-duplicating glob.
- All 43 pre-existing assets are recoverable: 35 legacy root-level files and 8 typed-folder files.
- Seven Batch 1 assets, two Batch 2 assets, five Batch 3 assets, and four Batch 4 assets were added after recovery, bringing the live registry to 61 visuals.
- Root files prefer an explicit supported `type`; missing types use only the conservative `wf-`, `tl-`, `topo-`, and `sig-` prefix mapping.
- Malformed files, missing IDs, unsupported types, and duplicate IDs are isolated with source-path diagnostics. The first valid duplicate is preserved rather than overwritten.
- Current production diagnostics: 0 duplicate IDs, 0 malformed/missing-ID files, and 0 unsupported files.
- All declared and inline visual references across all 88 lessons resolve. Inline references are declared in lesson `visualIds` metadata.

### Registry inventory

| Visual type | Count |
| --- | ---: |
| Waveform | 29 |
| Timeline | 6 |
| Topology | 9 |
| Signal explorer | 11 |
| Coverage map | 2 |
| Formal property | 2 |
| Spec rule explorer | 2 |
| **Total** | **61** |

## Phase V1 — AHB Visual Batch 1 (Lessons 01–09)

Status: complete.

| Lesson | Visual IDs | Status | Learning purpose and interaction |
| --- | --- | --- | --- |
| 01 — AHB overview | `tp-basic-ahb` | Upgraded | Interactive SoC topology traces master, interconnect, address decoder, slave selection, forward command/write-data flow, and returning read-data/response flow. |
| 02 — AHB variants | `sig-ahb-variants` | Added | Expandable AHB/AHB-Lite/AHB5 comparison connects master context, arbitration, security, exclusives, and typical use. |
| 03 — AHB terminology | `topo-ahb-terminology-map` | Added | Interactive concept map connects roles, transfer/beat/burst hierarchy, pipelined phases, wait state, and response. |
| 04 — Clock and reset | `wf-ahb-reset` | Recovered and upgraded | Keyboard/touch cycle inspection explains asynchronous assertion, safe reset state, synchronous release, and first legal NONSEQ transfer. |
| 05 — Address and control | `sig-ahb-address-control` | Added | Expandable signal groups show direction, sampling, values, and a DV watchpoint for HADDR, HWRITE, HSIZE, HBURST, HPROT, HTRANS, and HMASTLOCK. |
| 06 — HTRANS transfer types | `wf-ahb-htrans-sequences`, `wf-ahb-simple-transfer` | Added and recovered | Cycle-selectable legal NONSEQ/SEQ/BUSY sequence is compared with an illegal SEQ restart after IDLE; the recovered simple transfer reinforces validity. |
| 07 — Burst and size | `sig-ahb-burst-size`, `wf-ahb-incr4-burst`, `wf-ahb-wrap4-burst` | Added and recovered | Expandable burst/size examples connect HBURST, HSIZE, beat count, alignment, increment, and wrap boundary to generated addresses. |
| 08 — Data and response | `wf-ahb-read-write-response`, `wf-ahb-wait-state` | Added and recovered | Cycle inspection distinguishes master/slave drivers, reads/writes, HREADY stalls, successful completion, and the two-cycle AHB-Lite ERROR response. |
| 09 — Lock, exclusive, security | `sig-ahb-access-attributes`, `tl-ahb-exclusive` | Added and recovered | Expandable mechanism comparison and focusable exclusive timeline prevent conflating HMASTLOCK, HEXCL/HEXOKAY, and HNONSEC. |

Lesson prose was preserved. Visuals are placed next to the concepts they explain, with matching inline IDs/frontmatter IDs and meaningful captions.

## Phase V1 — AHB Visual Batch 2 (Lessons 10–18)

Status: complete.

| Lesson | Visual IDs | Status | Learning purpose and interaction |
| --- | --- | --- | --- |
| 10 — Single transfers | `wf-ahb-simple-transfer` | Recovered and upgraded | Cycle inspection traces two independent SINGLE transfers, shows back-to-back NONSEQ address phases, and attributes read/write data to the prior address. |
| 11 — HTRANS semantics | `wf-ahb-illegal-htrans` | Recovered and upgraded | A highlighted violation cycle shows exactly how changing HTRANS, HADDR, and HWRITE while HREADY is low destroys a pending SEQ beat. |
| 12 — Burst progression | `wf-ahb-incr4-burst`, `sig-ahb-burst-size` | Upgraded and reused | The waveform traces fixed INCR4 phase ownership; the expandable explorer contrasts undefined INCR termination with fixed beat counts and wrap behavior. |
| 13 — Wrapping bursts | `wf-ahb-wrap4-burst` | Recovered and upgraded | Cycle annotations derive the 16-byte wrap region and identify the critical 0x3C-to-0x30 wrap decision. |
| 14 — HSIZE and alignment | `wf-ahb-hsize-byte-lanes` | Added | A keyboard/touch-inspectable waveform maps aligned byte, halfword, and word transfers to natural lanes on a little-endian 32-bit bus and flags a misaligned halfword. |
| 15 — Address/data phases | `wf-ahb-pipelined-sequence` | Recovered and upgraded | Explicit address- and data-owner rows show which accepted address owns each later HWDATA value as the pipeline fills and drains. |
| 16 — Wait states | `wf-ahb-wait-state-heavy` | Recovered and upgraded | Eight annotated cycles show the HREADY domino effect, stable address/control requirements, and the delayed acceptance of later beats. |
| 17 — Multi-cycle examples | `wf-ahb-wait-state-heavy` | Reused and strengthened | The same fully annotated waveform now matches the written eight-cycle worked example cycle for cycle. |
| 18 — Throughput vs latency | `wf-ahb-wait-state-heavy`, `wf-ahb-pipelined-sequence`, `tl-ahb-performance-comparison` | Reused and added | Two waveforms establish zero-wait and stalled behavior; an interactive completion timeline compares blank latency/stall windows and sustained beat spacing. |

Six legacy Batch 2 waveforms were converted from duplicated half-cycle storage to native per-cycle data so displayed cycle numbers, phase ownership, and annotations agree. Lesson prose was preserved and every declared Batch 2 visual is rendered inline with meaningful captions.

## Phase V1 — AHB Visual Batch 3 (Lessons 19–28)

Status: complete.

| Lesson | Visual IDs | Status | Learning purpose and interaction |
| --- | --- | --- | --- |
| 19 — Arbiter behavior | `wf-ahb-arbitration-handover`, `topo-ahb-multi-master` | Added and reused | Cycle inspection shows that grant is not ownership until an accepting edge with HREADY HIGH; the topology traces the selected owner through decode and return routing. |
| 20 — Decoder and slave selection | `topo-ahb-multi-master` | Reused and corrected | The highlighted target path separates arbitration from HSEL decode, response muxing, and valid-transfer behavior at the default slave. |
| 21 — Multi-master systems | `topo-ahb-multi-master`, `tl-ahb-multi-master-contention` | Reused and added | Focusable policy lanes compare fixed-priority latency/starvation with an implementation-defined round-robin example; early burst termination is taught accurately. |
| 22 — AHB-Lite simplifications | `sig-ahb-variants`, `tp-bus-architectures` | Reused | Expandable variant details and a structural architecture comparison connect the single-master interface to matrix-based multi-master systems. |
| 23 — AHB-to-APB bridge | `topo-ahb-apb-bridge` | Reused and clarified | The corrected topology distinguishes the bridge's upstream slave role, downstream master role, buffering/stall behavior, and response return path without adding APB curriculum. |
| 24 — Error responses | `wf-ahb-review-error` | Recovered and upgraded | Cycle inspection attributes both ERROR cycles to the failed data phase and teaches cancellation of remaining burst transfers as permitted, not required. |
| 25 — Locked sequences | `tl-ahb-locked-sequence`, `sig-ahb-access-attributes` | Added and reused | Timeline lanes distinguish the original master's HLOCKx request from arbiter-generated HMASTLOCK, then show why another requester waits. |
| 26 — Exclusive accesses | `tl-ahb-exclusive` | Recovered and upgraded | Parallel success/failure lanes compare HEXOKAY=1 with an interference-driven HEXOKAY=0 while keeping the bus unlocked and HRESP semantics separate. |
| 27 — Secure vs Non-secure | `topo-ahb-security-filter` | Added | Collision-tested topology traces HNONSEC with the address phase through implementation-defined policy enforcement to allowed targets or a two-cycle ERROR. |
| 28 — AHB5 vs AHB2 | `sig-ahb-evolution` | Added | Expandable comparison corrects topology, response, locking, identity, optional AHB5 properties, and the 1 KB boundary rule across generations. |

Protocol claims were checked against Arm AMBA Specification IHI 0011A and Arm AMBA 5 AHB Protocol Specification IHI 0033B.b. Accuracy guards now prevent regressions in ERROR cancellation, HLOCKx/HMASTLOCK ownership, optional AHB5 properties, exclusive success/failure, HMASTER usage, and the cross-generation 1 KB burst boundary.

## Phase V1 — AHB Visual Batch 4 (Lessons 29–38)

Status: complete.

| Lesson | Visual IDs | Status | Learning purpose and interaction |
| --- | --- | --- | --- |
| 29 — Simulation strategy | `topo-ahb-dv-environment` | Added | Keyboard/pointer-inspectable evidence flow separates stimulus, pin driving, accepted-phase monitoring, independent prediction, assertions, and coverage. |
| 30 — Assertions and checkers | `sig-ahb-assertion-library` | Added | Expandable checker library connects each trigger to its obligation, legal exception, and DV failure signature, including BUSY/INCR termination and ERROR timing. |
| 31 — Functional coverage | `cm-ahb-burst-resp` | Recovered and upgraded | Keyboard-selectable coverage bins distinguish legal holes, covered scenarios, and revision-specific illegal response bins without treating a raw percentage as signoff. |
| 32 — Formal properties | `fp-ahb-hready-liveness` | Recovered and corrected | Editable HREADY scenario demonstrates a configured four-cycle completion contract while explicitly separating product liveness assumptions from universal protocol rules. |
| 33 — Common RTL bugs | `wf-ahb-bug-wait-state`, `wf-ahb-bug-decoder-glitch`, `spec-rule-explorer-ahb` | Recovered and corrected | Two diagnostic waveforms expose early write-data advance and unsafe asynchronous HSEL consumption; the rule explorer connects symptoms to protocol and integration obligations. |
| 34 — Debug case studies | `wf-ahb-bug-wait-state`, `wf-ahb-bug-decoder-glitch` | Reused and corrected | Cycle ownership marks the first violating edge, while the decoder example separates a raw sub-cycle transient from the value sampled at the accepting edge. |
| 35 — Expert checklist | `sig-ahb-signoff-evidence` | Added | Expandable evidence board requires concrete assertion, scoreboard, coverage, configuration, and analysis artifacts before each interactive checklist claim is accepted. |
| 36 — Signal reference | `sig-ahb-full` | Recovered and comprehensively upgraded | Version-aware reference covers core AHB, original shared-bus arbitration/response signals, and optional AHB5 security, exclusive, and memory-type capabilities. |
| 37 — Waveform review | `wf-ahb-review-error`, `wf-ahb-illegal-htrans`, `wf-ahb-wait-state-heavy` | Recovered and expanded | Three keyboard-inspectable review scenarios test ERROR ownership/cancellation, pending-address stability, and the HREADY phase-ownership domino effect. |
| 38 — Interview recap | `sig-ahb-senior-recap` | Added | Expandable recall map pairs concise senior-level answers with deeper phase, response, burst, version, and signoff reasoning. |

Batch 4 accuracy guards cover HTRANS progression, optional post-ERROR cancellation, configured liveness/fairness bounds, decoder sampling, data-phase ownership, complete expert-checklist loading, version-specific signal direction, waveform cycle alignment, and the recap's HREADY exceptions. The coverage grid and checklist now expose semantic state/progress accessibly, and the exercise heading hierarchy was corrected after axe testing.

## Batch 4 browser verification

Verified all ten lesson routes plus `/visuals` and `/dev/visuals` in the live application. Desktop light-theme inspection and 375 × 812 dark/system-theme inspection covered:

- `/lesson/29_ahb_simulation_strategy`
- `/lesson/30_ahb_assertions`
- `/lesson/31_ahb_functional_coverage`
- `/lesson/32_ahb_formal_properties`
- `/lesson/33_common_rtl_bugs`
- `/lesson/34_debug_case_studies`
- `/lesson/35_ahb_expert_checklist`
- `/lesson/36_ahb_signal_reference`
- `/lesson/37_ahb_waveform_review`
- `/lesson/38_ahb_interview_recap`
- `/visuals`
- `/dev/visuals`

Results: all lesson headings and declared inline visuals rendered; no blank visual regions, `Visual not found`, unknown types, page-level horizontal overflow, or console warnings/errors. The Visuals Explorer showed 61 registry cards and the dev gallery rendered 61 level-two visual headings. At 375 px, the 784 px topology and 520–760 px waveform canvases scrolled internally. The mobile curriculum opened/closed, system/light/dark selection worked, and Enter selected the scoreboard node and exposed its independent-evidence explanation.

### Verification baseline after Batch 4

- Test files: 38
- Tests: 324
- Test failures: 0
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB minified
- Loader chunk: 273.54 kB minified
- Lesson page chunk: 162.28 kB minified
- Visual renderer chunk: 140.56 kB minified
- Search chunk: 27.63 kB minified
- Largest chunk: 273.54 kB, below the existing 500 kB warning threshold

## Interaction, accessibility, and responsive status

- Waveform cycles and topology nodes/connections support pointer and keyboard activation with visible focus treatment.
- Signal explorer entries and timeline phases use native buttons with expanded/pressed state and structured details.
- Interactive signal controls are 52 px high; waveform cycle targets are 80 px wide; topology connections use 44 px hit strokes.
- The mobile menu is at least 44 × 44 px, the search field is 44 px high, and the closed sidebar is fully off-canvas.
- Dense waveform, topology, and timeline content uses internal horizontal scrolling; no page-level overflow was observed at 375 × 812.
- Visual descriptions, cycle/phase annotations, driver labels, and DV watchpoints are exposed as readable text rather than decorative-only graphics.

## Batch 1 browser verification

Verified at 1440 × 1000 and 375 × 812:

- `/lesson/01_ahb_overview`
- `/lesson/02_ahb_variants`
- `/lesson/03_ahb_terminology`
- `/lesson/04_clock_and_reset`
- `/lesson/05_address_and_control`
- `/lesson/06_htrans_transfer_types`
- `/lesson/07_burst_and_size`
- `/lesson/08_data_and_response`
- `/lesson/09_lock_exclusive_security`
- `/visuals`
- `/dev/visuals`

Results: no `Visual not found`, no blank inline visual regions, no browser console warnings/errors, functional preview/signal/navigation controls, readable prose, and internal scrolling for wide visuals.

## Batch 2 browser verification

Verified at 1440 × 1000 and 375 × 812:

- `/lesson/10_single_transfers`
- `/lesson/11_htrans_semantics`
- `/lesson/12_burst_progression`
- `/lesson/13_wrapping_bursts`
- `/lesson/14_hsize_and_alignment`
- `/lesson/15_address_data_phase`
- `/lesson/16_wait_states_hready`
- `/lesson/17_multi_cycle_examples`
- `/lesson/18_throughput_vs_latency`
- `/visuals`
- `/dev/visuals`

Results: 52 gallery preview controls, no `Visual not found`, no blank visual regions, no browser console warnings/errors, functional cycle/timeline/gallery controls, 80 px waveform cycle targets, 52 px timeline targets, no page-level mobile overflow, and internal horizontal scrolling for every dense waveform/timeline.

## Batch 3 verification

Production-component acceptance covers:

- `/lesson/19_arbiter_behavior`
- `/lesson/20_decoder_and_slave_selection`
- `/lesson/21_multi_master_systems`
- `/lesson/22_ahb_lite_simplifications`
- `/lesson/23_ahb_to_apb_bridge`
- `/lesson/24_error_responses`
- `/lesson/25_locked_sequences`
- `/lesson/26_exclusive_accesses`
- `/lesson/27_secure_vs_non_secure`
- `/lesson/28_ahb5_vs_ahb2`
- `/visuals`

Results: all ten lessons render every declared visual and meaningful caption through the production `LessonRenderer`; every changed visual renders through the production registry; waveform, timeline, topology, and explorer keyboard interactions pass; the security lesson passes axe; topology geometry proves no block, connector, or caption collisions; dense visuals retain their mobile-safe internal scroll containers.

Interactive browser automation could not revisit the local routes because the in-app browser entered a stale connection-error document and its local-page security policy blocked further navigation. The safeguard was not bypassed. Browser claims from earlier batches remain unchanged; Batch 3 acceptance is based on production rendering/integrity tests until a normal local browser session is available.

### Verification baseline after Batch 3

- Test files: 37
- Tests: 286
- Test failures: 0
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB minified
- Loader chunk: 267.28 kB minified
- Lesson page chunk: 162.15 kB minified
- Visual renderer chunk: 120.72 kB minified
- Search chunk: 27.63 kB minified
- Largest chunk: 267.28 kB, below the existing 500 kB warning threshold

## Verification baseline after Batch 2

- Test files: 33
- Tests: 233
- Test failures: 0
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 240.48 kB minified
- Loader chunk: 262.08 kB minified
- Lesson page chunk: 162.26 kB minified
- Visual renderer chunk: 88.00 kB minified
- Search chunk: 27.63 kB minified
- Largest chunk: 262.08 kB, below the existing 500 kB warning threshold

## Visual theme and navigation overhaul

Status: complete (2026-07-13).

- Added a three-state `System / Light / Dark` theme control. System is the default, explicit choices persist locally, and an early document bootstrap prevents a mismatched first paint.
- Rebuilt the shell as a luminous engineering workspace: structural glass top navigation/sidebar, crisp learning surfaces, protocol-coded hierarchy, atmospheric grid canvas, and visible active-route state.
- Replaced the flat home page with a visual protocol bench, clear AHB/AXI learning paths, a waveform-led hero, and direct access to the visual, glossary, and specification-rule tools.
- Added collapsible protocol curriculum navigation with lesson counts, order labels, active lesson state, a mobile off-canvas drawer, and compact quick-reference navigation.
- Added protocol curriculum maps for Foundations, AHB, and AXI with level grouping, visual counts, summaries, and 44 px navigation targets.
- Added per-lesson protocol progress plus previous/next lesson continuity without changing lesson prose.
- Rethemed search, glossary, exercises, checklists, spec rules, gallery cards, waveform/timeline/topology/signal/coverage/formal surfaces, errors, and annotations for both color schemes.
- Documented the reusable visual system in `DESIGN.md` and `.impeccable/design.json`; product design constraints remain in `PRODUCT.md`.
- Browser-verified `/`, `/ahb`, `/lesson/04_clock_and_reset`, `/lesson/07_burst_and_size`, `/visuals`, `/glossary`, and `/dev/visuals` at 1440 × 1000 and 375 × 812.
- Browser results: both themes render correctly, system/light/dark selection works, 52 gallery assets register, representative visuals render, no `Visual not found`, no page-level horizontal overflow, mobile waveforms scroll internally, the drawer opens/closes correctly, all theme/menu controls measure at least 44 × 44 px, and the console contains no warnings or errors.

### Verification baseline after UI overhaul

- Test files: 34
- Tests: 236
- Test failures: 0
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB minified
- Loader chunk: 262.07 kB minified
- Lesson page chunk: 162.15 kB minified
- Visual renderer chunk: 87.32 kB minified
- Search chunk: 27.63 kB minified
- Largest chunk: 262.07 kB, below the existing 500 kB warning threshold

## Topology and block-diagram remediation

Status: complete (2026-07-13).

All seven production topology assets were reviewed individually for protocol meaning, spatial layout, route direction, text containment, interaction, responsive behavior, and both color themes. The renderer now sizes blocks from their content, wraps long labels, computes a padded view box, anchors connections at block boundaries, supports orthogonal waypoints, and keeps captions clear of blocks and one another. Diagram selection uses persistent keyboard- and pointer-operable controls with a readable detail panel; motion is limited to short state transitions and respects reduced-motion preferences.

| Visual ID | Protocol/content review and correction |
| --- | --- |
| `tp-basic-ahb` | Clarified command/write-data and read-data/response directions, separated decoder and selected-slave responsibilities, and routed return traffic without crossing the forward path. |
| `topo-ahb-terminology-map` | Replaced misleading hardware-role styling with concept, phase, and state semantics; rebuilt the map around transfer → beat → burst and address/data phase relationships. |
| `topo-ahb-multi-master` | Routed masters through the ownership mux, separated request/grant lanes, added the default-slave path, and made arbitration, decode, and response ownership explicit. |
| `topo-ahb-apb-bridge` | Corrected node roles, separated the AHB and APB domains, and showed the bridge-held AHB transfer while APB completes its setup/access sequence. |
| `tp-axi-apb-bridge` | Normalized the legacy diagram schema and clarified channel capture, single-outstanding APB execution, response return, and backpressure behavior. |
| `tp-axi-crossbar` | Clarified concurrent master/slave routing, per-target contention, response return paths, and implementation-configured source/ID tracking. |
| `tp-bus-architectures` | Added the previously omitted switched-crossbar model and separated point-to-point, shared-bus, and crossbar examples into aligned comparison regions. |

### Diagram integrity and browser verification

- Automated geometry checks cover unique node/edge IDs, valid endpoints, block containment, block separation, orthogonal routes, routes not passing through unrelated blocks, and non-overlapping route captions.
- All seven assets render through the production registry and production `TopologyViewer`; topology accessibility is included in the axe suite.
- Verified the seven filtered topology previews in `/visuals` in dark mode and the AXI crossbar in light mode at desktop size.
- Verified all seven diagrams at 375 × 812: no page-level overflow, no clipped block text, and every 784 px diagram canvas scrolls inside its 289 px content viewport.
- Selection, hover/focus feedback, detail text, route highlighting, and 44 px connection hit areas were exercised. Browser console warnings/errors: 0.

### Verification baseline after topology remediation

- Test files: 36
- Tests: 256
- Test failures: 0
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB minified
- Loader chunk: 262.07 kB minified
- Lesson page chunk: 162.15 kB minified
- Visual renderer chunk: 104.81 kB minified
- Search chunk: 27.63 kB minified
- Largest chunk: 262.07 kB, below the existing 500 kB warning threshold

## Remaining AHB visual coverage

No AHB lesson is without an inline, registry-resolved visual. All 38 AHB lessons have completed their batch-level educational-strength review. Future AHB changes are maintenance and presentation polish, not missing-coverage work.

## Next implementation batch

**AXI Visual Batch 1 — Lessons 01 through 11**

Recover and strengthen existing AXI assets first, then add only the visual support needed to make the five-channel model, channel independence, VALID/READY timing, basic read/write ownership, bursts, IDs, and backpressure visually inspectable and retention-oriented. Do not begin APB.
