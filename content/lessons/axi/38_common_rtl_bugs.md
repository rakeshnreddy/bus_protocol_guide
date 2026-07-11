---
id: "38_common_rtl_bugs"
tier: "3"
level: "advanced"
protocol: "axi"
title: "Common RTL and Interconnect Bugs"
section: "G"
order: 38
exerciseIds: []
---

# Common RTL and Interconnect Bugs

When verifying AXI systems, you will see the same bugs over and over. Knowing what these look like saves days of debugging.

## 1. The "Address-Based" Scoreboard
**Symptom:** The testbench flags a data mismatch on a read, but the waveform shows the correct data returning on the bus.
**Root Cause:** The verification engineer wrote the scoreboard to expect read data in the order the addresses were issued. But the RTL returned the reads out of order (using different IDs). The data is correct for its ID, but the scoreboard checked it against the wrong address.

## 2. Early WLAST Assertion
**Symptom:** An interconnect state machine locks up permanently.
**Root Cause:** The master asserted `WLAST` on beat 3 of a 4-beat burst. The interconnect routed the 3 beats, saw `WLAST`, closed the connection, and moved to the next transaction. But the master then sends the 4th beat. The interconnect drops it or routes it as garbage to a new transaction.

## 3. QoS Starvation
**Symptom:** A low-priority bulk DMA transfer times out after 10,000 cycles.
**Root Cause:** The interconnect arbiter prioritizes transactions based on `AxQOS`. A high-priority CPU is constantly issuing traffic. The arbiter never grants the low-priority DMA access to the crossbar, causing it to starve and eventually time out.

## 4. Bridge ID Truncation
**Symptom:** A multi-master system returns data to the wrong master.
**Root Cause:** An AXI-to-AXI bridge between two subsystems strips the upper bits of the `ARID` to save routing area. When the responses come back, the IDs collide, and the bridge routes Master A's data back to Master B.

## 5. Circular Backpressure Deadlock
**Symptom:** The entire SoC freezes.
**Root Cause:** The master won't send `BREADY` until it sends its next `AWVALID`. The slave won't accept `AWVALID` until it gets rid of its current `BVALID`. Neither can move. Deadlock.

---

## AXI Spec Rule Explorer

For a quick reference of the formal specification rules violated by the bugs above, you can explore the searchable index below. This tool extracts the "shall/must" rules and maps them directly back to these common failure patterns.

![Spec Rules](visual:spec-rule-explorer-axi)
