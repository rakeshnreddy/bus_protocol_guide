---
id: "34_debug_case_studies"
title: "Debug Case Studies"
summary: "Visual walkthroughs of common AHB protocol violations."
protocol: "ahb"
tier: "1"
level: "expert"
order: 34
tags: ["ahb", "verification", "debug"]
relatedLessons: []
prerequisites: ["33_common_rtl_bugs"]
visualIds: ["wf-ahb-bug-wait-state", "wf-ahb-bug-decoder-glitch"]
exerciseIds: ["lab-ahb-sampled-select"]
glossaryTerms: []
checklistIds: []
---

Let's look at two of the bugs discussed in the previous lesson as they appear on a waveform. Being able to spot these instantly is the mark of a senior DV engineer.

## Case Study 1: Wait State Data Loss

Look at the waveform below. 
- **The Symptom:** A testbench scoreboard reports a mismatch for the data written to address `0x14`.
- **The Root Cause:** In Cycle 3, the slave drives `HREADY = 0` to stall the data phase for address `0x14`. In Cycle 4, the master incorrectly advances `HWDATA` to the value for `0x18` even though data owner `0x14` is only now completing.
- **The Fix:** The master RTL must be updated to condition its internal `HWDATA` pipeline register advance on `HREADY == 1`.

![AHB debug waveform marking the first cycle where stalled write data advances to the wrong owner](visual:wf-ahb-bug-wait-state)

## Case Study 2: Decoder Glitch

Look at the waveform below.
- **The Symptom:** Slave 2 reports a spurious side effect even though the accepted address selects Slave 3 (`0x30`).
- **The Root Cause:** During the address transition into Cycle 2, combinational `HSEL_S2_RAW` briefly pulses before the decoder settles on Slave 3. An asynchronous latch or clock gate treats that pulse as a transfer even though `HSEL_S2_SAMPLED` is 0 at the accepting edge.
- **The Fix:** Protocol-facing slave state must only sample `HSEL`, address, and control at the rising edge where `HREADY` is high. The raw transient is not an accepted Slave 2 transfer.

![AHB decoder waveform distinguishing a raw within-cycle select pulse from the synchronously accepted HSEL value](visual:wf-ahb-bug-decoder-glitch)
