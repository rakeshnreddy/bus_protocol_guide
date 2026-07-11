---
id: "18_outstanding_transactions"
title: "Outstanding Transactions"
summary: "What it means for a master to have multiple requests in flight."
protocol: "axi"
tier: "1"
level: "advanced"
order: 18
tags: ["axi", "ordering", "performance"]
relatedLessons: ["19_ordering_guarantees"]
prerequisites: ["17_ids_and_transaction_matching"]
visualIds: []
exerciseIds: []
glossaryTerms: ["Outstanding Transaction"]
checklistIds: []
---

An "Outstanding Transaction" is any transaction where the master has successfully sent the address, but has not yet received the final data/response.

In AHB, you can only ever have **one** outstanding transaction (thanks to pipelining, the address of transaction N+1 overlaps with the data of transaction N, but the bus is physically tied up).

In AXI, a master can have dozens of outstanding transactions simultaneously.

## How it Works

A high-performance master (like a DMA engine or a GPU) might need to read 10 different memory locations. It does not wait for the first read to finish before requesting the second. 

Instead, it blasts out all 10 read addresses on the AR channel in 10 consecutive clock cycles (assuming the slave holds `ARREADY` high). 
The master now has **10 outstanding reads**.

The slave (which might be a complex DDR memory controller) receives these 10 addresses. It can now look at all of them, figure out which memory banks are already open, and fetch the data in whatever order is most efficient for the physical RAM chips.

## The Cost of Outstanding Transactions

Supporting multiple outstanding transactions is what makes AXI so fast, but it is not free.

For every transaction a master issues, it must allocate internal tracking logic (a buffer or a scoreboard entry) to remember what it asked for, where to put the data when it returns, and what the ID was. 
If a master is designed to support a maximum of 4 outstanding transactions, and it currently has 4 in flight, it **must** stall (pull `ARVALID` or `AWVALID` low) and refuse to issue any new requests until at least one of the outstanding transactions completes and frees up a scoreboard slot.

**Senior DV Tip:** One of the most important metrics to verify on an AXI master is its "maximum outstanding capability." If the spec says it supports 16 outstanding reads, you must write a test that throttles the slave's `RVALID` to force 16 outstanding reads to build up, and then verify the master correctly halts `ARVALID` on the 17th request without dropping data.
