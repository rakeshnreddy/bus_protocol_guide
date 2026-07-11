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
visualIds: []
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

## Response Signals

*   **`RRESP`** (Read Response): A 2-bit status code indicating success or failure. 
    *   Unlike the write response (which happens once at the end of the transaction), **`RRESP` is provided alongside every single beat of data**.
    *   Normally, every beat returns `OKAY` (0b00). If an error occurs midway through a burst (e.g., crossing into a protected memory region), the slave will start returning `SLVERR` or `DECERR` on the remaining beats.

*Notice what is missing: There is no `RSTRB` (Read Strobe). A read always returns the full data bus width. If the master only wanted a single byte, it is the master's responsibility to extract that byte from the full `RDATA` word based on the lower bits of the original address.*
