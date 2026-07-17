---
id: "39_debug_case_studies"
tier: "3"
level: "advanced"
protocol: "axi"
title: "Debug Case Studies"
section: "G"
order: 39
exerciseIds: ["lab-axi-progress-classification"]
summary: "Real-world debug case studies for troubleshooting AXI systems."
tags:
  - axi
  - debug
  - waveforms
prerequisites: []
relatedLessons: []
visualIds: ["wf-axi-deadlock", "wf-axi-out-of-order"]
glossaryTerms: []
checklistIds: []
---

# Debug Case Studies

Let's walk through two classic AXI debugging scenarios using the waveform topologies you learned earlier.

## Case Study 1: The Infinite Stall

![Waveform showing a circular deadlock between master and slave](visual:wf-axi-deadlock)

**The Symptom:**
The simulation hangs at 50us. The waveform shows the W channel has finished sending data, but the B channel response never completes.

**The Debug Flow:**
1. Look at the B channel. `BVALID` is HIGH, but `BREADY` is LOW. The subordinate is holding a response while the manager's destination policy refuses it.
2. Look at the W channel. `WVALID` is HIGH, but `WREADY` is LOW. The manager is holding write data while the subordinate's destination policy refuses it.
3. *Why?* The manager policy waits to raise `BREADY` until W data is accepted, while the subordinate policy waits to raise `WREADY` until the pending B response is accepted. The dependency graph is circular.

**The Root Cause:**
Circular cross-channel progress policy. The shown VALID sources obey their channel safety rules, so the trace is a system-level liveness failure rather than automatically a single-interface safety violation. If either READY output is driven through a direct combinational path from an interface input, that construction separately violates AXI's no-combinational-input-to-output-path rule.

## Case Study 2: The Scrambled Read

![Waveform showing out-of-order read completion](visual:wf-axi-out-of-order)

**The Symptom:**
The testbench reports a data mismatch on a read transaction. Its single global queue expected beat `A0`, but the interface returned beat `B0` with `RID=1`.

**The Debug Flow:**
1. Check the timeline. The master issues transaction A at `ARADDR=0x1000` (`ARID=0`).
2. The master issues transaction B at `ARADDR=0x2000` (`ARID=1`).
3. The subordinate returns beats `B0` and `B1` first. Their `RID=1` associates them with transaction B, and `RLAST=1` on `B1` completes that response.
4. The flawed testbench complains on `B0` because its one global queue still expects transaction A's first beat, `A0`. The later `A0` and `A1` transfers carry `RID=0` and complete A legally.

**The Root Cause:**
The subordinate completed the responses out of order. This response order is permitted because the IDs differ (`ARID=0` vs `ARID=1`) and no additional system ordering constraint is shown. The bug is in the testbench scoreboard, which used one global issue queue instead of selecting the expected per-ID queue with `RID`.
