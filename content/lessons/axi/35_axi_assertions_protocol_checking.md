---
id: "35_axi_assertions_protocol_checking"
tier: "3"
level: "advanced"
protocol: "axi"
title: "AXI Assertions and Protocol Checking"
section: "G"
order: 35
exerciseIds: []
summary: "Using assertions and protocol checkers to validate AXI interfaces."
tags:
  - axi
  - assertions
  - verification
  - sva
prerequisites: []
relatedLessons: []
visualIds: ["sig-axi-assertion-library"]
glossaryTerms: []
checklistIds: []
---

# AXI Assertions and Protocol Checking

Protocol checkers (often implemented using SystemVerilog Assertions, or SVA) are a core part of a serious AXI environment. AXI has precise rules; violating them can corrupt data, lose transaction ownership, or contribute to system deadlock.

The useful question is not merely “which assertion should I write?” but **what event triggers it, what state must it remember, and which legal behavior must it avoid rejecting?**

![AXI assertion library connecting channel and transaction rules to triggers, tracked state, and false-positive traps](visual:sig-axi-assertion-library)

## Key Properties to Check Continuously

A robust AXI protocol monitor should assert the following properties on every interface:

### 1. VALID and Payload Stability
Once `VALID` is asserted, it must remain HIGH, and the complete channel payload must remain stable until a rising edge with `READY` HIGH completes the handshake. `READY` itself can change according to destination capacity.
* **Failure Symptom:** Dropped transactions or corrupted data due to the master changing its mind while waiting for the slave.

### 2. WLAST / RLAST Correctness
The number of data beats in a burst must exactly equal `AxLEN + 1`. `WLAST` (or `RLAST`) must only be asserted on the final beat of the burst.
* **Failure Symptom:** Interconnect state machines get stuck waiting for data that will never come, or data is inadvertently routed to the wrong transaction.

### 3. ID Consistency
The `BID` returned by the slave must match an `AWID` that is currently outstanding. The `RID` must match an outstanding `ARID`.
* **Failure Symptom:** The master receives a response but doesn't know which thread to route it to, leading to software crashes or data corruption.

### 4. 4KB Boundary Compliance
A burst must never cross a 4KB address boundary (`0x1000`).
* **Failure Symptom:** One burst can require two decode targets or more address increments than the receiving component is required to support.

### 5. WRAP Burst Alignment
If `AxBURST == WRAP`, the starting address must be aligned to the transfer size, and the length must be 2, 4, 8, or 16 transfers.
* **Failure Symptom:** Cache line fetches return scrambled data because the wrap boundary math in the slave breaks down.

These are protocol safety properties. “READY eventually rises,” “every request completes within N cycles,” and “low-priority traffic is eventually served” are useful liveness properties only after the project defines the bound and environment or arbitration assumptions; AXI does not provide one universal finite service limit.
