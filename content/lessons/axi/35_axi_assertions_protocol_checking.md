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
visualIds: []
glossaryTerms: []
checklistIds: []
---

# AXI Assertions and Protocol Checking

Protocol checkers (often implemented using SystemVerilog Assertions, or SVA) are mandatory in an AXI environment. AXI has rigid rules; violating them can silently corrupt data or deadlock the system.

## Key Properties to Check Continuously

A robust AXI protocol monitor should assert the following properties on every interface:

### 1. Ready/Valid Stability
Once `VALID` is asserted, it must remain HIGH, and the payload (e.g., Address, Data) must remain perfectly stable until `READY` is asserted to complete the handshake.
* **Failure Symptom:** Dropped transactions or corrupted data due to the master changing its mind while waiting for the slave.

### 2. WLAST / RLAST Correctness
The number of data beats in a burst must exactly equal `AxLEN + 1`. `WLAST` (or `RLAST`) must only be asserted on the final beat of the burst.
* **Failure Symptom:** Interconnect state machines get stuck waiting for data that will never come, or data is inadvertently routed to the wrong transaction.

### 3. ID Consistency
The `BID` returned by the slave must match an `AWID` that is currently outstanding. The `RID` must match an outstanding `ARID`.
* **Failure Symptom:** The master receives a response but doesn't know which thread to route it to, leading to software crashes or data corruption.

### 4. 4KB Boundary Compliance
A burst must never cross a physical 4KB boundary (`0x1000`).
* **Failure Symptom:** The transaction might cross from one memory slave's address region into another slave's region, which a standard slave cannot handle without an interconnect intervening.

### 5. WRAP Burst Alignment
If `AxBURST == WRAP`, the starting address must be aligned to the `AxSIZE`. The length must be 2, 4, 8, or 16.
* **Failure Symptom:** Cache line fetches return scrambled data because the wrap boundary math in the slave breaks down.
