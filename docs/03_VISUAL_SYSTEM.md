# Visual System Plan

## Purpose of the Visual System

The product must be highly visual because protocol understanding improves dramatically when users can see timing, phases, contention, and transaction flow.
Visuals are not decorative; they are part of the teaching system.

## Visual Design Principles

1. Every complex timing concept should have a waveform or timeline.
2. Every system architecture concept should have a topology diagram.
3. Every tricky rule should be paired with at least one “correct vs buggy” visual comparison.
4. Visuals should be interactive where interaction improves comprehension.
5. Visuals should support retention by making states, sequences, and corner cases easy to revisit.

## Core Visual Components

### 1. Waveform Visualizer
Purpose:
- Show clocked signal behavior cycle by cycle.
- Teach timing, wait states, sequencing, and protocol legality.

Should support:
- Boolean signals
- Multi-bit value labels
- Per-cycle annotations
- Highlighted protocol violations
- Overlay comparison between correct and incorrect behavior
- Playback or step-through mode

### 2. Transaction Timeline
Purpose:
- Show higher-level transaction phases over time.
- Make burst structure, arbitration, and responses easier to grasp.

Should support:
- Single transfer timelines
- Burst timelines
- Pipelined overlap
- Outstanding transaction tracking
- Response association

### 3. Interconnect Topology Viewer
Purpose:
- Show masters, slaves, arbiters, bridges, crossbars, and routing paths.
- Explain how a protocol behaves in realistic SoC architecture.

Should support:
- Highlighted traffic paths
- Multi-master contention examples
- Bridge traversal
- Zoomable architecture maps

#### Production block-diagram rules

The repository-level requirements in `AGENTS.md` are mandatory for future topology work. In particular, a block diagram is not complete until its protocol meaning and its geometry are both verified.

- Model source, fabric, and target responsibilities separately. Arbitration, owner muxing, address decoding, target selection, and return routing are different functions and must not be collapsed when that would obscure the lesson.
- Use semantic node roles and labeled regions. Concepts, phases, and states must not be styled as hardware blocks merely to obtain a convenient color.
- Route connections from block boundaries using orthogonal lanes. Explicit waypoints and label positions are required whenever automatic routing produces a collision or an ambiguous crossing.
- Dynamic block sizing and wrapped labels are preferred over fixed boxes. All blocks, captions, waypoints, and region headings must remain inside the computed view box.
- The visual must remain inspectable with keyboard, pointer, and touch. Selection details must explain protocol or DV relevance, not repeat the block label.
- Geometry integrity tests must prove separation and containment rather than relying only on screenshots.
- Browser acceptance covers every changed topology at desktop and mobile widths, both themes, and a clean console.

### 4. Signal Explorer
Purpose:
- Present signal lists grouped by function.
- Let user click a signal and immediately see meaning, timing role, legal values, and related visuals.

Should support:
- Acronym expansion
- Signal grouping by channel or role
- Links to lessons and waveforms

### 5. Spec Rule Explorer
Purpose:
- Convert dense spec rules into searchable, visualized learning objects.

Should support:
- Paraphrased rule text
- Related waveform examples
- Related bug examples
- Related verification checks

### 6. Coverage Map
Purpose:
- Teach verification completeness.
- Show what a robust coverage model looks like.

Should support:
- Feature coverage dimensions
- Cross coverage views
- Covered vs uncovered bins
- Example regressions

### 7. Formal Property Playground
Purpose:
- Bridge conceptual protocol rules with formal verification reasoning.

Should support:
- English property statements
- Property categories: safety, liveness, ordering, integrity
- Passing and failing scenario visuals
- Assumption vs assertion distinction

## Visual Data Model

All visuals should be driven by structured JSON so the content is reusable and scalable.

Suggested categories:
- `waveforms/`
- `timelines/`
- `topologies/`
- `rules/`
- `coverage/`
- `properties/`

## Visual Usage Rule

A lesson should not rely on text alone if the topic involves:
- Timing
- Ordering
- Arbitration
- Burst behavior
- Backpressure
- Response latency
- Interconnect flow
- Formal property interpretation

If any of those appear, a visual is mandatory.
