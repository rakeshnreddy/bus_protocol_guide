# AHB/AXI Visual Completion Tracker

Last updated: 2026-07-17

## Current directive

Finish AHB and AXI visual and interactive learning to a high educational standard. All four AHB visual batches, all four AXI visual batches, **Phase V3 — presentation and retention polish**, Phase V4 applied-DV practice, and audit-remediation phases R1-R6 are complete. The closed evidence is in `docs/AUDIT_REMEDIATION_TRACKER.md`. Do not begin APB.

## Phase V0 — Visual recovery

Status: complete.

- The production registry discovers both `content/visuals/*.json` and recursively nested visual JSON files through one non-duplicating glob.
- All 43 pre-existing assets are recoverable: 35 legacy root-level files and 8 typed-folder files.
- AHB/AXI completion and audit remediation have expanded the recovered library to 87 production visuals without duplicating a legacy ID.
- Root files prefer an explicit supported `type`; missing types use only the conservative `wf-`, `tl-`, `topo-`, and `sig-` prefix mapping.
- Malformed files, missing IDs, unsupported types, and duplicate IDs are isolated with source-path diagnostics. The first valid duplicate is preserved rather than overwritten.
- Current production diagnostics: 0 duplicate IDs, 0 malformed/missing-ID files, and 0 unsupported files.
- All declared and inline visual references across all 88 lessons resolve. Inline references are declared in lesson `visualIds` metadata.

### Registry inventory

| Visual type | Count |
| --- | ---: |
| Waveform | 31 |
| Timeline | 11 |
| Topology | 12 |
| Signal explorer | 19 |
| Coverage map | 2 |
| Formal property | 2 |
| Spec rule explorer | 2 |
| Checker model | 8 |
| **Total** | **87** |

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

## Phase V2 — AXI Visual Batch 1 (Lessons 01–11)

Status: complete.

The batch uses AXI4 as its default protocol scope and labels AXI3, AXI4-Lite, and AXI4-Stream differences where they matter. Protocol claims were checked against Arm AMBA AXI and ACE Protocol Specification IHI 0022H, especially the channel architecture, VALID/READY rules, AXI4 write-response dependencies, burst limits, ID ordering, response behavior, and AXI4 attribute definitions.

| Lesson | Visual IDs | Status | Learner question, purpose, and interaction |
| --- | --- | --- | --- |
| 01 — What is AXI? | `tp-axi-crossbar`, `tl-abstract-transaction` | Reused and upgraded | “Where does AXI sit in an SoC, and when is work outstanding?” The existing crossbar exposes concurrent routes and source-ID tracking; the rebuilt timeline compares overlapping read/write channel lifetimes without implying shared-bus arbitration. |
| 02 — AXI variants | `sig-axi-variants` | Added | “Which AXI interface fits this design?” Expandable entries compare AXI3, AXI4, AXI4-Lite, and AXI4-Stream burst, ID, channel, ordering, and usage differences, including Lite's legal multiple-outstanding behavior. |
| 03 — AXI terminology | `topo-axi-terminology-map` | Added | “How do transaction, burst, beat, handshake, outstanding state, ID, and response relate?” Keyboard/pointer inspection connects the structural hierarchy to lifetime and correlation. |
| 04 — Five-channel model | `topo-axi-five-channels`, `wf-axi-write-channels`, `wf-axi-read-channels` | Added, recovered, and upgraded | “Who sources each channel and where does READY return?” Five distinct lanes show ownership; the write/read waveforms then trace independent address, data, and response progress under stalls. |
| 05 — Write address channel | `sig-axi-address-channels` | Added | “Which AW edge creates a write, and what must remain stable?” Fourteen AW/AR entries expose direction, accepting edge, encoding, and DV watchpoint. |
| 06 — Write data channel | `wf-axi-write-channels` | Recovered and upgraded | “Can W arrive before AW, and what freezes during W backpressure?” Cycle inspection shows legal pre-AW data, stable W payload, exact WLAST, and the later B dependency. |
| 07 — Write response channel | `wf-axi-ids-correlation` | Recovered and upgraded | “How can responses reorder without interleaving AXI4 write data?” Two writes send W data in AW order and return B responses in different-ID order, with same-ID ordering called out. |
| 08 — Read address channel | `sig-axi-address-channels` | Reused | “How does AR parallel AW and what state does ARLEN create?” Expandable AR entries connect request definition to RID correlation and exact RLAST counting. |
| 09 — Read data channel | `wf-axi-read-channels` | Recovered and upgraded | “What must a slave hold when RREADY is LOW?” RID, RDATA, RRESP, and RLAST remain stable through a two-cycle stall; the final error demonstrates per-beat RRESP without canceling the burst. |
| 10 — Sideband attributes | `sig-axi-sideband-attributes` | Added | “What is protocol encoding versus system policy?” AxPROT, AxCACHE, AxQOS, and AxREGION separate specified bit meaning from permission, scheduling, and mapping policy. |
| 11 — Ready/Valid in depth | `wf-axi-ready-valid-scenarios` | Added | “Which rising edges transfer, and why is early VALID withdrawal illegal?” Cycle inspection compares VALID-first, READY-first, simultaneous, stalled, and violating sequences. |

### AXI Batch 1 accuracy and interaction guards

- Five-channel topology checks encode source/destination ownership and coherent READY return paths.
- Waveform guards prove accepting edges, stable payload under backpressure, AXI4 AW/final-W response prerequisites, exact beat counts, per-beat RRESP, AXI4 W ordering, and different-ID B reordering.
- Explorer guards preserve AXI4 burst limits, WID removal, AXI4-Lite ordering nuance, AxCACHE Modifiable semantics, AxPROT security polarity, and implementation-defined AxQOS policy.
- All eleven lessons render every declared visual inline with meaningful captions through the production loaders and renderers.
- Both new topologies pass unique-ID, endpoint, containment, separation, orthogonal-routing, route-through-block, and caption-collision checks.
- Production interaction tests cover Enter/Space selection, persistent pressed state, 44 px topology route hit areas, 52 px explorer controls, waveform cycle inspection, internal horizontal scrolling, and axe scans.

### AXI Batch 1 browser verification

Verified in the live application at 1440 × 1000 in light theme and 375 × 812 in dark theme:

- `/lesson/01_what_is_axi`
- `/lesson/02_axi_variants`
- `/lesson/03_axi_terminology`
- `/lesson/04_five_channel_model`
- `/lesson/05_write_address_channel`
- `/lesson/06_write_data_channel`
- `/lesson/07_write_response_channel`
- `/lesson/08_read_address_channel`
- `/lesson/09_read_data_channel`
- `/lesson/10_sideband_signals`
- `/lesson/11_ready_valid_in_depth`
- `/visuals`
- `/dev/visuals`

Results: all declared visuals rendered with no blank areas, `Visual not found`, unknown types, page-level horizontal overflow, or console warnings/errors. The Visuals Explorer reported 67 registered assets. The five-channel B route was selected with Enter and exposed the AXI4 AW/final-W dependency. At 375 px, every topology, waveform, and transaction timeline scrolled inside its visual surface; the five-channel topology used a 315 px viewport over its 784 px diagram and accepted horizontal scrolling to the final lane. Explorer and gallery controls remained at least 45 px high.

### Verification baseline after AXI Batch 1

- Visual registry: 67 assets
- Visuals by type: 30 waveforms, 6 timelines, 11 topologies, 14 signal explorers, 2 coverage maps, 2 formal properties, 2 specification-rule explorers
- Legacy root-level visuals retained: 35
- Test files: 39
- Tests: 363
- Test failures: 0
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB minified
- Loader chunk: 278.27 kB minified
- Lesson page chunk: 162.28 kB minified
- Visual renderer chunk: 168.97 kB minified
- Search chunk: 27.63 kB minified
- Largest chunk: 278.27 kB, below the existing 500 kB warning threshold

## Phase V2 — AXI Visual Batch 2 (Lessons 12–22)

Status: complete.

AXI4 remains the default scope. AXI3 differences are called out where the write-response dependency differs, and implementation policy is separated from protocol requirements for ID remapping, outstanding depth, response reordering, progress, and throughput. Protocol claims were checked against Arm AMBA AXI and ACE Protocol Specification IHI 0022H sections A3–A6.

| Lesson | Visual IDs | Status | Learner question, purpose, and interaction |
| --- | --- | --- | --- |
| 12 — Independent channel behavior | `wf-axi-write-channels` | Reused | “Can W transfer before AW, and which dependencies still cross channels?” Cycle inspection shows the first W beat accepted before AW, independent AW/W stalls, and the AXI4 B-response prerequisites. |
| 13 — Write transaction walkthrough | `wf-axi-write-channels` | Reused and synchronized | “Which edge accepts each AW, W, and B transfer?” The written walkthrough now matches the production waveform cycle for cycle through pre-address data, stable W payload, exact WLAST, and stalled B response. |
| 14 — Read transaction walkthrough | `wf-axi-read-channels` | Reused and synchronized | “What remains stable while the master backpressures R?” The walkthrough follows the accepted AR request, stalled D1 payload, final RLAST, and per-beat SLVERR without inventing a recovery policy. |
| 15 — Burst structure | `tl-axi-burst-address-progression` | Added | “How do AxLEN, AxSIZE, and AxBURST generate addresses?” Focusable FIXED4, INCR4, and WRAP4 lanes derive four-byte beat addresses and expose the 16-byte wrap decision. |
| 16 — WLAST and RLAST | `wf-axi-debug-wlast` | Recovered and rebuilt | “Which accepted beat must carry LAST?” Keyboard/touch cycle inspection flags early WLAST on beat 3 of 4 and missing WLAST on the declared final beat, while keeping recovery implementation-dependent. |
| 17 — IDs and matching | `wf-axi-ids-correlation`, `tp-axi-crossbar` | Reused and corrected | “How are local IDs preserved through a multi-master fabric?” The waveform separates AXI4 W order from B reordering; the topology shows source context without mandating append, remap, or side-metadata encoding. |
| 18 — Outstanding transactions | `tl-axi-outstanding-window` | Added | “When does a scoreboard allocate and retire an entry?” Three overlapping read lanes allocate on AR acceptance, retire on accepted RLAST, and legally reuse ID 0 with an issue-order queue. |
| 19 — Ordering guarantees | `wf-axi-in-order` | Recovered and rebuilt | “What exactly remains ordered for one ID?” Attributable A/B rows show two same-ID read responses completing in request order and distinguish this from cross-channel ordering. |
| 20 — Out-of-order completion | `wf-axi-out-of-order` | Recovered and rebuilt | “How can B finish before A without losing ownership?” Different RIDs let response B complete first while every beat remains attributable and ordered within its burst. |
| 21 — Backpressure behavior | `wf-axi-ready-valid-scenarios`, `wf-axi-deadlock` | Reused and corrected | “When is a stall legal, and when has the system stopped making progress?” One visual teaches stable VALID/payload; the other separates a circular READY-policy liveness failure from safety and no-combinational-path rules. |
| 22 — Throughput reasoning | `wf-axi-throughput` | Recovered and rebuilt | “Why can AW continue while W stalls, and what does that not prove?” The waveform holds AHB's overlapping address during HREADY LOW while AXI AW handshakes independently, without claiming a mandated latency advantage. |

### AXI Batch 2 accuracy and interaction guards

- Walkthrough guards encode the accepting AW, W, B, AR, and R edges and stable payload through backpressure.
- Burst guards encode `AxLEN+1`, `2^AxSIZE`, FIXED/INCR/WRAP progression, wrap-region math, AXI4 length limits, and the 4 KB boundary rule.
- LAST guards reject both early and missing WLAST and explicitly preserve all declared transfers because AXI does not support early burst termination.
- Ordering guards prove same-ID response order, different-ID completion freedom, per-ID issue queues, legal same-ID reuse, and the absence of ID-based read/write ordering.
- Liveness guards distinguish source-side VALID safety, destination READY freedom, prohibited direct combinational input/output paths, and integration-level progress policy.
- All eleven lessons render every declared visual inline with meaningful captions. New timelines and changed waveforms render through the production registry, support pointer/keyboard selection, and pass axe coverage.

### AXI Batch 2 browser verification

Verified the live application at the normal desktop viewport and at 375 × 812, using system, light, and dark theme states:

- `/lesson/12_independent_channel_behavior`
- `/lesson/13_write_transaction_walkthrough`
- `/lesson/14_read_transaction_walkthrough`
- `/lesson/15_burst_structure_beat_progression`
- `/lesson/16_wlast_and_rlast_meaning`
- `/lesson/17_ids_and_transaction_matching`
- `/lesson/18_outstanding_transactions`
- `/lesson/19_ordering_guarantees`
- `/lesson/20_out_of_order_completion`
- `/lesson/21_backpressure_behavior`
- `/lesson/22_throughput_reasoning_bottlenecks`
- `/visuals`
- `/dev/visuals`

Results: every lesson rendered its declared visual count and title with no blank visual, `Visual not found`, unknown type, page-level overflow, or console warning/error. All dense visuals scrolled internally at 375 px; observed canvases ranged from 428–920 px inside 315–317 px visual viewports. The WRAP boundary phase accepted Enter and exposed its 16-byte calculation. The mobile navigation opened through a 44 × 44 px control. The Visuals Explorer reported 69 assets, and the development viewer rendered 69 visual wrappers/headings with zero visual errors. The home-page visual count was corrected from the stale 52 to 69.

### Verification baseline after AXI Batch 2

- Visual registry: 69 assets
- Visuals by type: 30 waveforms, 8 timelines, 11 topologies, 14 signal explorers, 2 coverage maps, 2 formal properties, 2 specification-rule explorers
- Legacy root-level visuals retained: 35
- Duplicate, malformed, unsupported, or unresolved visual references: 0
- Test files: 40
- Tests: 403
- Test failures: 0
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB minified
- Loader chunk: 282.73 kB minified
- Lesson page chunk: 162.28 kB minified
- Visual renderer chunk: 178.18 kB minified
- Search chunk: 27.63 kB minified
- Largest chunk: 282.73 kB, below the existing 500 kB warning threshold

## Phase V2 — AXI Visual Batch 3 (Lessons 23–33)

Status: complete.

AXI4 remains the default memory-mapped scope. AXI3, AXI4-Lite, AXI4-Stream, and APB3 distinctions are labeled where applicable. Protocol claims were checked against Arm AMBA AXI and ACE Protocol Specification IHI 0022H, Arm AMBA APB Protocol Specification IHI 0024D, and the AXI4-Stream stability requirements.

| Lesson | Visual IDs | Status | Learner question, purpose, and interaction |
| --- | --- | --- | --- |
| 23 — Burst types | `tl-axi-burst-address-progression` | Reused and strengthened | “How do FIXED, INCR, and WRAP addresses differ?” Focusable lanes connect `AxLEN`, `AxSIZE`, beat count, address increment, and the WRAP boundary. |
| 24 — Address alignment | `wf-axi-alignment-byte-lanes` | Added | “Which byte lanes are meaningful for aligned and unaligned starts?” Cycle inspection maps a 64-bit bus, start address, transfer size, and WSTRB to the active lanes without implying that a slave repairs an unsupported request. |
| 25 — 4 KB boundary rule | `wf-axi-4kb-boundary` | Rebuilt | “Which accepted beat first makes the burst illegal?” The waveform contrasts an illegal four-beat INCR crossing from `0x0FFC` to `0x1000` with two legal split bursts. |
| 26 — Legal and illegal patterns | `sig-axi-legality-patterns` | Added | “What invariant should a monitor check?” Expandable cases cover VALID independence, AXI4 B dependencies, burst bounds, LAST count, ID ordering, and cross-channel RAW hazards. |
| 27 — AXI3 versus AXI4 | `tl-axi3-axi4-write-order` | Added | “Why can AXI3 interleave write data while AXI4 cannot?” Parallel lanes expose AXI3 WID attribution and AXI4 address-order write-data completion. |
| 28 — AXI4-Lite simplifications | `sig-axi4-lite-interface` | Added | “What does Lite really remove or retain?” Expandable groups show the exact channel subset, retained AxPROT/WSTRB semantics, omitted burst fields, ID interoperability nuance, and legal outstanding behavior. |
| 29 — AXI4-Stream semantics | `wf-axi-stream` | Recovered and corrected | “What must stay stable when a packet beat is stalled?” The waveform now holds TDATA, TKEEP, TLAST, TID, and TDEST while TVALID is HIGH and TREADY is LOW, then completes the same beat. |
| 30 — Interconnects and crossbars | `tp-axi-crossbar` | Reused and clarified | “How does a fabric preserve route and source ownership?” Node/edge inspection traces independent target paths, per-target contention, response return, and implementation-configured ID/source tracking. |
| 31 — Multi-master reasoning | `tp-axi-crossbar` | Reused and integrated | “What state lets two masters reuse the same local ID?” The topology is now rendered inline and separates protocol-visible IDs from the interconnect's implementation-specific source context. |
| 32 — QoS and system traffic | `tl-axi-qos-arbitration` | Added | “Is AxQOS itself a mandatory priority rule?” Focusable arbitration decisions distinguish the higher-value recommendation and system policy from AXI ordering requirements. |
| 33 — Bridges and mixed protocols | `tp-axi-apb-bridge` | Recovered and corrected | “How does an AXI transaction become an APB transfer?” The topology separates AXI capture, implementation-specific buffering, APB SETUP/ACCESS, backpressure, and APB3 PSLVERR-to-AXI response mapping. |

### AXI Batch 3 accuracy and interaction guards

- Burst guards encode `2^AxSIZE` increments, legal AXI4 burst lengths, WRAP alignment and beat counts, the 4 KB boundary calculation, and byte-lane/strobe behavior for unaligned starts.
- Transaction guards preserve VALID independence, stable payload while stalled, AXI4 B-response dependencies, exact LAST counting, same-ID ordering, and cross-channel ordering limits.
- Version guards distinguish AXI3 WID-based data interleaving from AXI4 write-data ordering and preserve the exact AXI4-Lite signal subset.
- Stream guards require all payload and sideband signals, including TLAST, to remain stable during backpressure.
- QoS guards separate protocol ordering from implementation-defined arbitration policy; bridge guards encode APB's minimum two-cycle transfer and APB3 error-response mapping.
- All eleven lessons render every declared visual inline with a meaningful caption. Production interaction tests exercise waveform cycles, timeline phases, signal entries, and topology routes with keyboard selection and persistent pressed state.

### AXI Batch 3 browser verification

Verified the live application at 1440 × 900 and 375 × 812 in light and dark themes:

- `/lesson/23_burst_types`
- `/lesson/24_address_alignment`
- `/lesson/25_4kb_boundary_rule`
- `/lesson/26_legal_illegal_patterns`
- `/lesson/27_axi3_vs_axi4_differences`
- `/lesson/28_axi4_lite_simplifications`
- `/lesson/29_axi_stream_semantics`
- `/lesson/30_axi_interconnects_crossbars`
- `/lesson/31_multi_master_reasoning`
- `/lesson/32_qos_system_traffic`
- `/lesson/33_bridges_mixed_protocol`
- `/visuals`
- `/dev/visuals`

Results: every lesson rendered its declared visual with no blank surface, `Visual not found`, unknown type, page-level horizontal overflow, or console warning/error. Timeline and topology controls accepted Enter and exposed the selected explanation. At 375 px, every dense waveform, timeline, and topology scrolled inside its visual surface; all tested controls met the 44 px target. The Visuals Explorer and development gallery each discovered all 74 assets with zero visual errors.

### Verification baseline after AXI Batch 3

- Visual registry: 74 assets
- Visuals by type: 31 waveforms, 10 timelines, 11 topologies, 16 signal explorers, 2 coverage maps, 2 formal properties, 2 specification-rule explorers
- Legacy root-level visuals retained: 35
- Duplicate, malformed, unsupported, or unresolved visual references: 0
- Test files: 41
- Tests: 443
- Test failures: 0
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB minified
- Loader chunk: 286.87 kB minified
- Lesson page chunk: 162.28 kB minified
- Visual renderer chunk: 196.47 kB minified
- Search chunk: 27.63 kB minified
- Largest chunk: 286.87 kB, below the existing 500 kB warning threshold

## Phase V2 — AXI Visual Batch 4 (Lessons 34–44)

Status: complete.

AXI4 remains the default memory-mapped scope. Protocol requirements, configured progress bounds, implementation-defined scheduling policy, and signoff recommendations are kept distinct. Claims were checked against Arm AMBA AXI and ACE Protocol Specification IHI 0022H, with particular attention to VALID stability and independence, AXI4 write-response dependencies, same-ID ordering, different-ID freedom, ID manipulation, the 4 KB boundary, exclusive-access restrictions, and the non-mandatory interpretation of AxQOS values.

| Lesson | Visual IDs | Status | Learner question, purpose, and interaction |
| --- | --- | --- | --- |
| 34 — Simulation strategy | `topo-axi-dv-environment` | Added | “Which evidence path reconstructs and checks one decoupled transaction?” A collision-tested topology separates stimulus, five-channel driving, accepted-handshake monitoring, DUT behavior, per-ID prediction, assertions, and coverage; keyboard/pointer selection explains each responsibility. |
| 35 — Assertions and protocol checking | `sig-axi-assertion-library` | Added | “What triggers each AXI obligation, and what context prevents a false failure?” Eight expandable checker families cover VALID independence, stalled payload stability, AXI4 B dependencies, LAST counting, bursts, IDs, exclusives, and configured liveness. |
| 36 — Functional coverage | `cm-axi-burst-resp` | Recovered and corrected | “Is an empty response bin illegal, or does it require more transaction context?” Keyboard/pointer-selectable cells distinguish coverage holes, covered behavior, illegal combinations, and conditional EXOKAY context without treating FIXED plus EXOKAY as inherently illegal. |
| 37 — Formal properties | `fp-axi-wlast-exact` | Recovered and corrected | “Why must WLAST be both absent early and present on the accepted final beat?” The editable four-beat trace checks the bidirectional WLAST condition and visibly changes from pass to failure when a learner toggles WLAST. |
| 38 — Common RTL bugs | `wf-axi-out-of-order`, `wf-axi-debug-wlast`, `wf-axi-deadlock`, `spec-rule-explorer-axi` | Recovered, integrated, and corrected | Three diagnostic waveforms and the rule explorer connect different-ID reordering, LAST mismatch, circular READY policy, ID narrowing, and QoS assumptions to observable bug signatures. |
| 39 — Debug case studies | `wf-axi-deadlock`, `wf-axi-out-of-order` | Reused and corrected | “Is this failure a safety violation, a liveness failure, or a scoreboard-correlation bug?” Cycle inspection separates circular W/B progress policy from protocol safety and demonstrates per-ID response ownership. |
| 40 — Expert checklist | `sig-axi-signoff-evidence` | Added | “What concrete evidence supports an AXI signoff claim?” An expandable evidence board and repaired 12-item production checklist connect protocol, ordering, stress, configuration, coverage, and progress risks to reviewable artifacts. |
| 41 — Signal quick reference | `axi-signal-ref` | Recovered and comprehensively rebuilt | “Who drives and samples each AXI4 memory-mapped signal?” Forty-six grouped entries cover global, AW, W, B, AR, and R signals with ownership, acceptance semantics, important values, and DV notes; AXI4 WID is correctly absent. |
| 42 — Ordering review | `tl-axi-ordering-review` | Added | “Which response orders are legal for two ID-5 writes and one ID-2 write?” Focusable lanes compare legal `C-A-B` and `A-C-B` orders with illegal `B-C-A`; selecting the first illegal response explains the per-ID queue violation. |
| 43 — Waveform review | `wf-axi-throughput`, `wf-axi-debug-wlast`, `wf-axi-deadlock` | Reused and corrected | “Can I distinguish independent channel progress, exact LAST ownership, and stalled-but-legal behavior from deadlock?” Three review traces reinforce accepted-edge and progress reasoning without equating every stall with a combinational loop. |
| 44 — Interview recap | `sig-axi-senior-recap` | Added | “Which six mental anchors support senior AXI debugging?” Expandable recall cards cover channel independence, stable payload, response prerequisites, burst geometry, per-ID ordering, and evidence-based signoff. |

### AXI Batch 4 accuracy and interaction guards

- Assertion guards encode source-side VALID independence, stable VALID/payload while stalled, no direct combinational input/output paths, accepted AW plus final W prerequisites for AXI4 BVALID, and explicitly configured liveness bounds.
- Ordering guards encode same-ID response order, permitted different-ID reordering, independent read/write ordering domains, and preservation of original ordering when an interconnect manipulates IDs.
- Coverage and formal guards reject the former `FIXED + EXOKAY` shortcut, require full exclusive context, and enforce WLAST if and only if the accepted beat index reaches AWLEN.
- Reference guards keep WID out of AXI4, cover all 46 memory-mapped signals, and preserve glossary links while exposing direction, sampling, values, and DV relevance.
- Signoff guards load the canonical 12-item checklist and preserve concrete evidence language instead of rendering raw JSX or treating a checklist assertion as proof.
- The new verification-environment topology passes production discovery/rendering, unique-ID and endpoint checks, semantic-role checks, block separation, orthogonal routing, route-through-block checks, caption-collision checks, keyboard selection, 44 px route hit areas, mobile scrolling, and axe coverage.
- All eleven lessons render every declared visual inline with meaningful captions. Changed signal, timeline, coverage, formal, waveform, topology, and specification-rule interactions are covered through production loaders and renderers.

### AXI Batch 4 browser verification

Verified the live application at 1440 × 1000 and 375 × 812, using system, light, and dark theme states:

- `/lesson/34_axi_simulation_strategy`
- `/lesson/35_axi_assertions_protocol_checking`
- `/lesson/36_axi_functional_coverage`
- `/lesson/37_axi_formal_property_patterns`
- `/lesson/38_common_rtl_bugs`
- `/lesson/39_debug_case_studies`
- `/lesson/40_axi_expert_checklist`
- `/lesson/41_axi_signal_quick_reference`
- `/lesson/42_axi_ordering_review_pack`
- `/lesson/43_axi_waveform_review_pack`
- `/lesson/44_axi_interview_recap`
- `/visuals`
- `/dev/visuals`

Results: every lesson heading and declared inline visual rendered with no blank surface, `Visual not found`, unknown type, page-level horizontal overflow, or console warning/error. The Visuals Explorer showed 79 registry cards and the development viewer rendered 79 visual titles with zero visual errors. The topology scoreboard, conditional EXOKAY bin, editable WLAST property, expert checklist, and illegal same-ID ordering phase all exposed the intended explanation or state change. At 375 px, the 784 px verification topology, 572 px ordering lanes, and 600–920 px waveforms scrolled inside 291–317 px visual viewports while the lesson page remained contained. Topology routes retain 44 px hit strokes, coverage cells are at least 44 × 44 px, and each checklist label provides a 298 × 151 px mobile hit area. Explicit light and dark selections applied distinct foreground/background palettes; system preference remained the default selectable mode.

### Verification baseline after AXI Batch 4

- Visual registry: 79 assets
- Visuals by type: 31 waveforms, 11 timelines, 12 topologies, 19 signal explorers, 2 coverage maps, 2 formal properties, 2 specification-rule explorers
- Legacy root-level visuals retained: 35
- Duplicate, malformed, unsupported, or unresolved visual references: 0
- Test files: 42
- Tests: 491
- Test failures: 0
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB minified
- Loader chunk: 293.80 kB minified
- Lesson page chunk: 162.28 kB minified
- Visual renderer chunk: 221.19 kB minified
- Search chunk: 27.63 kB minified
- Largest chunk: 293.80 kB, below the existing 500 kB warning threshold

## Remaining AXI visual coverage

No AXI lesson is without reviewed, registry-resolved inline visual support. All 44 AXI lessons have completed their batch-level educational-strength and protocol-accuracy review. Future AXI changes are maintenance, presentation polish, and retention improvement rather than missing-coverage work.

## Phase V3 — AHB/AXI presentation and retention polish

Status: complete.

- Added a consistent three-step lesson workflow to all 88 lessons: build the concept, inspect the visual evidence, then retrieve or test the rule.
- Wrapped all 115 inline visual placements in numbered learning frames with the production title, visual type, meaningful figure caption, and type-specific inspection guidance. Waveforms emphasize accepting edges, stalls, phase ownership, and stable payload; topologies emphasize highlighted paths, responsibility, and direction; other visual types receive equivalent verification-focused prompts.
- Added a 60-second retention disclosure to all lessons with explain, locate, and verify prompts. The native disclosure is explicitly operable with pointer, Enter, and Space, retains visible focus, and provides a 52 px target.
- Reorganized `/visuals` into AHB, AXI, and Foundations collections with protocol-specific context, persistent search/type/protocol filters, unique preview labels, a clear-filter action, and a recoverable empty state. The production catalog shows 37 AHB, 34 AXI, and 8 Foundations assets.
- Kept the established luminous engineering design language: glass is limited to structural navigation/filter surfaces, while lesson workflow, visual guidance, and retention content use crisp instructional hierarchy without nested decorative cards or looping motion.
- Accessibility coverage now scans the grouped Visuals Explorer, preserves logical lesson heading order, and verifies the workflow/retention structure across the complete lesson corpus.

### Phase V3 browser verification

Verified representative single- and multi-visual AHB/AXI lessons plus the complete Visuals Explorer in the live application:

- `/lesson/01_ahb_overview`
- `/lesson/16_wait_states_hready`
- `/lesson/18_throughput_vs_latency`
- `/lesson/04_five_channel_model`
- `/lesson/37_axi_formal_property_patterns`
- `/lesson/40_axi_expert_checklist`
- `/lesson/42_axi_ordering_review_pack`
- `/visuals`

Results: every route rendered its expected workflow, visual-learning frame count, guidance, and retention panel with zero visual errors or page-level horizontal overflow. The retention disclosure opened by pointer and closed by Enter with focus preserved. The Visuals Explorer rendered all 79 entries in three labeled protocol groups, opened a production preview without error, recovered from a no-result search, and exposed unique preview control names. System, light, and dark theme controls applied the expected palette.

At an exact 375 × 812 viewport, the workflow and retention prompts collapsed to one column, the mobile menu remained available, the lesson page stayed contained, and two dense waveform surfaces retained internal horizontal scrolling. The retention target measured 52 px high. Fresh desktop and mobile sessions recorded zero application console warnings or errors.

### Verification baseline after Phase V3

- Visual registry: 79 assets
- Lesson visual placements: 115 across 87 lessons; all 88 lessons receive workflow and retention support
- Duplicate, malformed, unsupported, or unresolved visual references: 0
- Test files: 42
- Tests: 494
- Test failures: 0
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB minified
- Loader chunk: 293.80 kB minified
- Lesson page chunk: 166.89 kB minified
- Visual renderer chunk: 221.20 kB minified
- Visuals Explorer chunk: 6.42 kB minified
- Search chunk: 27.63 kB minified
- Largest chunk: 293.80 kB, below the existing 500 kB warning threshold

## Phase V4 — AHB/AXI applied DV practice

Status: complete.

Phase V4 adds a reusable `diagnostic-lab` exercise to the production content model and lesson renderer. Each lab presents bounded waveform/scoreboard evidence, then requires three decisions: locate the first decisive edge, assign protocol ownership, and select the checker or retained state that proves the diagnosis. The production loader normalizes legacy exercise metadata, rejects incomplete lab structures, and keeps malformed records isolated from valid exercises.

| Protocol | Lesson | Lab ID | Applied learner question |
| --- | --- | --- | --- |
| AHB | 15 — Address/data phase | `lab-ahb-pipeline-owner` | Which accepted address phase owns the write data while the overlapping address phase is stalled? |
| AHB | 16 — Wait states | `lab-ahb-stall-stability` | Which rising edge first proves that pending address/control changed illegally? |
| AHB | 24 — Error responses | `lab-ahb-error-completion` | When does the failed transfer complete, and may the master cancel or continue? |
| AHB | 32 — Formal properties | `lab-ahb-configured-liveness` | Did AHB safety fail, or did a separately configured progress bound expire? |
| AXI | 13 — Write walkthrough | `lab-axi-write-response-prerequisites` | Which accepted AW/final-W evidence must exist before AXI4 BVALID? |
| AXI | 14 — Read walkthrough | `lab-axi-stalled-read-payload` | Which stalled R-channel field first proves that an unaccepted beat changed? |
| AXI | 39 — Debug case studies | `lab-axi-progress-classification` | Does a long stable stall prove an AXI safety failure or a configured progress failure? |
| AXI | 42 — Ordering review | `lab-axi-per-id-ordering` | Which response first violates the head of one ID's issue queue? |
| AHB | 19 — Arbiter behavior | `lab-ahb-arbitration-handover` | Which HREADY/grant edge turns permission into address ownership while data ownership remains pipelined? |
| AHB | 20 — Decoder and selection | `lab-ahb-decoder-response-owner` | Which retimed HSEL owns a response after the next address selects another target? |
| AHB | 26 — Exclusive accesses | `lab-ahb-exclusive-monitor` | How does an intervening write produce HEXOKAY failure without an HRESP error? |
| AHB | 34 — Debug case studies | `lab-ahb-sampled-select` | Which sampled edge distinguishes a harmless raw HSEL pulse from an unsafe slave side effect? |
| AXI | 25 — 4 KB boundary | `lab-axi-4kb-request-check` | Which address handshake first proves a burst's implied byte range crosses 4 KB? |
| AXI | 30 — Interconnects | `lab-axi-response-route-owner` | Which accepted request context routes a response when independent targets complete concurrently? |
| AXI | 31 — Multi-master reasoning | `lab-axi-local-id-context` | How can two master ports reuse local ID 5 while their source-scoped responses complete independently? |
| AXI | 38 — Common RTL bugs | `lab-axi-id-narrowing-collision` | Which acceptance edge first destroys response ownership in an unsafe ID-narrowing bridge? |

### Phase V4 accuracy and content corrections

- AHB scenarios preserve accepted address/data-phase ownership, the waited-transfer stability obligation and first-ERROR-cycle exception, the exact two-cycle ERROR response, and the master's permitted choice to cancel or continue remaining transfers.
- AXI4 scenarios preserve independent AW/W handshakes while requiring accepted AW plus accepted final W before BVALID, hold the complete R payload under backpressure, retain per-ID issue order, and keep configured progress bounds separate from interface safety.
- Multi-master AHB scenarios preserve the AMBA 2 grant/HREADY handover boundary and the one-phase delay between address and data ownership. Decoder scenarios retime accepted HSEL into the response phase, and AHB5 exclusive scenarios distinguish the complete monitor key and HEXOKAY verdict from HRESP.
- AXI interconnect scenarios check the 4 KB rule when the address request is accepted, retain response ownership independently from the latest arbitration result, scope local IDs by master port, and require all ID manipulation to preserve original ordering and response restoration.
- Corrected the legacy AHB error exercise that incorrectly required cancellation, the bounded-liveness exercise that mislabeled a product timeout as a universal protocol violation, and the WRAP coverage scenario that requested OKAY from an unmapped address.
- Corrected the AXI FIXED-plus-EXOKAY coverage shortcut, WLAST early-termination wording, channel-independence wording, 4 KB end-address calculation, and the waveform exercise that claimed an exact deadlock root cause from a steady stall alone.
- The new evidence table exposes visible keyboard instructions and supports Left/Right, Home, and End. Native radio groups support keyboard/pointer/touch selection, all choice and action targets exceed 44 px, feedback names the reasoning result, and Try again restores the initial state.

### Phase V4 browser verification

Verified all sixteen linked lesson routes at desktop width and exactly 375 × 812:

- `/lesson/15_address_data_phase`
- `/lesson/16_wait_states_hready`
- `/lesson/24_error_responses`
- `/lesson/32_ahb_formal_properties`
- `/lesson/13_write_transaction_walkthrough`
- `/lesson/14_read_transaction_walkthrough`
- `/lesson/39_debug_case_studies`
- `/lesson/42_axi_ordering_review_pack`
- `/lesson/19_arbiter_behavior`
- `/lesson/20_decoder_and_slave_selection`
- `/lesson/26_exclusive_accesses`
- `/lesson/34_debug_case_studies`
- `/lesson/25_4kb_boundary_rule`
- `/lesson/30_axi_interconnects_crossbars`
- `/lesson/31_multi_master_reasoning`
- `/lesson/38_common_rtl_bugs`

Results: every route rendered one Applied DV section and one production lab with no missing exercise state, blank content, or page-level horizontal overflow. At 375 px, every 720 px evidence table scrolled inside a 309 px region, option targets measured at least 52 px, the submit action measured 48 px, and all option groups collapsed to one contained column. Keyboard evidence scrolling moved from 0 to 232 px with ArrowRight and to the 411 px maximum with End. Complete AHB and AXI diagnoses produced the expected result, light/dark theme states applied distinct palettes, and the browser console contained zero warnings or errors.

### Verification baseline after Phase V4

- Diagnostic labs: 16 (8 AHB, 8 AXI)
- Declared lesson exercise references missing after normalization: 0
- Test files: 44
- Tests: 513
- Test failures: 0
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB minified
- Loader chunk: 349.98 kB minified
- Lesson page chunk: 171.84 kB minified
- Visual renderer chunk: 221.20 kB minified
- Search chunk: 27.63 kB minified
- Largest chunk: 349.98 kB, below the existing 500 kB warning threshold

## Audit-remediation evidence after R2

The six audit reports were reconciled into the 96-row `docs/AUDIT_REMEDIATION_TRACKER.md`. R1 corrected all six Foundations lessons and their linked architecture, sampling, pipeline, handshake, transaction, exercise, and signoff assets. R2 corrected all 38 AHB lessons and every audit4 critical shared asset.

R2 visual changes include exact reset/restart semantics, complete HSIZE and HPROT/property gates, accepted-beat HTRANS state, HREADYOUT versus global HREADY, data/response ownership, invalid-stimulus disposition, explicit cancel/continue ERROR paths, active lock ownership versus future grant, complete exclusive-monitor lifecycle, configured security enforcement, separate RETRY/SPLIT behavior, revision-selectable response coverage with accepted error-beat detail, and an accepted-phase formal evaluator with reset cancellation. The stale duplicate AHB checklist was removed; the production checklist and AHB rule data now carry configuration/evidence and primary-source provenance.

Latest R2 phase gate:

- Test files: 45
- Tests: 586 passed, 0 failed
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB
- Loader chunk: 383.20 kB
- Lesson page chunk: 171.84 kB
- Visual renderer chunk: 237.41 kB
- Search chunk: 27.63 kB
- Largest chunk: 383.20 kB, below 500 kB

Browser verification covered all 38 AHB lessons plus `/visuals`, `/dev/visuals`, and `/glossary` at 1440 × 1000 and exactly 375 × 812. The 82 route checks found no missing/blank content, page overflow, console warning, or error. Light/dark/system and reduced-motion states passed; coverage mode switching, formal failure/reset cancellation, search, Enter/Space timeline/topology selection, 44 px controls/connectors, and mobile internal topology scrolling passed.

## Audit-remediation evidence after R3

All 26 audited AXI lessons now use the IHI 0022H channel, association, ordering, burst, lane, and boundary model. Shared AXI visuals expose synchronous ACLK scope, explicit response prerequisites, optional early-W acceptance, complete WUSER/BUSER/RUSER stability bundles, exact WRAP lengths, AxLOCK/AxUSER policy boundaries, and the corrected 4 KB final-byte transition. The consolidated legality explorer adds early-W and no-combinational-path categories without creating a parallel renderer.

Latest R3 phase gate:

- Test files: 45
- Tests: 602 passed, 0 failed
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB
- Loader chunk: 394.36 kB
- Lesson page chunk: 171.84 kB
- Visual renderer chunk: 240.68 kB
- Search chunk: 27.63 kB
- Largest chunk: 394.36 kB, below 500 kB

Browser verification covered AXI lessons 01–26 plus `/visuals`, `/dev/visuals`, and `/glossary` at 1440 × 1000 and exactly 375 × 812. The 58 route checks found no missing/blank content, page overflow, unlabeled button, console warning, or error. Light/dark/system and reduced-motion states passed; production search, Enter/Space topology and signal-explorer selection, 52 px controls, 44 px connector hit areas, complete USER payload rows, and mobile internal topology scrolling passed.

## Audit-remediation closure status

R1-R6 are complete. Preserve the completed AHB/AXI visual system and do not begin APB without an explicit product-directive change.

## Audit-remediation evidence after R4

R4 added one reusable, typed `checker-model` interaction and eight protocol-specific assets rather than eight unrelated widgets. The assets execute bounded event sequences and expose retained checker state, typed protocol/recommendation/product-contract/system-policy results, intentional negative outcomes, and requirement-to-evidence traceability:

- `model-foundation-dv`
- `model-ahb-core-checker`
- `model-ahb-system-checker`
- `model-ahb-dv-rigor`
- `model-axi-write-checker`
- `model-axi-read-checker`
- `model-axi-burst-checker`
- `model-signoff-traceability`

The models are integrated into Foundations 06, AHB 16/20/32/35 and AXI 13/18/25/40. They cover legal versus intentional-negative stimulus, visible/pending/accepted AHB state, response routing and bridge conservation, formal assumptions/reset/vacuity/configured bins, AXI3/AXI4 write association, per-ID read queues and ID restoration, burst/lane/LAST/4 KB calculations, and owned/reviewed signoff evidence. The production registry now contains 87 visuals and reports zero duplicate, malformed/missing-ID, or unsupported assets.

Latest R4 phase gate:

- Test files: 46
- Tests: 621 passed, 0 failed
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB
- Loader chunk: 399.81 kB
- Lesson page chunk: 172.01 kB
- Visual renderer chunk: 288.59 kB
- Search chunk: 27.63 kB
- Largest chunk: 399.81 kB, below 500 kB

Browser verification covered nine changed lesson routes plus `/visuals`, `/dev/visuals`, and `/glossary` at 1440 × 1000 and exactly 375 × 812. Across 24 route checks there was no missing/blank content, page overflow, unlabeled button, console warning, or error. Enter/Space, selected state, intentional failure feedback, 48 px controls, mobile internal trace scrolling, light/dark/system themes, reduced motion and production search passed. Axe reported zero serious or critical WCAG A/AA violations after correcting dark-theme sidebar-count contrast.

## Audit-remediation evidence after R5

R5 completed the remaining scenario breadth without adding visual IDs or a parallel renderer. The checker-model interaction now provides explicit Foundation topology/sampling classifications, AHB BUSY/wait/reset and arbitration/matrix policy states, all required AXI write channel-order permutations, read gaps/backpressure/early-RLAST failure, live queue/counter comparisons, and a typed optional burst calculator.

The live calculator supports AHB INCR/WRAP with HSIZE, bus width, accepted-beat count and the 1 KB rule, plus AXI FIXED/INCR/WRAP, AxSIZE, AxLEN, bus width, unaligned active lanes, first-beat WSTRB subsets, accepted LAST, final byte/end-exclusive and a legal 4 KB split. Registry validation now isolates malformed checker models before rendering.

Latest R5 phase gate:

- Test files: 47
- Tests: 632 passed, 0 failed
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB
- Loader chunk: 399.81 kB
- Lesson page chunk: 172.01 kB
- Visual renderer chunk: 312.01 kB
- Search chunk: 27.63 kB
- Largest chunk: 399.81 kB, below 500 kB

Browser verification covered seven changed lesson routes plus `/visuals`, `/dev/visuals`, and `/glossary` at 1440 × 1000 and exactly 375 × 812. All 20 route checks passed with zero missing/blank content, page overflow, unlabeled button, console warning, or error. Six write modes, read gaps/backpressure/early-RLAST, both calculators, Enter/Space, 48 px inputs, internal mobile tables, light/dark/system themes, reduced motion and search passed. Axe reported zero serious or critical violations.

## Audit-remediation evidence after R6

R6 re-scanned the complete curriculum rather than limiting closure to lessons 01-26. Cross-curriculum corrections now keep original-AHB locking, RETRY and SPLIT distinct; qualify AXI channel independence with mandatory dependencies and resource/order constraints; teach WRAP as exactly 2, 4, 8 or 16 transfers; and explain the AXI 4 KB rule as a decode/routing invariant rather than virtual-memory page-fault behavior. The glossary, diagnostic lab, checker model and burst reference use the same first/final-byte rule, and the stale AHB burst-reference link now targets `07_burst_and_size`.

The new `src/curriculum-closure.test.tsx` proves all 88 lessons and every declared visual, exercise, checklist, prerequisite, related lesson and glossary term resolve. It also applies corpus-wide regression guards to the retired protocol claims. Existing inline/reference/registry suites continue to prove 87 visuals, unique IDs, supported types, production discovery and rendering, keyboard access, topology geometry and mobile containment.

Final R6 phase gate:

- Test files: 48
- Tests: 635 passed, 0 failed
- TypeScript errors: 0
- Vite build warnings: 0
- Main application chunk: 253.60 kB
- Loader chunk: 400.75 kB
- Lesson page chunk: 172.01 kB
- Visual renderer chunk: 312.02 kB
- Search chunk: 27.63 kB
- Largest chunk: 400.75 kB, below 500 kB

Final browser verification rendered all 88 lessons at 1440 × 1000 and exactly 375 × 812, for 176 lesson checks, and rendered eight shared/reference routes at both viewports, for 16 more checks. The matrix found no missing/blank content, page overflow, reduced-motion violation, undersized tested control, console warning or page error. Light/dark/system themes, production search, topology pointer/Enter/Space selection and pressed state, 44 px connector hit areas and mobile internal scrolling passed. Ten representative axe WCAG A/AA scans reported zero serious or critical violations after active sidebar-order and Visuals-filter contrast were corrected.

All 96 audit-remediation tracker rows now have terminal evidence-backed dispositions: 95 Implemented and one Superseded by spec-validated correction. There are zero blocked items and no APB curriculum additions.
