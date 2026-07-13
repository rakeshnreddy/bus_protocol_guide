# Bus Protocol DV Academy — Project Instructions

These instructions apply to every coding agent working in this repository.

## Product scope

- Finish AHB and AXI visual learning before starting another protocol.
- Do not add APB curriculum, routes, trackers, or standalone APB assets. Existing AHB/AXI bridge lessons and their current visuals may be maintained when required by an AHB/AXI batch.
- Preserve lesson prose. Correct protocol errors when primary-source evidence is clear, but do not shorten content merely to simplify integration.

## Protocol accuracy gate

Before adding or changing a protocol visual:

1. State the learner question the visual answers and the protocol/version in scope.
2. Validate signal direction, ownership, sampling edge, transfer phase, legal values, response behavior, and corner cases against the applicable Arm AMBA specification or another primary source.
3. Distinguish protocol requirements from recommendations and implementation-defined policy. Never depict an arbitration policy, security topology, monitor placement, or interconnect behavior as mandatory unless the specification requires it.
4. Keep address-phase and data-phase ownership explicit. For multi-master diagrams, separately model arbitration, owner selection, address decoding, target selection, and return-data/response routing.
5. Do not imply that locking, exclusive access, security attribution, response status, or bus ownership are equivalent mechanisms.
6. Add or update tests that encode the corrected semantic claim. Do not remove a valid lesson reference to make a test pass.

## Block-diagram standard

All topology/block diagrams must use the production `TopologyViewer` and structured `TopologyData` JSON unless a materially different learning interaction requires another existing visual type.

### Content and hierarchy

- Use explicit, unique IDs for every diagram, region, node, and edge.
- Use semantic node roles accurately: `master`, `slave`, `arbiter`, `bridge`, `concept`, `phase`, or `state`.
- Group large diagrams into labeled source, fabric, target, or concept regions.
- Label signal/transaction direction. A bidirectional edge is permitted only when it represents one coherent forward/return channel and its label names both directions.
- Use `kind` and `tone` consistently. Color may reinforce meaning but must never carry meaning alone.
- Provide a concise title, one-sentence description, meaningful annotations, and a highlighted learning path where useful.

### Geometry and routing

- Prefer a clear left-to-right transaction flow and align peer blocks to a shared grid.
- Size blocks from their content; wrap long labels and reserve sufficient internal padding.
- Anchor connectors at block boundaries, not block centers.
- Route connectors orthogonally. Use explicit waypoints and label positions when automatic routing would cross a block, another route label, or a region heading.
- Do not allow blocks to overlap, connectors to pass through unrelated blocks, captions to cover blocks or other captions, or labels to clip outside the view box.
- Keep reciprocal request/grant or command/response routes in distinct lanes unless a single bidirectional connection is clearer and semantically exact.
- Avoid decorative crossing lines, diagonal spaghetti, and unnecessary animation.

### Interaction, accessibility, and responsive behavior

- Every inspectable node and connector must work with pointer, Enter, and Space and expose a meaningful accessible name and pressed/selected state.
- Use visible focus indication, persistent selection feedback, readable detail text, and at least 44×44 px touch/hit targets.
- Honor `prefers-reduced-motion`; use only short state transitions and never looping diagram animation.
- Dense diagrams must remain readable on mobile using an internal horizontal scroll container. The lesson page itself must not overflow horizontally.
- Verify light and dark themes, desktop and 375 px mobile layouts, keyboard interaction, text containment, and browser-console cleanliness.

### Required tests

For every new or modified topology asset, test:

- production-registry discovery and production rendering;
- unique node/edge IDs and valid endpoints;
- supported semantic node/edge types;
- block containment and minimum separation;
- orthogonal route segments;
- no route through an unrelated block;
- no block/label or label/label collision;
- keyboard selection and 44 px connector hit areas;
- mobile internal scrolling and an accessibility scan where practical.

Before completing any implementation task, run `npm run test` and `npm run build`. TypeScript, tests, and the Vite build must pass with no build warnings, no compatibility suppression, and no raised chunk-warning threshold.
