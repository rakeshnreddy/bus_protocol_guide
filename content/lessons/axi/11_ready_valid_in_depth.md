---
id: "11_ready_valid_in_depth"
title: "Ready/Valid in Depth"
summary: "The fundamental handshake mechanism that powers all of AXI."
protocol: "axi"
tier: "1"
level: "intermediate"
order: 11
tags: ["axi", "handshake", "flow-control"]
relatedLessons: ["12_independent_channel_behavior"]
prerequisites: ["04_five_channel_model"]
visualIds: ["wf-axi-ready-valid-scenarios"]
exerciseIds: []
glossaryTerms: ["Handshake"]
checklistIds: []
---

Every single transfer in AXI—whether it is an address, a beat of data, or a response—is governed by a two-way `VALID` and `READY` handshake. This is the bedrock of AXI flow control.

## The Rule of the Handshake

A transfer *only* occurs on the rising edge of the clock when **both** `VALID` and `READY` are HIGH.

*   The source drives `VALID` HIGH when it has placed valid information (address, data, or response) onto the channel.
*   The destination drives `READY` HIGH when it is capable of accepting that information.

### The Three Scenarios

Because `VALID` and `READY` are driven by two completely independent entities (the master and the slave), there are three possible timing scenarios for any transfer:

1.  **VALID before READY:** The source puts data on the bus and asserts `VALID`. The destination is not ready (`READY` is LOW). The source *must* hold the data and keep `VALID` asserted until the destination asserts `READY`.
2.  **READY before VALID:** The destination asserts `READY`, signaling "I am waiting for data." The source has nothing to send yet (`VALID` is LOW). When the source finally asserts `VALID`, the transfer happens immediately on that clock edge.
3.  **Simultaneous:** Both `VALID` and `READY` go HIGH on the exact same clock edge. The transfer completes immediately.

Inspect all three legal scenarios below, then compare them with the final failure. The `TRANSFER` row names only the rising edges where both handshake signals are HIGH.

![AXI VALID and READY waveform comparing legal timing scenarios, stable backpressure, and an early VALID drop](visual:wf-axi-ready-valid-scenarios)

## The Most Important Rule in AXI

There is one critical constraint on the handshake, and violating it is the most common cause of fatal AXI deadlocks:

> **A source is NOT permitted to wait until READY is asserted before asserting VALID.**

If a master wants to send an address, it must put the address on the bus and assert `AWVALID`. It cannot look at `AWREADY` and say, "I'll wait until the slave is ready before I assert `AWVALID`."

However, the reverse is totally legal:
> **A destination IS permitted to wait for VALID to be asserted before asserting READY.**

A slave can sit with `AWREADY` LOW all day, wait to see `AWVALID` go HIGH, take a few cycles to process it, and *then* assert `AWREADY` to complete the transfer.

If both the source and the destination were allowed to wait for the other side to assert their signal first, they could easily enter a circular deadlock where neither side ever moves. AXI prevents this by enforcing that `VALID` must never depend on `READY`.
