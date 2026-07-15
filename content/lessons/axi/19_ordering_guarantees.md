---
id: "19_ordering_guarantees"
title: "Ordering Guarantees"
summary: "The strict rules governing when transactions must complete in order."
protocol: "axi"
tier: "1"
level: "expert"
order: 19
tags: ["axi", "ordering", "rules"]
relatedLessons: ["20_out_of_order_completion"]
prerequisites: ["18_outstanding_transactions"]
visualIds: ["wf-axi-in-order"]
exerciseIds: ["ex-axi-ordering"]
glossaryTerms: ["ID-Based Ordering"]
checklistIds: []
---

We know that AXI allows multiple outstanding transactions. The next logical question is: When the slave returns the responses, what order do they have to be in?

This is governed by the single most misunderstood rule in the AXI specification. Memorize it:

> **Read responses with the SAME ID, and write responses with the SAME ID, are returned in request order.**
> 
> **Transactions with DIFFERENT IDs have no relative response-order guarantee; they may complete in either order.**

## Same ID: Strict In-Order

If a master issues Read A (ID: 0x0) and then issues Read B (also ID: 0x0), the slave is legally obligated to return the data for Read A before it returns the data for Read B.

Why? Because the ID is the only mechanism the master has to correlate the returning data to its internal scoreboard. If the slave returned B before A, they both have `RID: 0x0`. The master would assume the first piece of data belonged to Request A, and would corrupt its internal state.

![Two same-ID AXI reads completing in request order](visual:wf-axi-in-order)

## Different IDs: Total Chaos

If a master issues Read A (ID: 0x0) and then issues Read B (ID: 0x1), the slave can return B before A, A before B, or—where the connected interfaces support read interleaving—interleave beats from the different IDs. The target is permitted to reorder; it is not required to do so.

If a master *needs* A to complete before B (for example, reading a status register before reading a data payload), the master has two choices:
1.  Use the same ID when the applicable same-channel ordering rules cover both transactions and their destination.
2.  Use the universal sequencing method: wait for A's final response handshake before issuing B.

## Read/Write Interactions

The rules above apply to Reads vs. Reads, and Writes vs. Writes. 

What about a Read vs. a Write? 
**There are absolutely no ordering guarantees between read and write transactions, regardless of the ID.**

If a master writes to Address X with ID 0, and then immediately reads from Address X with ID 0, the read might execute inside the slave *before* the write actually commits to memory. The master will read stale data! 

If a master needs protocol ordering between a write and a following read, it must wait until the write response is accepted (`BVALID && BREADY`) before issuing the read address. Matching numeric read and write IDs alone does not create a cross-channel ordering guarantee.
