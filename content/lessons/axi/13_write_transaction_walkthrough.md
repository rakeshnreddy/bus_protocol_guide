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
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

Let's trace a typical write burst cycle by cycle, observing how the AW, W, and B channels work together to complete the transaction.

Look again at the write channel timeline. We are watching a master perform a 3-beat write burst.

![wf-axi-write-channels](visual:wf-axi-write-channels)

### Cycle-by-Cycle Analysis

*   **Cycle 1:** 
    *   **AW Channel:** The master drives the target address (`AWADDR = 0x100`) and asserts `AWVALID`. The slave happens to already be asserting `AWREADY`. Because both are HIGH on the rising edge of Cycle 1, the address phase completes immediately.
    *   **W Channel:** In this exact same cycle, the master *also* drives the first beat of data (`WDATA = D0`) and asserts `WVALID`. The slave, however, is not ready for data yet (`WREADY` is LOW). The data is not transferred yet.
*   **Cycle 2:**
    *   **AW Channel:** The address phase is over. The master deasserts `AWVALID`.
    *   **W Channel:** The master holds `D0` and keeps `WVALID` HIGH. The slave asserts `WREADY`. Because both are HIGH, the first data beat (D0) transfers.
*   **Cycle 3:**
    *   **W Channel:** The master provides the second beat (`D1`). The slave is still ready. The second beat transfers.
*   **Cycle 4:**
    *   **W Channel:** The master provides the third and final beat (`D2`). Because this is the final beat of the burst, the master **must assert `WLAST = 1`**. The slave is ready. The final beat transfers. The write payload is now completely inside the slave.
*   **Cycle 5:**
    *   **B Channel:** The slave processes the write, determines it was successful, drives `BRESP = OKAY`, and asserts `BVALID`. The master is waiting for a response (`BREADY = 1`). The response transfers, and the entire transaction is officially complete.

Notice how efficient this is. The master didn't have to wait for the address to be accepted before providing data, and it didn't have to provide addresses for beats D1 and D2 (the slave calculates those internally based on the burst type).
