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
exerciseIds: ["lab-axi-stalled-read-payload"]
glossaryTerms: []
checklistIds: []
---

A read transaction only utilizes two channels (AR and R). Let's walk through a 3-beat read burst.

![Three-beat AXI4 read with an address stall, read-data backpressure, and a final error response](visual:wf-axi-read-channels)

### Cycle-by-Cycle Analysis

*   **Cycle 2:**
    *   **AR Channel:** The master offers `ARADDR = 0x200`, `ARID = 5`, and `ARLEN = 2`, but `ARREADY` is LOW. The entire AR payload must remain stable.
*   **Cycle 3:**
    *   **AR Channel:** `ARREADY` becomes HIGH and accepts the read request. The slave can begin returning data only after this handshake.
*   **Cycle 4:**
    *   **R Channel:** The first beat (`D0`) transfers with `RID = 5` and `RRESP = OKAY`.
*   **Cycles 5–6:**
    *   **R Channel:** The slave offers the second beat (`D1`), but the master deasserts `RREADY`. `RVALID`, `RID`, `RDATA`, `RRESP`, and `RLAST` all remain stable through the stall.
*   **Cycle 7:**
    *   **R Channel:** `RREADY` returns HIGH and the second beat transfers.
*   **Cycle 8:**
    *   **R Channel:** The third and final beat (`D2`) transfers with `RLAST = 1` and `RRESP = SLVERR`. A response qualifies every R beat, and an error does not shorten the burst declared by `ARLEN`.

### Why is RLAST important?
In AHB, the master drives `HTRANS` on every single cycle to tell the slave whether a burst is continuing or ending. In AXI, the master sends the address *once* (specifying `ARLEN=2` to request 3 beats) and then just waits. 

The master relies on the slave to assert `RLAST` on the 3rd beat so its tracking logic can close the transaction for that `RID`. If `RLAST` does not agree with `ARLEN + 1`, the slave has violated the protocol. A monitor must flag the mismatching accepted beat; the receiving implementation's recovery behavior is not defined by AXI and must not be assumed to be a particular hang or reset sequence.
