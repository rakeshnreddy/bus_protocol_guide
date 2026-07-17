---
id: "22_throughput_reasoning_bottlenecks"
title: "Throughput Reasoning and Bug Gallery"
summary: "Analyzing performance limits and the most common ordering bugs."
protocol: "axi"
tier: "1"
level: "expert"
order: 22
tags: ["axi", "performance", "bugs"]
relatedLessons: []
prerequisites: ["20_out_of_order_completion", "21_backpressure_behavior"]
visualIds: ["wf-axi-throughput"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

We have seen how AXI achieves high throughput via independent channels, outstanding transactions, and out-of-order completion. Let's visualize that throughput advantage directly against AHB.

## AHB vs AXI: The Pipeline Advantage

In the visual below, both examples attempt to initiate several transfers.
Notice that when AHB stalls on the data phase of transaction 2 (D2), the overlapping address phase for transaction 3 (A3) can be visible but is not accepted; its address and control remain held until `HREADY` returns HIGH.
In AXI, the address channel is independent. Even though the W channel stalls on W2, the AW channel is free to handshake AW3. This illustrates channel isolation, not a protocol-mandated latency or universal AXI speedup.

![AHB data-phase wait holding an overlapping address compared with an AXI write-data stall that leaves AW independent](visual:wf-axi-throughput)

## Where do Bottlenecks Still Occur?

Even with AXI, systems still stall. The most common bottlenecks are:
1.  **Outstanding Tracker Exhaustion:** If a master has only 4 scoreboard entries, it cannot accept responsibility for a fifth outstanding transaction until one retires. The number of distinct ID values controls how many independent ordering streams are available; it does **not** by itself cap outstanding depth, because the same ID can legally be reused for multiple queued transactions.
2.  **B-Channel Latency:** A write isn't "done" until the B response arrives. If an interconnect is very slow at routing B responses, the master's outstanding transaction buffer will fill up, causing it to stall new requests even if the slave itself is very fast.

### Write association state

An AXI4 receiver maintains an accepted-AW queue in issue order and associates W bursts with that queue. Early accepted W beats need a pre-AW buffer until an address is available. B responses can reorder across different IDs only after each write's accepted AW and final accepted W prerequisites are satisfied; response reordering never changes AXI4 W association order. Repeated IDs require per-ID write queues rather than a single slot per numeric ID.

---

## AXI Bug Gallery

As a Verification Engineer, you will spend most of your time hunting for ordering and backpressure bugs. Here are the three most common ones you will find in real RTL:

### Bug 1: The Address-Based Scoreboard
*   **The Flaw:** A junior engineer writes a DV scoreboard that tracks transactions by looking at the `AWADDR` and waiting for a `BRESP` associated with that address.
*   **Why it Breaks:** Responses on the B channel do not contain addresses; they contain `BID`. A scoreboard therefore needs a per-ID issue-order queue that stores each accepted request's address and attributes. Keying only by address loses response correlation, while keying only by ID loses repeated same-ID transactions.

### Bug 2: Assuming Global Ordering
*   **The Flaw:** A master writes a configuration flag to Address X (ID 0), and then immediately sends a "START" command to Address Y (ID 1). 
*   **Why it Breaks:** Because they have different IDs, the interconnect or the slave might reorder them. The "START" command might execute before the configuration flag is written. If ordering across these locations is required, the robust protocol sequence is to wait for the accepted `BRESP` from X before issuing Y; reusing one numeric ID is not a universal ordering barrier across arbitrary destinations or locations.

### Bug 3: Read/Write Race Condition
*   **The Flaw:** A master writes a packet of data to memory, and then immediately issues a read to that exact same memory location to verify it.
*   **Why it Breaks:** AXI provides no ID-based ordering guarantee between read and write channels, even when the numeric IDs match. The read might execute before the write completes. For the required write-before-read sequence, the master waits for the write-response handshake before issuing the read address.
