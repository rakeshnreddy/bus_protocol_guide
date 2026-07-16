---
id: "13_write_transaction_walkthrough"
title: "Write Transaction Walkthrough"
summary: "A cycle-by-cycle look at a complete write transaction."
protocol: "axi"
tier: "1"
level: "intermediate"
order: 13
tags: ["axi", "walkthrough", "write"]
relatedLessons: ["14_read_transaction_walkthrough"]
prerequisites: ["12_independent_channel_behavior"]
visualIds: ["wf-axi-write-channels"]
exerciseIds: ["lab-axi-write-response-prerequisites"]
glossaryTerms: []
checklistIds: []
---

Let's trace a typical write burst cycle by cycle, observing how the AW, W, and B channels work together to complete the transaction.

Look again at the write channel timeline. We are watching a master perform a 3-beat write burst.

![Three-beat AXI4 write with data preceding the address, independent stalls, and a delayed response](visual:wf-axi-write-channels)

### Cycle-by-Cycle Analysis

*   **Cycle 2:**
    *   **AW Channel:** The master offers `AWADDR = 0x100`, `AWID = 3`, and `AWLEN = 2`, but `AWREADY` is LOW. The AW payload must remain stable.
    *   **W Channel:** `WVALID` and `WREADY` are both HIGH, so the first beat (`D0`) transfers before the address has been accepted. AXI permits this ordering at the interface.
*   **Cycle 3:**
    *   **AW Channel:** `AWREADY` becomes HIGH and the address request transfers.
    *   **W Channel:** The master offers `D1`, but `WREADY` is LOW. This W-channel stall is independent of the AW handshake.
*   **Cycle 4:**
    *   **W Channel:** Backpressure continues. The master holds `WVALID`, `WDATA = D1`, `WSTRB`, and `WLAST` unchanged.
*   **Cycle 5:**
    *   **W Channel:** `WREADY` returns HIGH and the second beat (`D1`) transfers.
*   **Cycle 6:**
    *   **W Channel:** The third beat (`D2`) transfers with `WLAST = 1`. The accepted AW request and accepted final W beat now satisfy the AXI4 prerequisites for a write response.
*   **Cycle 7:**
    *   **B Channel:** The slave offers `BID = 3` and `BRESP = OKAY`, but the master holds `BREADY` LOW. The response must remain stable.
*   **Cycle 8:**
    *   **B Channel:** `BVALID` and `BREADY` are both HIGH, so the response transfers and the write transaction completes from the master's interface perspective.

Notice how the channels decouple timing. The master did not wait for the address to be accepted before providing data, and it did not provide addresses for beats D1 and D2; recipients derive the later transfer addresses from the accepted burst control information.
