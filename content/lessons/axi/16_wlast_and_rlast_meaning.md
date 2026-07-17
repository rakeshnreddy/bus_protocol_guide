---
id: "16_wlast_and_rlast_meaning"
title: "The Meaning of WLAST and RLAST"
summary: "Why explicit 'end of burst' markers exist and what happens when they fail."
protocol: "axi"
tier: "1"
level: "intermediate"
order: 16
tags: ["axi", "burst", "signals"]
relatedLessons: ["15_burst_structure_beat_progression"]
prerequisites: ["15_burst_structure_beat_progression"]
visualIds: ["wf-axi-debug-wlast"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

As we saw in the walkthroughs, the master must assert `WLAST` on the final beat of a write burst, and the slave must assert `RLAST` on the final beat of a read burst.

If `AWLEN` and `ARLEN` already defined exactly how many beats were in the burst, why do we need a separate `LAST` signal? Can't the receiver just count the beats?

## The Role of LAST Signals

The length fields and `LAST` signals carry related information, but both are protocol obligations. The sender of each data channel places the end marker beside the payload: the write-data source drives `WLAST`, and the read-data source drives `RLAST`.

1.  **Data-channel boundary:** `LAST` travels on the same channel as the final payload, so buffering and routing logic can carry the transaction boundary with the data.
2.  **Cross-checkable contract:** A protocol monitor can compare accepted beat count against `AxLEN + 1` and detect an early or missing end marker.
3.  **No early termination:** AXI3 and AXI4 do not support terminating a burst early. Every transfer declared by the length field must still be completed.

## What Happens if it Breaks?

If a master sends an `AWLEN` of 3 (expecting 4 beats) but asserts `WLAST` on the 3rd beat, this is a **fatal protocol violation**. 

The AXI specification states that early termination is not supported: no component can use the early `WLAST` to reduce the declared number of transfers. The same mismatch occurs if four beats transfer but the final one lacks `WLAST`. These are protocol violations; how a particular receiver reports or recovers from malformed input is implementation-dependent.

![Four-beat AXI4 write with WLAST asserted one beat early and missing on the declared final beat](visual:wf-axi-debug-wlast)

**Senior DV Tip:** Count only accepted data transfers. Assert that `WLAST` is HIGH if and only if `WVALID && WREADY` accepts beat `AWLEN + 1`; apply the equivalent check to `RLAST`, `RVALID && RREADY`, and `ARLEN`. A stalled LAST remains asserted with the complete payload stable until acceptance.

The checker must also use the right association model. AXI3 has `WID` and permits revision-specific write-data interleaving; AXI4 removes `WID`, so complete W bursts follow AW order even when some W transfers were accepted before their AW request. A malformed LAST never changes the declared beat count, and any recovery behavior is implementation-defined.
