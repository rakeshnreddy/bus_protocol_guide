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
visualIds: ["wf-ahb-review-error"]
exerciseIds: ["lab-ahb-error-completion"]
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
   - The owning subordinate drives `HRESP = ERROR` (1).
   - It drives `HREADYOUT = 0`; the manager observes global `HREADY = 0`.
   - *Why?* This gives the master one cycle to realize an error occurred. Because `HREADY` is low, the pipelined *next* address is stalled.

2. **Cycle 2 (Error Completion):**
   - The subordinate keeps `HRESP = ERROR` (1).
   - It drives `HREADYOUT = 1`; global `HREADY = 1` completes the failed transfer.
   - *Why?* Driving `HREADY` high officially terminates the failed Data Phase. The extra cycle gives the master time to change `HTRANS` to `IDLE` if it chooses to cancel the pipelined request that was already broadcast.

Inspect which address owns both ERROR cycles. The following address is visible in the pipeline, but it is not the transfer being reported as failed.

![AHB waveform showing the first stalled ERROR cycle, completing ERROR cycle, and optional cancellation of the following address](visual:wf-ahb-review-error)

## Master Responsibility

Ordinary wait cycles can precede ERROR1, but those cycles keep `HRESP=OKAY`; the two ERROR cycles begin only when `HRESP` changes to ERROR. During ERROR1, the normal pending-transfer stability rule has a precise exception: the manager may cancel the remaining transfers by changing the following transfer to `HTRANS=IDLE`. The specification also permits it to continue legal following work. A verification environment must check the implemented documented policy without confusing the visible following address with the data owner that returned the error.
