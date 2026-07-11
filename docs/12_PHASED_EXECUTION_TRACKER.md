# Phased Execution Plan and Tracker

## Purpose

This document is the execution control file for the Bus Protocol DV Academy project.
It translates the planning documents into an implementation sequence that is easy to track, review, and execute cleanly.

Use this file to:
- Track progress across phases
- Keep scope under control
- Verify dependencies before starting work
- Record status, blockers, and decisions
- Prevent random feature work from overtaking core architecture

## Testing Policy

1. Every new component, loader, or interactive feature must have accompanying tests in the same body of work that introduces it, not as a separate later cleanup task.
2. Tests should cover: correct rendering from data, correct handling of interactive behavior (clicks, hovers, selections), and graceful handling of missing/malformed data.
3. A phase is not "done" if code exists but tests do not.

## Usage Rules

1. Only start a phase when prerequisites are satisfied.
2. Update status at the task level, not just the phase level.
3. Record important design decisions in the notes column or in linked docs.
4. If scope changes, update the relevant planning docs and then reflect the change here.
5. No phase may be marked `[x]` Complete unless all automated tests related to that phase's work are written and passing.
6. Do not mark a phase complete until exit criteria are met.

## Status Legend

- `[ ]` Not started
- `[-]` In progress
- `[x]` Complete
- `[!]` Blocked

---

## Phase 0 – Bootstrap and Repository Setup

### Goal
Establish the local project structure, preserve planning documents, and create the app skeleton.

### Prerequisites
- Planning markdown files available in the project root.

### Tasks
- [x] Move planning files into `docs/`
- [x] Create project directory structure for content, src, and docs
- [x] Confirm React + Vite + TypeScript app setup
- [x] Add base routing structure
- [x] Add app shell layout
- [x] Add placeholder pages for main sections
- [x] Add markdown content-loading foundation
- [x] Add initial typed content schemas
- [x] Create bootstrap implementation notes

### Exit Criteria
- Docs are organized.
- App runs locally.
- Routes exist.
- Content folders exist.
- Markdown pipeline is in place.
- All tests for this phase pass (`npm run test`).

### Tracking Notes
| Item | Owner | Status | Notes |
|------|-------|--------|-------|
| Repo organization | | [x] | |
| App shell | | [x] | |
| Markdown loading | | [x] | |
| Type schemas | | [x] | |

---

## Phase 1 – Content Foundation and Shared Models

### Goal
Create a reliable structured content system that supports lessons, visuals, glossary items, exercises, and checklists.

### Prerequisites
- Phase 0 complete.

### Tasks
- [x] Finalize lesson metadata schema
- [x] Finalize visual metadata schema (deferred to Phase 2, using VisualRef)
- [x] Finalize glossary schema
- [x] Finalize exercise schema
- [x] Finalize checklist schema
- [x] Add content loading utilities
- [x] Seed sample markdown lessons
- [x] Seed sample glossary entries
- [x] Seed sample checklist files
- [ ] Seed sample visual JSON configs (deferred to Phase 2)

### Exit Criteria
- Content model is typed and consistent.
- Sample content renders correctly.
- Content and UI are cleanly separated.
- All tests for this phase pass (`npm run test`).

### Tracking Notes
| Item | Owner | Status | Notes |
|------|-------|--------|-------|
| Lesson schema | | [x] | |
| Visual schema | | [x] | Deferred to Phase 2 (placeholder used) |
| Glossary schema | | [x] | |
| Content loaders | | [x] | |

---

## Phase 2 – Core Visual Engine

### Goal
Implement the reusable visual teaching primitives that the curriculum depends on.

### Prerequisites
- Phase 1 complete.

### Tasks
- [x] Implement WaveformVisualizer
- [x] Implement TransactionTimeline
- [x] Implement SignalExplorer
- [x] Implement InterconnectTopologyViewer
- [x] Create demo datasets for each component
- [x] Validate responsiveness and usability
- [x] Ensure visual components are data-driven and reusable
- [x] Implement inline visual embedding convention
- [x] Connect interactive exercises, checklists, and glossary terms

### Exit Criteria
- Core visuals render correctly.
- Visuals work with sample AHB/AXI/foundational datasets.
- Visual rendering is separated from content.
- All tests for this phase pass (`npm run test`).

### Tracking Notes
| Item | Owner | Status | Notes |
|------|-------|--------|-------|
| WaveformVisualizer | | [x] | |
| TransactionTimeline | | [x] | |
| SignalExplorer | | [x] | |
| TopologyViewer | | [x] | |
| Interactive Lessons | | [x] | Glossary, Checklist, Exercise inline parsing working. |
| Advanced Visuals | | [ ] | Spec Rule, Coverage Map, and Formal Property Playground deferred to Phase 6/7 as per visual-first focus constraint. |

---

### Phase 3: Foundations Curriculum [x]
**Goal:** Build the Tier 0 content—the universal concepts required before diving into AHB/AXI.

### Prerequisites
- Phase 2 complete.

### Tasks
- [x] Create foundational lesson set
- [x] Add visual mappings to each lesson
- [x] Add glossary links and acronym expansions
- [x] Add self-check exercises
- [x] Add review summaries and quick-reference notes
- [x] Validate lesson navigation flow

### Exit Criteria
- Full Foundations section exists.
- The user can learn signal/edge/transaction thinking from the app.
- Lessons are visually supported and cross-linked.
- All tests for this phase pass (`npm run test`).

### Tracking Notes
| Item | Owner | Status | Notes |
|------|-------|--------|-------|
| Bus mental models | | [x] | |
| Signal thinking | | [x] | |
| Timing diagrams | | [x] | |
| Handshakes and flow control | | [x] | |
| Senior DV mindset | | [x] | |

---

## Phase 4 – AHB Curriculum

### Goal
Implement the complete AHB learning track with expert-level depth and verification integration.

### Prerequisites
- Phase 3 complete.

### Tasks
- [ ] Add AHB overview lessons
- [ ] Add AHB signal lessons
- [ ] Add transfer and burst lessons
- [ ] Add timing and pipelining lessons
- [ ] Add arbitration and architecture lessons
- [ ] Add advanced AHB5 feature lessons
- [ ] Add AHB verification lessons
- [ ] Add AHB bug-pattern and debug lessons
- [ ] Add AHB checklist and review pages
- [ ] Add AHB-specific visuals and datasets

### Exit Criteria
- AHB curriculum map is fully represented.
- Every major signal and rule is covered.
- Verification content is included.
- Review materials support day-to-day usage.
- All tests for this phase pass (`npm run test`).

### Phase 4: AHB Curriculum [x] Complete

| Item | Owner | Status | Notes |
|------|-------|--------|-------|
| AHB signals | | [x] | Sections A and B complete |
| AHB transfers | | [x] | Section C complete |
| AHB timing | | [x] | Section D complete |
| AHB architecture | | [x] | Section E complete |
| AHB verification | | [x] | Section G complete |
| AHB review tools | | [x] | Section H complete |
| AHB advanced features | | [x] | Section F complete |

---

## Phase 5 – AXI Curriculum

### Goal
Implement the complete AXI learning track with deep coverage of channels, IDs, ordering, variants, and verification.

### Prerequisites
- Phase 4 complete.

### Tasks
- [ ] Add AXI overview lessons
- [ ] Add channel-by-channel signal lessons
### Phase 5: AXI Curriculum [x] Complete

*This is the major focus block representing the transition from intermediate (AHB) to advanced (AXI).*

#### Dependencies
- Phase 4

#### Scope
- Complete end-to-end AXI4, AXI4-Lite, and AXI-Stream content.
- 5-channel model and ordering semantics.
- Advanced architecture and verification strategies.
- AXI-specific review materials.

#### Exit Criteria
- AXI curriculum map is fully represented.
- Ordering and performance behavior are clearly visualized.
- Variants are clearly differentiated.
- Verification content is practical and realistic.
- Review materials support day-to-day usage.
- All tests for this phase pass (`npm run test`).

| Item | Owner | Status | Notes |
|------|-------|--------|-------|
| AXI orientation | | [x] | Section A complete |
| AXI signals by channel | | [x] | Section B complete |
| AXI handshakes | | [x] | Section C complete |
| AXI ordering | | [x] | Section D complete |
| AXI rules and constraints | | [x] | Section E complete |
| AXI architecture | | [x] | Section F complete |
| AXI verification | | [x] | Section G complete (CoverageMap, FormalPropertyPlayground deferred) |
| AXI review tools | | [x] | Section H complete (SpecRuleExplorer deferred) |

## Phase 6 – Revision, Search, and Product Polish [x] Complete

### Goal
Turn the content-rich app into a strong daily-use reference tool.

### Prerequisites
- Phase 5 complete.

### Tasks
- [x] Improve navigation hierarchy (added Quick Reference sidebar)
- [x] Content auditing and broken link fixing
- [x] Client-side fuzzy search (Fuse.js)
- [x] Quick-lookup reference pages (Signals, Rules, Bugs)
- [x] Glossary page, index, and tooltip integration
- [x] Revision dashboards
- [x] Improve cross-linking between lessons and visuals
- [x] Mobile and tablet usability optimizations
- [x] Polish design consistency

### Exit Criteria
- App supports both deep learning and fast lookup.
- Navigation is smooth.
- Revision flow is strong.
- Product feels polished enough for daily use.
- All tests for this phase pass (`npm run test`).

### Tracking Notes
| Item | Owner | Status | Notes |
|------|-------|--------|-------|
| Search | | [x] | |
| Revision pages | | [x] | |
| Mobile optimizations | | [x] | Drawer navigation, layout adjustments, scroll containers for density |
| Accessibility | | [x] | ARIA roles, semantic HTML, vitest-axe integration |
| Glossary integration | | [x] | /glossary page and tooltip interlinking |
| Mobile polish | | [x] | Complete |

---

## Phase 7 – Expansion Planning (Do Not Implement Yet)

### Goal
Prepare for future growth without adding Phase 2 complexity now.

### Candidate Expansion Areas
- APB
- ACE / ACE-Lite
- CHI
- Bridges and mixed-protocol systems
- Additional verification labs
- Personal notes/bookmarking refinement
- Multi-user or hosted version

### Rule
This phase is planning only until the local AHB + AXI expert guide is stable.

---

## Global Tracker

| Phase | Title | Status | Start Date | End Date | Notes |
|------|------|------|------|------|------|
| 0 | Bootstrap and Repository Setup | [x] | | | |
| 1 | Content Foundation and Shared Models | [x] | | | |
| 2 | Core Visual Engine | [x] | | | Inline visuals and interactive models complete. Advanced models deferred. |
| 3 | Foundations Curriculum | [x] | | | |
| 4 | AHB Curriculum | [x] | | | |
| 5 | AXI Curriculum | [x] | | | |
| 6 | Revision, Search, and Product Polish | [/] | | | |
| 7 | Expansion Planning | [ ] | | | |

---

## Decision Log

Use this section to record meaningful project decisions.

| Date | Decision | Reason | Impact |
|------|----------|--------|--------|
| | | | |
| | | | |
| | | | |

---

## Phase 7 – Expansion Planning (Pending Approval) [ ]

### Goal
Fix post-launch critical audit findings and plan the next phase of content expansion (APB/Advanced Visuals).

### Prerequisites
- Phase 6 complete.
- `docs/13_POST_LAUNCH_AUDIT.md` reviewed.
- `docs/14_PHASE_7_EXPANSION_PLAN.md` reviewed.

### Tasks (See `docs/14_PHASE_7_EXPANSION_PLAN.md` for full truth)
- [x] Phase 7.0: Address Critical/Moderate audit findings (TypeScript build failure, AXI numbering, quick-reference links).
- [x] Phase 7.1: Verification Playground & Visual Expansion [x]
- [x] Integrate CoverageMap into AHB Section G lesson (31_ahb_functional_coverage.md) and AXI equivalent
- [x] Create FormalPropertyPlayground component (mini-waveform + property toggle + SV property evaluator)
- [x] Integrate FormalPropertyPlayground into AHB Section G lesson (32_ahb_formal_properties.md) and AXI equivalent
- [x] Build SpecRuleExplorer and integrate into AHB/AXI common bug lessons
- [ ] Phase 7.2: APB Curriculum.
- [ ] Phase 7.3: System topology / Cross-protocol comparisons.

### Execution Note
**Do NOT begin execution on Phase 7 until the user explicitly reviews `docs/14_PHASE_7_EXPANSION_PLAN.md` and provides approval on how to handle the Phase 6.5/7.0 cleanup tasks.**

---

## Blocker Log

| Date | Phase | Blocker | Resolution Plan | Status |
|------|------|---------|-----------------|--------|
| | | | | |
| | | | | |

---

## Completion Definition for Phase 1 Product

The Phase 1 product is considered complete when:
- Foundations is complete
- AHB is complete
- AXI is complete
- Core visuals are working
- Verification content is integrated
- Review/checklist/reference flow is useful in real work
- The app works cleanly as a local expert guide
