---
id: "31_multi_master_reasoning"
title: "Multi-Master System Reasoning"
summary: "How the ID space is managed and routed in complex systems."
protocol: "axi"
tier: "1"
level: "expert"
order: 31
tags: ["axi", "architecture", "multi-master"]
relatedLessons: ["30_axi_interconnects_crossbars"]
prerequisites: ["30_axi_interconnects_crossbars", "17_ids_and_transaction_matching"]
visualIds: ["tp-axi-crossbar"]
exerciseIds: ["lab-axi-local-id-context"]
glossaryTerms: []
checklistIds: []
---

When reasoning about multi-master AXI systems, the most critical concept to master is how the Interconnect handles IDs.

If Master 0 and Master 1 are both connected to the same crossbar, and they both issue a read transaction with `ARID = 0x5`, what happens?

## ID Extension

The interconnect must preserve enough source identity that a returned `RID` or `BID` reaches the correct master, even when two master ports reuse the same local ID value.

One common direct scheme is **ID Extension**. The interconnect concatenates source-port bits with the master-local ID before forwarding the request.

*   Master 0 sends `ARID = 0x5` (4 bits).
*   Master 1 sends `ARID = 0x5` (4 bits).
*   The crossbar assigns Master 0 the prefix `0b0` and Master 1 the prefix `0b1`.
*   The slave receives `ARID = 0x05` from Master 0, and `ARID = 0x15` from Master 1. Notice the `ARID` signal going to the slave must be wider (5 bits) than the `ARID` signals coming from the masters!

The topology answers: **how can both masters legally use local ID `0x1`, and what information brings each response home?**

![AXI crossbar preserving two masters' local ID ownership across concurrent target routes](visual:tp-axi-crossbar)

When the slave returns the data:
*   It returns `RID = 0x15`.
*   In this illustrative prefix scheme, the crossbar uses the source bit (`0b1`), routes the response to Master 1, removes the extension, and passes local `RID = 0x5` back to Master 1.

The exact internal representation is an implementation choice. A fabric can use explicit extension bits, remap IDs, or retain separate routing metadata, provided it preserves AXI ordering and returns the original local ID at the master interface.

## ID Width Bottlenecks

As a Verification Engineer, you must be acutely aware of ID widths at different points in the topology.

With a direct source-prefix scheme, 16 master ports require four source bits, so an 8-bit local ID becomes 12 bits at that downstream interface. A fabric connected to a narrower legacy target can instead remap IDs or limit accepted outstanding traffic. That is a concrete architecture and performance tradeoff: verification must check collision freedom, backpressure, ordering, and response restoration for the configured scheme.
