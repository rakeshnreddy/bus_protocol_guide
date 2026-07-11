---
id: "24_error_responses"
title: "Error Responses"
summary: "How a slave signals that a transaction has failed using the two-cycle ERROR protocol."
protocol: "ahb"
tier: "1"
level: "advanced"
order: 24
tags: ["ahb", "advanced", "error", "hresp"]
relatedLessons: []
prerequisites: ["15_address_data_phase"]
visualIds: []
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

What happens when a master tries to read an unmapped address, or write to a Read-Only memory? The slave must have a way to tell the master the transaction failed. This is done via the **`HRESP`** (Response) signal.

In AHB-Lite and AHB5, `HRESP` is a 1-bit signal:
- `0`: **OKAY** (Success)
- `1`: **ERROR** (Failure)

## The Two-Cycle ERROR Protocol

Signaling an `ERROR` is not as simple as pulling `HRESP` high for one cycle. Because AHB is pipelined, an error on the *current* Data Phase means the master has already broadcast the Address Phase for the *next* transfer!

To handle this cleanly, the AHB specification requires `ERROR` responses to take exactly **two clock cycles**:

1. **Cycle 1 (Error Signal):**
   - The slave drives `HRESP = ERROR` (1).
   - The slave drives `HREADY = 0` (Wait state).
   - *Why?* This gives the master one cycle to realize an error occurred. Because `HREADY` is low, the pipelined *next* address is stalled.

2. **Cycle 2 (Error Completion):**
   - The slave keeps `HRESP = ERROR` (1).
   - The slave drives `HREADY = 1` (Ready).
   - *Why?* Driving `HREADY` high officially terminates the failed Data Phase. The master uses this cycle to change `HTRANS` to `IDLE` for the *next* transfer, effectively canceling the pipelined request that was in flight during the error.

## Master Responsibility

When a master receives an `ERROR` response, it is strictly required to cancel any pending sequence. If it was in the middle of a 4-beat burst and beat 2 errors out, the master must transition `HTRANS` to `IDLE` and abort the rest of the burst.
