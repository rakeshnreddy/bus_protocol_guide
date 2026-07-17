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
visualIds: ["sig-axi-legality-patterns"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

Before we move on to system architecture, let's consolidate the rules we've learned into a quick-reference guide of legal and illegal patterns.

The debugger below answers: **which endpoint owns the rule, and what state must a monitor retain to diagnose the failure?**

![Interactive AXI4 legality debugger covering handshakes, responses, bursts, LAST, IDs, and cross-channel hazards](visual:sig-axi-legality-patterns)

## 1. Handshake Dependencies
*   **ILLEGAL:** A master waits for `AWREADY` to go HIGH before it asserts `AWVALID`.
*   **ILLEGAL:** A master waits for `WREADY` to go HIGH before it asserts `WVALID`.
*   **LEGAL:** A slave waits for `AWVALID` to go HIGH before it asserts `AWREADY`.
*   **ILLEGAL implementation structure:** A master or slave has a combinational path from interface input signals to interface outputs.

## 2. Channel Independence
*   **LEGAL:** A master asserts `WVALID` and sends data beats before it has even asserted `AWVALID` for the write address.
*   **LEGAL:** A slave keeps `WREADY` LOW until it has address context or buffer capacity; early W acceptance is permitted, not required.
*   **ILLEGAL:** In AXI4, a slave asserts `BVALID` before it has accepted both the write address and the final write-data transfer with `WLAST` HIGH.
*   **ILLEGAL:** A slave asserts `RVALID` (Read Data) before it has accepted the corresponding read address.

## 3. Burst Constraints
*   **ILLEGAL:** A master initiates a burst that starts at `0x1FF0` and attempts to write 32 bytes (crossing the `0x2000` 4KB boundary).
*   **ILLEGAL:** A master requests a WRAP burst with `AxLEN = 5` (6 beats). WRAP bursts must be 2, 4, 8, or 16 beats exactly.
*   **ILLEGAL:** A master requests a burst with `AxSIZE = 0b011` (8 bytes) on a bus where the physical `WDATA` width is only 32 bits (4 bytes).

## 4. Termination
*   **ILLEGAL:** A master requests `AWLEN = 3` (4 beats), but asserts `WLAST` on the second data beat to abort the transfer early.
*   **LEGAL when the lane mask and target contract allow it:** A master requests `AWLEN = 3` (4 beats), completes all four transfers, and drives all `WSTRB` bits LOW on unwanted remaining beats. The transfers still occur and LAST/count obligations remain; the zero strobes merely suppress byte updates.

## 5. Ordering
*   **ILLEGAL:** A master issues Write A (ID:0) and Write B (ID:0). The slave returns the `BRESP` for B before returning the `BRESP` for A.
*   **LEGAL:** A master issues Write A (ID:0) and Write B (ID:1). The slave returns the `BRESP` for B before returning the `BRESP` for A.
*   **LEGAL at the channel level, subject to system ordering:** A master issues a Write to Address X, then a Read to Address X, and the Read data can appear before the Write response. Independent read and write channels do not create a universal response-order guarantee; the requester and system ordering mechanism must establish any required read-after-write dependency.

## 6. Revision-aware write association

*   **AXI3:** `WID` associates write data and the revision permits write-data interleaving under its rules.
*   **AXI4:** `WID` is removed; W bursts follow write-address order and cannot interleave.
*   **Both:** a source can offer W before AW, while the destination chooses whether to accept it. In AXI4, `BVALID` still waits for accepted AW and the accepted final W transfer; in AXI3 the response dependency requires the final accepted W transfer but does not add the AXI4 AW-handshake prerequisite.
