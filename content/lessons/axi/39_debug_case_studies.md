---
id: "39_debug_case_studies"
tier: "3"
level: "advanced"
protocol: "axi"
title: "Debug Case Studies"
section: "G"
order: 39
exerciseIds: []
summary: "Real-world debug case studies for troubleshooting AXI systems."
tags:
  - axi
  - debug
  - waveforms
prerequisites: []
relatedLessons: []
visualIds: []
glossaryTerms: []
checklistIds: []
---

# Debug Case Studies

Let's walk through two classic AXI debugging scenarios using the waveform topologies you learned earlier.

## Case Study 1: The Infinite Stall

<img src="visual:wf-axi-deadlock" alt="Waveform showing a circular deadlock between master and slave" />

**The Symptom:**
The simulation hangs at 50us. The waveform shows the W channel has finished sending data, but the B channel response never completes.

**The Debug Flow:**
1. Look at the B channel. `BVALID` is HIGH, but `BREADY` is LOW. The slave is trying to respond, but the master isn't listening.
2. Look at the AW channel. `AWVALID` is HIGH, but `AWREADY` is LOW. The master is trying to send a new address, but the slave isn't listening.
3. *Why?* Check the RTL code. The master designer wrote: `assign BREADY = AWREADY;` (Don't accept a response until the next address is accepted). The slave designer wrote: `assign AWREADY = BREADY;` (Don't accept a new address until the old response is cleared).

**The Root Cause:**
Circular combinatorial logic dependency. This is a fatal protocol violation.

## Case Study 2: The Scrambled Read

<img src="visual:wf-axi-out-of-order" alt="Waveform showing out of order read completion" />

**The Symptom:**
The testbench reports a data mismatch on a read transaction. It expected `0xAAAA` but received `0xBBBB`.

**The Debug Flow:**
1. Check the timeline. The master issues `ARADDR=0x100` (`ARID=0`).
2. The master issues `ARADDR=0x200` (`ARID=1`).
3. The slave returns data `0xBBBB`. Look closely at the `RID` on this data transfer. It is `RID=1`.
4. The testbench complains because it expected the data for `0x100` (`0xAAAA`). 

**The Root Cause:**
The slave completed the transactions out of order. This is perfectly legal in AXI because the IDs were different (`ARID=0` vs `ARID=1`). The bug is not in the RTL; the bug is in the testbench scoreboard, which is assuming in-order completion regardless of ID.
