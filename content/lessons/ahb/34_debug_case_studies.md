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
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

Let's look at two of the bugs discussed in the previous lesson as they appear on a waveform. Being able to spot these instantly is the mark of a senior DV engineer.

## Case Study 1: Wait State Data Loss

Look at the waveform below. 
- **The Symptom:** A testbench scoreboard reports a mismatch for the data written to address `0x14`.
- **The Root Cause:** In Cycle 2, the slave drives `HREADY = 0` to stall the data phase for address `0x14`. However, in Cycle 3, the master advances its `HWDATA` bus to drive the data for `0x18`. It dropped `D(0x14)`!
- **The Fix:** The master RTL must be updated to condition its internal `HWDATA` pipeline register advance on `HREADY == 1`.

![wf-ahb-bug-wait-state](visual:wf-ahb-bug-wait-state)

## Case Study 2: Decoder Glitch

Look at the waveform below.
- **The Symptom:** Slave 2 reports a spurious write to its memory, even though the master was targeting Slave 3 (Address `0x30`).
- **The Root Cause:** During Cycle 1, the address bus transitions from `0x10` (Slave 1) to `0x20` (Slave 2) to `0x30` (Slave 3). Because the decoder is combinatorial, `HSEL_S2` glitches high momentarily before settling to 0. 
- **The Fix:** Slaves must **never** use `HSEL` asynchronously. They must only sample `HSEL` on the rising edge of `HCLK`. By the time the clock edge arrives in Cycle 2, `HSEL_S2` has settled to `0`, and the glitch is safely ignored.

![wf-ahb-bug-decoder-glitch](visual:wf-ahb-bug-decoder-glitch)
