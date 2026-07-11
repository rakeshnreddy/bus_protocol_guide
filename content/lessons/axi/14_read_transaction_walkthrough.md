---
id: "14_read_transaction_walkthrough"
title: "Read Transaction Walkthrough"
summary: "A cycle-by-cycle look at a complete read transaction."
protocol: "axi"
tier: "1"
level: "intermediate"
order: 14
tags: ["axi", "walkthrough", "read"]
relatedLessons: ["13_write_transaction_walkthrough"]
prerequisites: ["13_write_transaction_walkthrough"]
visualIds: ["wf-axi-read-channels"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

A read transaction only utilizes two channels (AR and R). Let's walk through a 3-beat read burst.

![wf-axi-read-channels](visual:wf-axi-read-channels)

### Cycle-by-Cycle Analysis

*   **Cycle 1:**
    *   **AR Channel:** The master drives `ARADDR = 0x200` and asserts `ARVALID`. The slave is ready (`ARREADY = 1`). The address phase completes.
*   **Cycle 2:**
    *   **R Channel:** The slave requires a cycle to fetch the data from memory. It keeps `RVALID` LOW. The master is already waiting (`RREADY = 1`), but no data transfers.
*   **Cycle 3:**
    *   **R Channel:** The slave retrieves the first piece of data (`D0`), drives it onto `RDATA`, drives `RRESP = OKAY`, and asserts `RVALID`. The master accepts it.
*   **Cycle 4:**
    *   **R Channel:** The slave retrieves the second piece of data (`D1`) and transfers it.
*   **Cycle 5:**
    *   **R Channel:** The slave retrieves the third and final piece of data (`D2`). Because this is the end of the burst requested by the master, the slave **must assert `RLAST = 1`**. The master accepts it. The transaction is complete.

### Why is RLAST important?
In AHB, the master drives `HTRANS` on every single cycle to tell the slave whether a burst is continuing or ending. In AXI, the master sends the address *once* (specifying `ARLEN=2` to request 3 beats) and then just waits. 

The master relies on the slave to assert `RLAST` on the 3rd beat so the master's internal state machine knows to stop expecting data and close out the transaction tracking for that `ARID`. If a slave has a bug and forgets to assert `RLAST`, the master will hang forever waiting for the end of the burst!
