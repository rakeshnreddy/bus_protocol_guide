---
id: "38_common_rtl_bugs"
tier: "3"
level: "advanced"
protocol: "axi"
title: "Common RTL and Interconnect Bugs"
section: "G"
order: 38
exerciseIds: []
summary: "Analysis of common RTL and interconnect bugs encountered in AXI designs."
tags:
  - axi
  - rtl-bugs
  - debug
prerequisites: []
relatedLessons: []
visualIds: ["wf-axi-out-of-order", "wf-axi-debug-wlast", "wf-axi-deadlock", "spec-rule-explorer-axi"]
glossaryTerms: []
checklistIds: []
---

# Common RTL and Interconnect Bugs

When verifying AXI systems, you will see the same bugs over and over. Knowing what these look like saves days of debugging.

## 1. The "Address-Based" Scoreboard
**Symptom:** The testbench flags a data mismatch on a read, but the waveform shows the correct data returning on the bus.
**Root Cause:** The verification engineer wrote the scoreboard to expect read data in the order the addresses were issued. But the RTL returned the reads out of order (using different IDs). The data is correct for its ID, but the scoreboard checked it against the wrong address.

![Different-ID AXI reads completing out of issue order while RID preserves transaction ownership](visual:wf-axi-out-of-order)

## 2. Early WLAST Assertion
**Symptom:** An interconnect state machine locks up permanently.
**Root Cause:** The manager asserted `WLAST` on beat 3 of a 4-beat burst. That first mismatching accepted edge is the protocol error. Whether a particular interconnect then stalls, reports an error, drops data, or corrupts internal state is implementation-dependent rather than AXI-defined recovery.

![AXI4 write burst showing early WLAST and the missing final WLAST against AWLEN](visual:wf-axi-debug-wlast)

## 3. QoS Starvation
**Symptom:** A low-priority bulk DMA transfer times out after 10,000 cycles.
**Root Cause:** The implemented interconnect policy gives continuous higher-QoS traffic unbounded preference. AXI recommends interpreting a higher `AxQOS` value as higher priority but does not mandate one scheduling or starvation-prevention algorithm; the missing fairness/service bound is a product-policy bug.

## 4. Bridge ID Truncation
**Symptom:** A multi-master system returns data to the wrong master.
**Root Cause:** An AXI-to-AXI bridge narrows `ARID` without remapping, serializing colliding transactions, or retaining source metadata. ID narrowing itself can be legal; losing the original ordering stream or response owner is the bug.

## 5. Circular Backpressure Deadlock
**Symptom:** The entire SoC freezes.
**Root Cause:** The manager withholds `BREADY` until a pending W transfer is accepted, while the subordinate withholds `WREADY` until its pending B response is accepted. Both sources can hold VALID and payload correctly, yet the combined destination policies make no progress. This is an integration liveness failure; an actual combinational input-to-output loop would additionally violate the AXI interface rule.

![AXI W and B channels stalled by circular destination policies while both VALID sources remain stable](visual:wf-axi-deadlock)

---

## AXI Spec Rule Explorer

For a quick reference of the formal specification rules violated by the bugs above, you can explore the searchable index below. This tool extracts the "shall/must" rules and maps them directly back to these common failure patterns.

![Searchable AXI specification rules mapped to common ordering, burst, QoS, ID-routing, and liveness bugs](visual:spec-rule-explorer-axi)
