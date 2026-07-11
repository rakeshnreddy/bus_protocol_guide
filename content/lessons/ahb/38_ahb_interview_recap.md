---
id: "38_ahb_interview_recap"
title: "AHB Interview & Work Recap"
summary: "The most commonly tested concepts in senior DV interviews and daily work."
protocol: "ahb"
tier: "1"
level: "expert"
order: 38
tags: ["ahb", "review", "interview"]
relatedLessons: []
prerequisites: ["37_ahb_waveform_review"]
visualIds: []
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

Congratulations on completing the AHB Curriculum! Before moving on to AXI, let's tie together the most important concepts that you will absolutely need in technical interviews and in your daily work as a Verification Engineer.

## The "Big Three" Interview Topics

If you claim AHB experience on your resume, expect to be grilled on these three areas:

1. **Pipelining and HREADY:** 
   - *Question:* "If a slave drives `HREADY=0`, what must the master do with the address bus?" 
   - *Answer:* The master must hold the address bus entirely stable. The master is already driving the address for the *next* transfer (due to pipelining), and it cannot advance until the current transfer finishes.
2. **Two-Cycle Errors:**
   - *Question:* "Why does an AHB ERROR response take two cycles?"
   - *Answer:* Because the bus is pipelined! By the time the slave realizes the current data phase has an error, the master has already broadcast the address for the *next* transfer. The first cycle of the error (with `HREADY=0`) stalls the pipeline. The second cycle (with `HREADY=1`) terminates the bad transfer and gives the master a chance to drive `HTRANS=IDLE` to cancel the pending next transfer.
3. **Bursts and Boundaries:**
   - *Question:* "What happens if an INCR4 burst crosses a 1KB boundary?"
   - *Answer:* It is strictly illegal in AHB for any burst to cross a 1KB boundary. The master must split the transfer into two separate bursts before reaching the boundary. This simplifies slave decoding logic.

## Daily Work Takeaways

When you sit down to write a testbench tomorrow:
- **Always randomize `HREADY`.** A testbench with zero wait states will find zero bugs.
- **Never trust combinatorial `HREADYOUT`.** Look for loops in your schematic or synthesis logs.
- **Understand the system topology.** Are you verifying an AHB5 master, or an AHB-Lite slave connected to a bridge? Your verification strategy (and your covergroups) must adapt to the presence (or absence) of arbiters, exclusive monitors, and TrustZone domains.

You are now ready to tackle Phase 5: AXI!
