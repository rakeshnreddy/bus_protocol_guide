---
id: "17_ids_and_transaction_matching"
title: "IDs and Transaction Matching"
summary: "How AXI tracks transactions across independent channels."
protocol: "axi"
tier: "1"
level: "advanced"
order: 17
tags: ["axi", "ordering", "ids"]
relatedLessons: ["18_outstanding_transactions", "19_ordering_guarantees"]
prerequisites: ["04_five_channel_model"]
visualIds: ["wf-axi-ids-correlation", "tp-axi-crossbar"]
exerciseIds: []
glossaryTerms: ["AWID", "BID", "ARID", "RID"]
checklistIds: []
---

Because AXI channels are independent, and because AXI allows multiple requests to be in flight simultaneously, there must be a mechanism to match a response returning on the B or R channel back to the original request that spawned it on the AW or AR channel.

This mechanism is the ID system.

## The ID Signals

The master assigns an ID to every transaction it initiates:
*   **`AWID`** for writes.
*   **`ARID`** for reads.

The slave is required to mirror that exact ID when it provides the corresponding response or data:
*   **`BID`** must match `AWID` for writes.
*   **`RID`** must match `ARID` for reads.

When the master receives `BID` or `RID`, it uses that tag to close out the transaction in its internal tracking logic.

![AXI4 writes whose data follows address order while different-ID responses complete in another order](visual:wf-axi-ids-correlation)

## ID Widths and Interconnects

The AXI specification does not mandate a specific bit-width for the ID signals (though 4, 8, or 16 bits are common). 

Crucially, **the ID width can change as a transaction travels through a system interconnect**. 

If Master 0 issues a transaction with `ARID=0x1`, and Master 1 issues a transaction with `ARID=0x1` at the same time, the interconnect must preserve enough source context to keep them distinct at a shared slave and to route their responses correctly. Physically appending source bits is one common implementation, but an interconnect can instead remap IDs or retain source metadata internally.

When the slave returns data, the interconnect reverses its configured mapping and presents the original master-local ID at the originating interface. The exact internal encoding is an implementation choice, not an AXI-mandated bit layout.

Inspect the two routes below: both masters legally use local ID 0x1, while the fabric retains source ownership across request and response paths.

![AXI crossbar preserving two masters' local ID ownership across concurrent target routes](visual:tp-axi-crossbar)

This means you must never rely on IDs having a fixed, global meaning across an entire SoC. Their meaning is strictly local to the specific point-to-point interface.
