---
id: "07_write_response_channel"
title: "The Write Response Channel (B)"
summary: "How the slave confirms the success or failure of a write."
protocol: "axi"
tier: "1"
level: "intermediate"
order: 7
tags: ["axi", "signals", "write"]
relatedLessons: ["05_write_address_channel", "06_write_data_channel"]
prerequisites: ["06_write_data_channel"]
visualIds: ["wf-axi-ids-correlation"]
exerciseIds: ["ex-axi-channels-1"]
glossaryTerms: ["BRESP", "BID", "BVALID", "BREADY"]
checklistIds: []
---

A write transaction is not complete until the slave confirms it has safely received the data. This confirmation happens on the Write Response (B) channel. (The 'B' stands for Buffer, referring to the write buffer response).

This channel flows in the opposite direction: Slave -> Master. All signals begin with the prefix `B`.

## Handshake Signals

*   **`BVALID`** (Slave -> Master): The slave drives this HIGH when it has a valid response to send. *Crucially, the slave must not assert `BVALID` until the master has sent the final data beat with `WLAST=1`.*
*   **`BREADY`** (Master -> Slave): The master drives this HIGH when it is ready to accept the response.

## Response Signals

*   **`BRESP`** (Write Response): A 2-bit status code indicating the outcome of the entire write transaction.
    *   `0b00` (OKAY): Normal access success.
    *   `0b01` (EXOKAY): Exclusive access success (used for atomics).
    *   `0b10` (SLVERR): Slave error (e.g., trying to write to a read-only register).
    *   `0b11` (DECERR): Decode error (no slave exists at that address).
*   **`BID`** (Response ID): The ID tag matching the original `AWID` from the Write Address channel. 

### Why is BID necessary?

Because AXI allows multiple outstanding transactions, a master might issue Write Address 0xA, and then Write Address 0xB. The slave is allowed to complete Write 0xB *before* Write 0xA! 

When the master receives a response on the B channel, it uses the `BID` tag to correlate the success/failure back to the original request.

![wf-axi-ids-correlation](visual:wf-axi-ids-correlation)

**Senior DV Tip:** A very common RTL bug is a master failing to assert `BREADY`. If the master fires off writes and forgets to accept the responses, the B channel will backpressure the slave, eventually bringing the entire system to a halt. Always verify that your masters can consume `BRESP`s!
