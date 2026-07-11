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
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

When reasoning about multi-master AXI systems, the most critical concept to master is how the Interconnect handles IDs.

If Master 0 and Master 1 are both connected to the same crossbar, and they both issue a read transaction with `ARID = 0x5`, what happens?

## ID Extension

The crossbar must guarantee that the slave sees a unique ID for every transaction, so that when the slave returns the `RID`, the crossbar knows exactly which master to route it back to.

To do this, the crossbar performs **ID Extension**. 
It takes the ID provided by the master, and prepends a "Master Number" to it.

*   Master 0 sends `ARID = 0x5` (4 bits).
*   Master 1 sends `ARID = 0x5` (4 bits).
*   The crossbar assigns Master 0 the prefix `0b0` and Master 1 the prefix `0b1`.
*   The slave receives `ARID = 0x05` from Master 0, and `ARID = 0x15` from Master 1. Notice the `ARID` signal going to the slave must be wider (5 bits) than the `ARID` signals coming from the masters!

When the slave returns the data:
*   It returns `RID = 0x15`.
*   The crossbar looks at the top bit (`0b1`), knows this belongs to Master 1, strips the top bit off, and passes `RID = 0x5` back to Master 1.

## ID Width Bottlenecks

As a Verification Engineer, you must be acutely aware of ID widths at different points in the topology.

If you have 16 masters connected to a single interconnect, the interconnect must add 4 bits to every ID to ensure uniqueness. If the masters output 8-bit IDs, the slaves must support 12-bit IDs. 
If a legacy slave IP block only supports 4-bit IDs, you have a massive architectural problem. The interconnect will have to artificially limit the number of outstanding transactions across the entire system to ensure the slave's 4-bit ID space never overflows, crippling your system performance.
