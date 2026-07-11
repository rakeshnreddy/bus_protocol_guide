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

> **Transactions with the SAME ID must complete in the exact order they were issued.**
> 
> **Transactions with DIFFERENT IDs have no ordering guarantees whatsoever; they may complete in any order.**

## Same ID: Strict In-Order

If a master issues Read A (ID: 0x0) and then issues Read B (also ID: 0x0), the slave is legally obligated to return the data for Read A before it returns the data for Read B.

Why? Because the ID is the only mechanism the master has to correlate the returning data to its internal scoreboard. If the slave returned B before A, they both have `RID: 0x0`. The master would assume the first piece of data belonged to Request A, and would corrupt its internal state.

![wf-axi-in-order](visual:wf-axi-in-order)

## Different IDs: Total Chaos

If a master issues Read A (ID: 0x0) and then issues Read B (ID: 0x1), the slave can return B before A, A before B, or it can even interleave the beats (Beat B1, Beat A1, Beat B2, Beat A2).

If a master *needs* A to complete before B (for example, reading a status register before reading a data payload), the master has two choices:
1.  Give them the same ID.
2.  Wait for A to fully complete (receive `RLAST`) before issuing the address for B.

## Read/Write Interactions

The rules above apply to Reads vs. Reads, and Writes vs. Writes. 

What about a Read vs. a Write? 
**There are absolutely no ordering guarantees between read and write transactions, regardless of the ID.**

If a master writes to Address X with ID 0, and then immediately reads from Address X with ID 0, the read might execute inside the slave *before* the write actually commits to memory. The master will read stale data! 

If a master needs to read data it just wrote, it **must** wait to receive the `BVALID` response for the write before it is allowed to assert `ARVALID` for the read.
