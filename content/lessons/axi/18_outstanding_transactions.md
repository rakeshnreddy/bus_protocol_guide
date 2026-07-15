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
visualIds: ["tl-axi-outstanding-window"]
exerciseIds: []
glossaryTerms: ["Outstanding Transaction"]
checklistIds: []
---

For interface scoreboarding, an accepted transaction is in flight after its address handshake and remains outstanding until the master accepts its final data/response transfer. A read retires on `RVALID && RREADY && RLAST`; a write retires on `BVALID && BREADY`.

In AHB, you can only ever have **one** outstanding transaction (thanks to pipelining, the address of transaction N+1 overlaps with the data of transaction N, but the bus is physically tied up).

In AXI, an implementation can support many outstanding transactions simultaneously. The supported depth is an interface capability, not a fixed number required by the protocol.

## How it Works

A high-performance master (like a DMA engine or a GPU) might need to read 10 different memory locations. It does not wait for the first read to finish before requesting the second. 

Instead, it blasts out all 10 read addresses on the AR channel in 10 consecutive clock cycles (assuming the slave holds `ARREADY` high). 
The master now has **10 outstanding reads**.

The slave (which might be a complex DDR memory controller) receives these 10 addresses. It can now look at all of them, figure out which memory banks are already open, and fetch the data in whatever order is most efficient for the physical RAM chips.

The timeline below shows the bookkeeping boundary precisely. Read C even reuses ID 0 while Read A is still active; that is legal, but it adds another same-ID queue entry and preserves A-before-C response order.

![Three overlapping AXI reads allocating, occupying, and retiring scoreboard entries](visual:tl-axi-outstanding-window)

## The Cost of Outstanding Transactions

Supporting multiple outstanding transactions is what makes AXI so fast, but it is not free.

For every transaction a master issues, it must allocate internal tracking logic (a buffer or a scoreboard entry) to remember what it asked for, where to put the data when it returns, and what the ID was. 
If a master is designed to support a maximum of 4 outstanding transactions and all 4 entries are occupied, it must not present a fifth request until an entry is free. If it has already asserted an address-channel `VALID` for a request, however, it cannot withdraw that `VALID` merely because `READY` is LOW; the payload must remain stable until handshake.

**Senior DV Tip:** One of the most important metrics to verify on an AXI master is its "maximum outstanding capability." If the design contract says it supports 16 outstanding reads, throttle R-channel completion so 16 accepted requests remain active, then verify that no 17th AR handshake occurs until a slot is available—and that any already-presented AR payload remains stable under backpressure.
