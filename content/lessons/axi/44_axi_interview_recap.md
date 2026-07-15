---
id: "44_axi_interview_recap"
tier: "3"
level: "advanced"
protocol: "axi"
title: "AXI Interview and Work-Use Recap"
section: "H"
order: 44
exerciseIds: []
summary: "A recap of essential AXI concepts for technical interviews."
tags:
  - axi
  - interview
  - review
prerequisites: []
relatedLessons: []
visualIds: ["sig-axi-senior-recap"]
glossaryTerms: []
checklistIds: []
---

# AXI Interview and Work-Use Recap

Congratulations. You have completed the AXI curriculum. The goal of this recap is to turn the rules into concise answers that remain accurate when an interviewer or waveform adds backpressure, multiple IDs, or an implementation-specific policy.

Here is what you need to remember for your next interview, or your next chip tapeout:

## For Interviews

1. **How is AXI different from AHB?**
   "AXI has five independent, decoupled channels. AHB is a shared bus with a strict pipeline. AXI allows out-of-order completion based on transaction IDs; AHB must return data in the exact order it was requested."

2. **What is the golden rule of AXI ordering?**
   "Read responses sharing one ID and write responses sharing one ID preserve request order. Different IDs permit response reordering when no additional memory, barrier, or system constraint applies. Matching read and write ID values do not by themselves create cross-channel order."

3. **What is a 4KB boundary and why does AXI care?**
   "A burst cannot cross a 4KB address boundary. This keeps one burst within one decode target and limits the address increments a subordinate must generate."

4. **How does an AXI write work?**
   "The manager issues the address on AW and streams `AWLEN+1` data transfers on W, with `WLAST` on the final transfer. AW and W handshake independently. In AXI4, the subordinate returns one B response only after accepting the AW request and the final W transfer."

Use the recall map to add the qualification and verification evidence behind each short answer.

![AXI senior DV recall map covering handshakes, writes, IDs, burst math, liveness, and signoff evidence](visual:sig-axi-senior-recap)

## For Daily Verification Work

1. **Your Scoreboard:** Use `BID` or `RID` to select a per-ID issue-order queue, then compare the full stored request context, including address and expected data. Support different-ID reordering and same-ID reuse.
2. **Your Assertions:** Check exact `WLAST`/`RLAST` timing, source-side `VALID` independence, and complete payload stability while `VALID=1` and `READY=0`.
3. **Your Stimulus:** Don't just run linear traffic. Fill the queues, reuse IDs to exercise required per-ID response order, use different IDs to permit and observe reordering, and randomize `READY` backpressure to catch FIFO edge cases.

You are now ready to verify the most complex interconnects in the industry.
