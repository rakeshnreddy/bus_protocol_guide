---
id: "09_read_data_channel"
title: "The Read Data Channel (R)"
summary: "How the slave returns data and status to the master."
protocol: "axi"
tier: "1"
level: "intermediate"
order: 9
tags: ["axi", "signals", "read"]
relatedLessons: ["06_write_data_channel", "07_write_response_channel"]
prerequisites: ["08_read_address_channel"]
visualIds: ["wf-axi-read-channels"]
exerciseIds: []
glossaryTerms: ["RDATA", "RRESP", "RLAST", "RID", "RVALID", "RREADY"]
checklistIds: []
---

Unlike a write transaction (which splits the data and the response into two separate channels), a read transaction combines the data payload and the status response onto a single channel: the Read Data (R) channel.

This channel flows Slave -> Master. All signals begin with the prefix `R`.

## Handshake Signals

*   **`RVALID`** (Slave -> Master): The slave drives this HIGH when it is providing valid read data.
*   **`RREADY`** (Master -> Slave): The master drives this HIGH when it can accept the read data.

## Data and Control Signals

*   **`RDATA`** (Read Data): The requested payload.
*   **`RLAST`** (Read Last): The slave asserts this HIGH during the final data beat of the read burst. This allows the master to know that the transaction is complete and it can free up internal buffer space.
*   **`RID`** (Read ID): The ID tag matching the original `ARID` from the Read Address channel. This allows the master to correlate returning data to the correct outstanding read request if multiple reads complete out of order.

The waveform below shows all of those signals together. Inspect the two-cycle stall to see that the slave, as the R-channel source, holds the entire payload stable until the master raises `RREADY`.

![AXI4 read waveform showing AR acceptance, stable R payload under backpressure, and final-beat error status](visual:wf-axi-read-channels)

## Response Signals

*   **`RRESP`** (Read Response): A 2-bit status code indicating success or failure. 
    *   Unlike the write response (which happens once at the end of the transaction), **`RRESP` is provided alongside every single beat of data**.
    *   Normally, beats return `OKAY` (0b00). If a beat reports `SLVERR` or `DECERR`, AXI still requires the slave to complete the configured number of transfers. `RRESP` describes each beat; the protocol does not require every later beat to repeat the same error.

*Notice what is missing: There is no `RSTRB` (Read Strobe). The physical `RDATA` bus always has its configured full width, but for a narrow read only the byte lanes selected by the address and transfer size carry the requested data. The master extracts those lanes using the original address and `ARSIZE`.*
