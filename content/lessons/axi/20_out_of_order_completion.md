---
id: "20_out_of_order_completion"
title: "Out-of-Order Completion"
summary: "How different IDs allow a slave to reorder traffic for maximum efficiency."
protocol: "axi"
tier: "1"
level: "expert"
order: 20
tags: ["axi", "ordering", "performance"]
relatedLessons: ["19_ordering_guarantees"]
prerequisites: ["19_ordering_guarantees"]
visualIds: ["wf-axi-out-of-order"]
exerciseIds: []
glossaryTerms: ["Out-of-Order Completion"]
checklistIds: []
---

We know that if a master gives two transactions different IDs, the slave is allowed to complete them in any order. Why is this so important for performance?

## The DDR Memory Bottleneck

Imagine an AXI slave that represents a DDR memory controller. DDR is organized into banks, rows, and columns, so request latency depends on current bank state.
*   Accessing an already open row can have lower latency.
*   Accessing a different row can require precharge and activation before data is available.

### The Scenario
A high-performance CPU master issues two read requests in quick succession:
1.  **Read A (ID: 0):** Targets Address 0x1000 (which happens to be in a closed memory row).
2.  **Read B (ID: 1):** Targets Address 0x2000 (which happens to be in an open memory row).

### The In-Order AHB Approach
If this were AHB, the slave would receive Address A, realize it needs to wait for a precharge, pull `HREADY` low, and stall the shared pipeline. An overlapping Address B can be presented, but it cannot be accepted while `HREADY` is LOW.

### The Out-of-Order AXI Approach
Because the CPU used different IDs, the AXI slave (the memory controller) is permitted to complete the responses in a different order.
It receives Address A and realizes it will take 10 cycles to fetch. 
It then immediately receives Address B. It realizes Address B is instantly available. 
Instead of making B wait, the slave immediately fetches B's data, puts it on the Read Data channel with `RID = 1`, and completes transaction B.
10 cycles later, when A's data is finally ready, it puts it on the Read Data channel with `RID = 0`.

![Two AXI reads using different IDs and completing in reverse request order](visual:wf-axi-out-of-order)

The master receives B before A and uses `RID` plus its per-ID issue queue to select the correct destination state. This can improve service opportunity and channel utilization, but the exact throughput benefit depends on the target, interconnect, buffering, and traffic pattern.
