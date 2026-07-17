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
visualIds: ["tl-axi-outstanding-window", "model-axi-read-checker"]
exerciseIds: []
glossaryTerms: ["Outstanding Transaction"]
checklistIds: []
---

For interface scoreboarding, an accepted transaction is in flight after its address handshake and remains outstanding until the master accepts its final data/response transfer. A read retires on `RVALID && RREADY && RLAST`; a write retires on `BVALID && BREADY`.

On one AHB path, the overlapping address/data pipeline does not create AXI-style response-tagged outstanding requests: a wait in the active data phase prevents the next visible address from being accepted. Separate matrix layers can progress independently.

In AXI, an implementation can support many outstanding transactions simultaneously. Read and write depths, and optional per-ID limits, are interface capabilities rather than fixed protocol numbers. Accepted W data that precedes AW consumes pre-address association capacity but is not counted as an accepted-address outstanding write.

## How it Works

A high-performance master (like a DMA engine or a GPU) might need to read 10 different memory locations. It does not wait for the first read to finish before requesting the second. 

Instead, it blasts out all 10 read addresses on the AR channel in 10 consecutive clock cycles (assuming the slave holds `ARREADY` high). 
The master now has **10 outstanding reads**.

The slave (which might be a complex DDR memory controller) receives these 10 addresses. It can now look at all of them, figure out which memory banks are already open, and fetch the data in whatever order is most efficient for the physical RAM chips.

The timeline below shows the bookkeeping boundary precisely. Read C even reuses ID 0 while Read A is still active; that is legal, but it adds another same-ID queue entry and preserves A-before-C response order.

![Three overlapping AXI reads allocating, occupying, and retiring scoreboard entries](visual:tl-axi-outstanding-window)

## The Cost of Outstanding Transactions

Supporting multiple outstanding transactions is what makes AXI so fast, but it is not free.

For every accepted address, a master must allocate tracking logic to remember what it requested, where returning data belongs, and which per-ID queue entry owns it. Read and write counters are separate: AR allocates a read, accepted RLAST retires it; AW allocates a write, accepted B retires it.
If a master is designed to support a maximum of 4 outstanding transactions and all 4 entries are occupied, it must not present a fifth request until an entry is free. If it has already asserted an address-channel `VALID` for a request, however, it cannot withdraw that `VALID` merely because `READY` is LOW; the payload must remain stable until handshake.

**Senior DV Tip:** One of the most important metrics to verify on an AXI master is its "maximum outstanding capability." If the design contract says it supports 16 outstanding reads, throttle R-channel completion so 16 accepted requests remain active, then verify that no 17th AR handshake occurs until a slot is available—and that any already-presented AR payload remains stable under backpressure.

## Execute the per-ID read model

The read checker maintains a global accepted-read count and a queue for each ID. Execute legal different-ID reordering, repeated-ID ordering, exact accepted-beat `RLAST`, ID remapping/restoration, data attribution, response underflow, and configured-depth overflow. Internal work can finish in another order, but the interface response must still select a legal per-ID queue head and retire only on an accepted final beat.

![Executable AXI read checker showing per-ID queues, reordering, exact RLAST retirement, ID restoration, and independent data scoreboarding](visual:model-axi-read-checker)
