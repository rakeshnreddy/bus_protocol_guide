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

In the visual below, both protocols attempt to initiate three write transactions.
Notice that when AHB stalls on the data phase of transaction 2 (D2), it physically blocks the address for transaction 3 (A3) from ever reaching the bus.
In AXI, the address channel is independent. Even though the W channel stalls on W2, the AW channel is free to deliver AW3 immediately. 

![wf-axi-throughput](visual:wf-axi-throughput)

## Where do Bottlenecks Still Occur?

Even with AXI, systems still stall. The most common bottlenecks are:
1.  **ID Pool Exhaustion:** If a master only supports 4 unique IDs, it can only have 4 outstanding transactions. Once it hits that limit, it must artificially backpressure itself (stop asserting `AxVALID`) until a response frees up an ID.
2.  **B-Channel Latency:** A write isn't "done" until the B response arrives. If an interconnect is very slow at routing B responses, the master's outstanding transaction buffer will fill up, causing it to stall new requests even if the slave itself is very fast.

---

## AXI Bug Gallery

As a Verification Engineer, you will spend most of your time hunting for ordering and backpressure bugs. Here are the three most common ones you will find in real RTL:

### Bug 1: The Address-Based Scoreboard
*   **The Flaw:** A junior engineer writes a DV scoreboard that tracks transactions by looking at the `AWADDR` and waiting for a `BRESP` associated with that address.
*   **Why it Breaks:** Responses on the B channel do not contain addresses; they only contain a `BID`. If the master has multiple outstanding writes to different addresses, and they complete out-of-order, the scoreboard has no idea which `BRESP` matches which `AWADDR`. Scoreboards **must** be keyed by transaction ID, not address.

### Bug 2: Assuming Global Ordering
*   **The Flaw:** A master writes a configuration flag to Address X (ID 0), and then immediately sends a "START" command to Address Y (ID 1). 
*   **Why it Breaks:** Because they have different IDs, the interconnect or the slave might reorder them. The "START" command might execute before the configuration flag is written, causing the peripheral to crash. If ordering is required, the master must either use the same ID, or wait for the `BRESP` from X before issuing Y.

### Bug 3: Read/Write Race Condition
*   **The Flaw:** A master writes a packet of data to memory, and then immediately issues a read to that exact same memory location to verify it.
*   **Why it Breaks:** AXI provides **zero** ordering guarantees between Reads and Writes, even if they share an ID. The Read might execute in the slave before the Write data arrives. The master must wait for the Write Response before issuing the Read Address.
