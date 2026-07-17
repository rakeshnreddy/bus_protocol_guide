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
visualIds: ["wf-ahb-read-write-response", "wf-ahb-wait-state"]
exerciseIds: []
glossaryTerms: ["HWDATA", "HRDATA", "HREADY", "HREADYOUT", "HRESP"]
checklistIds: []
---

We've discussed how the master issues the *Command* (Address, Control, Size, Burst). Now, we must look at how the slave provides the *Response* and how the actual data is moved.

## The Data Buses

Unlike older bi-directional buses, AHB features dedicated, unidirectional buses for reading and writing data.
- **[glossary:HWDATA] (Write Data):** Driven by the Master. Contains the payload for a Write transfer.
- **[glossary:HRDATA] (Read Data):** Driven by the Slave. Contains the payload for a Read transfer.

The combined waveform distinguishes a successful read, a successful write, and an AHB-Lite ERROR completion. Follow the driver names in the signal labels and inspect the two error cycles separately.

![AHB read data, write data, wait-state, and two-cycle error response](visual:wf-ahb-read-write-response)

## Backpressure and Wait States: HREADY

Each subordinate drives **[glossary:HREADYOUT]** for its own data-phase transfer. The interconnect return mux combines the active data owner's output into global **[glossary:HREADY]**, which all managers and subordinates observe as the pipeline completion/advance signal.

When a manager sends a request (for example, `HTRANS=NONSEQ`), the selected subordinate might need time to fetch the data. During that transfer's data phase it requests a wait by driving its `HREADYOUT` LOW; the interconnect then presents global `HREADY` LOW.
This is called inserting a **Wait State**.

![AHB wait state showing HREADY low and the next address phase held stable](visual:wf-ahb-wait-state)

- **Rule 1:** When `HREADY` is `0`, the current Data Phase is extended. The data on `HRDATA` (if reading) is not yet valid.
- **Rule 2:** A pending valid address phase must retain `HTRANS`, `HADDR`, `HWRITE`, `HSIZE`, `HBURST`, `HPROT`, `HMASTLOCK`, and every enabled address attribute while global `HREADY` is LOW, subject to the defined IDLE, BUSY, and first-ERROR-cycle exceptions. Stalled `HWDATA` for a current write data phase also remains stable.
- **DV Check:** A massive source of bugs is masters improperly changing `HADDR` or `HTRANS` while `HREADY` is low.

## HRESP (Response)

When the owning subordinate finishes the transfer, it drives `HREADYOUT` HIGH and provides the response status via **[glossary:HRESP]**; the manager observes completion through global `HREADY`.
- **`0` (OKAY):** The transfer was successful.
- **`1` (ERROR):** The transfer failed (e.g., writing to a read-only register, or an unmapped address).

Note: In the original AMBA 2.0 AHB, `HRESP` was a 2-bit signal to support `SPLIT` and `RETRY`. In AHB-Lite and AHB5, it is simplified to a 1-bit signal (`OKAY`/`ERROR`).

Normal wait states keep `HRESP=OKAY`. An AHB-Lite/AHB5 `ERROR` response is a distinct two-cycle sequence: in ERROR1 the owning subordinate drives `HRESP=ERROR` with `HREADYOUT=LOW`; in ERROR2 it keeps `HRESP=ERROR` and drives `HREADYOUT=HIGH`, so global `HREADY` completes the transfer. `HRDATA`, `HRESP`, and `HREADYOUT` must be returned from the subordinate that owns the **current data phase**, not from the target decoded for the next visible address.
