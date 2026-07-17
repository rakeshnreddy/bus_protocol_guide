---
id: "33_common_rtl_bugs"
title: "Common RTL Bugs"
summary: "The most frequent bugs found in AHB designs."
protocol: "ahb"
tier: "1"
level: "expert"
order: 33
tags: ["ahb", "verification", "bugs"]
relatedLessons: []
prerequisites: ["30_ahb_assertions"]
visualIds: ["wf-ahb-bug-wait-state", "wf-ahb-bug-decoder-glitch", "spec-rule-explorer-ahb"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

When verifying a new AHB Master or Slave, you will almost certainly encounter these classic bugs.

## 1. Wait State Data Loss (The "Early Advance" Bug)

**The Bug:** A master fails to hold `HWDATA` stable when the slave drives `HREADY = 0`.
**Why it happens:** Address-phase and data-phase enables are conflated. The design advances a write payload without checking completion of the saved write data owner, or advances address context without a valid accepted address event (`HREADY && HTRANS[1]`). A single `HTRANS != IDLE` enable is wrong because BUSY is not a valid beat and current `HTRANS` can belong to another phase.
**The Result:** Data is permanently lost. The slave samples the wrong data when it finally raises `HREADY`.

![Waveform exposing write data advancing one cycle before its stalled AHB data phase completes](visual:wf-ahb-bug-wait-state)

## 2. Decoder Glitches

**The Bug:** `HSEL` is a combinational decode of `HADDR`, and an integration block consumes a transient decode change asynchronously instead of using the value sampled at the legal HCLK/HREADY acceptance point.
**Why it happens:** Unequal delay paths in the synthesis of the decoder logic.
**The Result:** If Slave 3 uses an asynchronous latch or a poor clock-gating strategy based directly on `HSEL`, it might accidentally trigger a transaction.

![Waveform separating a transient raw HSEL pulse from the slave select sampled at the accepting clock edge](visual:wf-ahb-bug-decoder-glitch)

## 3. Combinatorial HREADY Loops

**The Bug:** System integration creates a combinational dependency from the selected global `HREADY` path back into a slave's `HREADYOUT`, which then feeds the same return mux.
**Why it happens:** Local logic may look legal in isolation, but the assembled feedback path closes only after interconnect muxing.
**The Result:** Timing analysis or lint reports a combinational loop, and the path has no well-defined synchronous settling contract. Whether a particular output is registered is an implementation choice; avoiding the closed loop is the requirement.

## 4. Unhandled Two-Cycle Errors

**The Bug:** The master, checker, and scoreboard disagree about the master's documented post-ERROR policy.
**Why it happens:** The design was only tested against OKAY responses, or the verification environment incorrectly assumes that canceling the remaining burst is mandatory.
**The Result:** Following transfers are misclassified or the scoreboard predicts the wrong side effects. Both canceling and continuing are permitted; the implementation must behave consistently with its documented choice.

## 5. Arbiter Starvation

**The Bug:** Master 2 (DMA) never gets to use the bus when Master 1 (CPU) is busy.
**Why it happens:** The Arbiter was designed with strict fixed priority, and the CPU is heavily utilizing undefined-length `INCR` bursts.
**The Result:** The DMA buffers overflow because it can never get access to memory to flush its data.

This is a product/QoS or configured-service failure only when a fairness or latency contract exists and its assumptions hold. Strict fixed priority without such a promise is a legal arbitration policy, even though it can be a poor system choice.

---

## AHB Spec Rule Explorer

For a quick reference, explore the searchable index below. Treat an entry as normative only when its provenance names the selected specification issue and section and the statement has been checked against that primary source; the explorer is a traceability aid, not an authority merely because it uses “shall” or “must.”

![Searchable AHB rule and bug-pattern explorer for timing, response, integration, and arbitration failures](visual:spec-rule-explorer-ahb)
