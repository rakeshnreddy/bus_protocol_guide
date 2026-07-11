---
id: "34_axi_simulation_strategy"
tier: "3"
level: "advanced"
protocol: "axi"
title: "AXI Simulation Strategy"
section: "G"
order: 34
exerciseIds: []
---

# AXI Simulation Strategy

Verifying an AXI interconnect or IP block is meaningfully harder than verifying AHB. While AHB requires strict pipelined tracking, AXI requires decoupled, out-of-order, multi-ID tracking. Your simulation strategy must reflect this complexity.

## VIP-Based Sequence Design

Because AXI relies on independent channels, manual stimulus generation (e.g., bit-banging a BFM) is virtually impossible to scale. You *must* use a Verification IP (VIP) component (such as UVM AXI VIP) that allows you to abstract transactions.

When designing sequences:
1. **Stress ID generation:** Do not just use ID=0 for everything. Constrain your sequence to generate a pool of IDs, sometimes reusing them (forcing in-order returns) and sometimes varying them (allowing out-of-order returns).
2. **Stress Backpressure:** Randomize `xREADY` signals on the slave side, and `xVALID` delays on the master side. The most critical bugs in AXI hide in FIFO full/empty edge cases.
3. **Interleave Traffic:** Inject traffic across multiple masters targeting multiple slaves simultaneously to stress interconnect arbitration and crossbar routing.

## The AXI Scoreboard Challenge

An AHB scoreboard is essentially a FIFO. A request goes in, and the response comes out in the exact same order.

An AXI scoreboard is **not** a FIFO; it is an associative array or a pool of queues keyed by the transaction ID. 

### Why the Scoreboard is Harder
Because AXI supports out-of-order completion, you cannot simply expect the first read request to yield the first read response. If you issue ARID=1, ARID=2, and ARID=3, the responses might return as RID=3, RID=1, RID=2.

Your scoreboard must:
1. Store the expected response when the Address channel handshake completes.
2. Key the expected response by the `AxID`.
3. When a response arrives on the B or R channel, look up the expected response using the `BID` or `RID`.
4. If multiple transactions share the same ID (e.g., two ARID=1 requests), they *must* return in order. Thus, your scoreboard needs a FIFO *per ID*.

If you try to build an AXI scoreboard by matching addresses instead of IDs, your environment will immediately report false failures as soon as out-of-order traffic is enabled.
