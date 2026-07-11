# Implementation Plan and Milestones

## Implementation Strategy

Build the project in vertical slices.
That means each phase should produce a usable improvement rather than only infrastructure.
Prioritize the app shell and the visual foundation first, then add the content tracks.

## Phase 0 – Setup and Foundations

Goals:
- Initialize React + Vite + TypeScript app
- Add Tailwind CSS
- Configure routing
- Create project folder structure
- Add markdown loading pipeline
- Define basic theme tokens
- Build app shell layout

Deliverables:
- Running local app
- Navigation layout
- Placeholder lesson pages
- Basic markdown rendering

## Phase 1 – Content Model and Shared Types

Goals:
- Define lesson metadata schema
- Define glossary schema
- Define visual JSON schemas
- Define exercise/question schemas
- Define completeness checklist schema

Deliverables:
- Type-safe content contracts
- Example lesson data
- Example visual datasets

## Phase 2 – Core Visual Components

Goals:
- Build WaveformVisualizer
- Build TransactionTimeline
- Build InterconnectTopologyViewer
- Build SignalExplorer
- Build SpecRuleExplorer

Deliverables:
- Demo pages for each visual component
- Reusable props and configuration model
- Example datasets for foundations, AHB, and AXI

## Phase 3 – Foundations Curriculum

Goals:
- Write and integrate Tier 0 lessons
- Attach visuals to every important concept
- Add basic self-check exercises and review aids

Deliverables:
- Full Foundations section
- Foundational visual gallery
- Glossary seeded with foundational terms

## Phase 4 – AHB Curriculum

Goals:
- Implement complete AHB track
- Add signal-by-signal lessons
- Add timing, bursts, arbitration, advanced features, verification, and debug modules
- Create all necessary AHB visuals and checklists

Deliverables:
- Full AHB learning path
- AHB cheat sheets
- AHB verification checklist
- AHB visual review pages

## Phase 5 – AXI Curriculum

Goals:
- Implement complete AXI track
- Cover AXI3, AXI4, AXI4-Lite, and AXI-Stream
- Add advanced topics such as IDs, outstanding transactions, ordering, QoS, and interconnect reasoning
- Create verification and debug material

Deliverables:
- Full AXI learning path
- AXI cheat sheets
- AXI verification checklist
- AXI visual review pages

## Phase 6 – Refinement

Goals:
- Improve navigation and discoverability
- Add cross-linking between lessons
- Improve glossary integration
- Add revision routes and quick-reference pages
- Tighten design consistency and responsiveness

Deliverables:
- Polished local learning app
- Stable learning flow
- Better revision experience

## Delivery Rule

At the end of each phase, confirm:
- The app still runs locally
- The new feature is visible and testable
- Type safety is intact
- Content and code remain cleanly separated
- New material supports later expansion without rework
