---
id: "08_data_and_response"
title: "Data and Response (HWDATA, HRDATA, HREADY, HRESP)"
summary: "How payload actually moves, the critical role of HREADY for backpressure, and how errors are reported."
protocol: "ahb"
tier: "1"
level: "beginner"
order: 8
tags: ["ahb", "signals", "data", "hready"]
relatedLessons: []
prerequisites: ["07_burst_and_size"]
visualIds: ["wf-ahb-wait-state"]
exerciseIds: []
glossaryTerms: ["HWDATA", "HRDATA", "HREADY", "HREADYOUT", "HRESP"]
checklistIds: []
---

We've discussed how the master issues the *Command* (Address, Control, Size, Burst). Now, we must look at how the slave provides the *Response* and how the actual data is moved.

## The Data Buses

Unlike older bi-directional buses, AHB features dedicated, unidirectional buses for reading and writing data.
- **[glossary:HWDATA] (Write Data):** Driven by the Master. Contains the payload for a Write transfer.
- **[glossary:HRDATA] (Read Data):** Driven by the Slave. Contains the payload for a Read transfer.

## Backpressure and Wait States: HREADY

The most important signal controlled by the slave is **[glossary:HREADY]** (sometimes split into `HREADYOUT` from the slave and `HREADY` as a global signal into the master).

When a master sends a request (e.g., `HTRANS = NONSEQ`), the slave might need time to fetch the data from memory. It tells the master to wait by driving `HREADY` to `0`. 
This is called inserting a **Wait State**.

![wf-ahb-wait-state](visual:wf-ahb-wait-state)

- **Rule 1:** When `HREADY` is `0`, the current Data Phase is extended. The data on `HRDATA` (if reading) is not yet valid.
- **Rule 2:** Because AHB uses a pipelined architecture (which we will cover in depth in Section D: Timing and Pipelining), inserting a wait state also stalls the *next* Address Phase! For now, just know that if the slave says "wait" (`HREADY` is `0`), the master must freeze and hold its `HADDR` and `HTRANS` perfectly stable.
- **DV Check:** A massive source of bugs is masters improperly changing `HADDR` or `HTRANS` while `HREADY` is low.

## HRESP (Response)

When the slave finally finishes the transfer (drives `HREADY = 1`), it must provide a response status via **[glossary:HRESP]**.
- **`0` (OKAY):** The transfer was successful.
- **`1` (ERROR):** The transfer failed (e.g., writing to a read-only register, or an unmapped address).

Note: In the original AMBA 2.0 AHB, `HRESP` was a 2-bit signal to support `SPLIT` and `RETRY`. In AHB-Lite and AHB5, it is simplified to a 1-bit signal (`OKAY`/`ERROR`).
