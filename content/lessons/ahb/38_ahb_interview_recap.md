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
visualIds: ["sig-ahb-senior-recap"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

Congratulations on completing the AHB Curriculum! Before moving on to AXI, let's tie together the most important concepts that you will absolutely need in technical interviews and in your daily work as a Verification Engineer.

## The "Big Three" Interview Topics

If you claim AHB experience on your resume, expect to be grilled on these three areas:

1. **Pipelining and HREADY:** 
   - *Question:* "If a slave drives `HREADY=0`, what must the master do with the address bus?" 
   - *Answer:* While a valid `NONSEQ` or `SEQ` address phase is pending, the master must hold its address and control information for that transfer until the stalled data phase finishes. A checker must still model the protocol-defined IDLE, BUSY, and first-ERROR-cycle exceptions rather than asserting blanket stability on every low-`HREADY` cycle.
2. **Two-Cycle Errors:**
   - *Question:* "Why does an AHB ERROR response take two cycles?"
   - *Answer:* Because the bus is pipelined. By the time the current data owner returns an error, a following address can be visible. ERROR1 uses `HRESP=ERROR`, `HREADYOUT=LOW`; ERROR2 uses `HRESP=ERROR`, `HREADYOUT=HIGH` and completes through global `HREADY`. ERROR1 permits the manager to cancel the following transfer with `IDLE`, but cancellation is not mandatory; retaining and continuing legal work is also permitted.
3. **Bursts and Boundaries:**
   - *Question:* "What happens if an INCR4 burst crosses a 1KB boundary?"
   - *Answer:* It is strictly illegal in AHB for any burst to cross a 1KB boundary. The master must split the transfer into two separate bursts before reaching the boundary. This simplifies slave decoding logic.

Use the recall map to rehearse the concise answer, the deeper reason, and the verification evidence expected from a senior engineer.

![Interactive senior DV recall map covering phase ownership, stalls, errors, burst math, AHB versions, and signoff evidence](visual:sig-ahb-senior-recap)

## Daily Work Takeaways

When you sit down to write a testbench tomorrow:
- **Vary `HREADY` deliberately.** Zero-wait tests prove basic throughput, but single, long, and irregular stalls expose phase-advance bugs that zero-wait-only testing misses.
- **Review the complete `HREADYOUT` return path.** Combinational behavior can be legal, but the assembled slave, mux, and feedback logic must not create a combinational loop; confirm this in the schematic, lint, and timing reports.
- **Understand the system topology.** Are you verifying an AHB5 master, or an AHB-Lite slave connected to a bridge? Your verification strategy (and your covergroups) must adapt to the presence (or absence) of arbiters, exclusive monitors, and TrustZone domains.

## Revision-Specific Recall

- **Identity and exclusives:** Original AHB uses arbiter-generated `HMASTER[3:0]`; optional AHB5 exclusives use configured `HMASTER` identity with `HEXCL`, monitor state, and `HEXOKAY`. A failed exclusive write does not update memory and can complete `HRESP=OKAY`, `HEXOKAY=0`.
- **RETRY versus SPLIT:** RETRY requires re-arbitration and reattempt without `HSPLITx`; SPLIT removes eligibility until the subordinate signals the manager on `HSPLITx`.
- **Lock versus security:** `HLOCKx`/`HMASTLOCK` retain an arbitration resource; `HNONSEC` is an optional security attribute whose enforcement point is system-configured. Neither mechanism substitutes for the other.
- **Bridge conservation:** An unbuffered bridge holding `HREADYOUT` LOW cannot accept another upstream beat; a buffered bridge must conserve accepted requests, data, and responses.
- **Formal scope:** Protocol safety properties are universal only within their revision/property preconditions. Bounded completion and fairness are configured service contracts with explicit assumptions, reset cancellation, covers, and vacuity review.

You are now ready to tackle Phase 5: AXI!
