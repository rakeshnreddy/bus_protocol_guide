---
id: "26_legal_illegal_patterns"
title: "Legal and Illegal Transaction Patterns"
summary: "A consolidated review of common AXI mistakes."
protocol: "axi"
tier: "1"
level: "expert"
order: 26
tags: ["axi", "rules", "bugs"]
relatedLessons: []
prerequisites: ["25_4kb_boundary_rule"]
visualIds: []
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

Before we move on to system architecture, let's consolidate the rules we've learned into a quick-reference guide of legal and illegal patterns.

## 1. Handshake Dependencies
*   **ILLEGAL:** A master waits for `AWREADY` to go HIGH before it asserts `AWVALID`.
*   **ILLEGAL:** A master waits for `WREADY` to go HIGH before it asserts `WVALID`.
*   **LEGAL:** A slave waits for `AWVALID` to go HIGH before it asserts `AWREADY`.

## 2. Channel Independence
*   **LEGAL:** A master asserts `WVALID` and sends data beats before it has even asserted `AWVALID` for the write address.
*   **ILLEGAL:** A slave asserts `BVALID` (Write Response) before the master has asserted `WLAST` for the final data beat.
*   **ILLEGAL:** A slave asserts `RVALID` (Read Data) before it has accepted the `ARVALID` read address.

## 3. Burst Constraints
*   **ILLEGAL:** A master initiates a burst that starts at `0x1FF0` and attempts to write 32 bytes (crossing the `0x2000` 4KB boundary).
*   **ILLEGAL:** A master requests a WRAP burst with `AxLEN = 5` (6 beats). WRAP bursts must be 2, 4, 8, or 16 beats exactly.
*   **ILLEGAL:** A master requests a burst with `AxSIZE = 0b011` (8 bytes) on a bus where the physical `WDATA` width is only 32 bits (4 bytes).

## 4. Termination
*   **ILLEGAL:** A master requests `AWLEN = 3` (4 beats), but asserts `WLAST` on the second data beat to abort the transfer early.
*   **LEGAL:** A master requests `AWLEN = 3` (4 beats), but drives all the `WSTRB` bits LOW on the final two beats because it didn't actually have data for them. (This is the correct way to "pad" a burst you can't fill).

## 5. Ordering
*   **ILLEGAL:** A master issues Write A (ID:0) and Write B (ID:0). The slave returns the `BRESP` for B before returning the `BRESP` for A.
*   **LEGAL:** A master issues Write A (ID:0) and Write B (ID:1). The slave returns the `BRESP` for B before returning the `BRESP` for A.
*   **LEGAL:** A master issues a Write to Address X, then a Read to Address X. The slave returns the Read data before the Write response has been sent (the master is responsible for avoiding read-after-write hazards, not the slave).
