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

A write transaction is not complete at the master interface until the slave returns its completion status on the Write Response (B) channel. The channel is conventionally named `B`; the protocol does not define the letter as an abbreviation for “Buffer.”

This channel flows in the opposite direction: Slave -> Master. All signals begin with the prefix `B`.

## Handshake Signals

*   **`BVALID`** (Slave -> Master): The slave drives this HIGH when it has a valid response to send. Its assertion must not depend on `BREADY`. *In AXI4, the slave must not assert `BVALID` until it has accepted both the AW request and the final W beat with `WLAST=1`.*
*   **`BREADY`** (Master -> Slave): The master drives this HIGH when it is ready to accept the response.

## Response Signals

*   **`BRESP`** (Write Response): A 2-bit status code indicating the outcome of the entire write transaction.
    *   `0b00` (OKAY): Normal access success.
    *   `0b01` (EXOKAY): Successful exclusive access. An exclusive write that does not succeed returns `OKAY`, not `EXOKAY`, and does not update the addressed location.
    *   `0b10` (SLVERR): Slave error (e.g., trying to write to a read-only register).
    *   `0b11` (DECERR): Decode error (no slave exists at that address).
*   **`BID`** (Response ID): The ID tag matching the original `AWID` from the Write Address channel.

If `BVALID=1` while `BREADY=0`, the slave must hold `BVALID` and the entire B payload—`BID`, `BRESP`, and `BUSER` when present—stable. Responses with the same ID are returned in request order; different IDs have no relative response-order guarantee.

### Why is BID necessary?

Because AXI allows multiple outstanding transactions, a master might issue Write Address 0xA, and then Write Address 0xB. If the requests use different IDs, the slave is allowed to complete Write 0xB *before* Write 0xA while preserving the required ordering within each ID stream.

When the master receives a response on the B channel, it uses the `BID` tag to correlate the success/failure back to the original request.

![Two AXI4 writes sending data in address order but returning different-ID responses out of order](visual:wf-axi-ids-correlation)

**Senior DV Tip:** A master that never accepts B responses can exhaust the finite response or outstanding capacity on affected paths. The resulting scope—one ID, one endpoint, one route, or a wider subsystem—depends on the implementation. Verify the configured service contract instead of claiming every such stall halts the entire system.
