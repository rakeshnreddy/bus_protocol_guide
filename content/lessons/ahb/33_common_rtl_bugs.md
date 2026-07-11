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
visualIds: []
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

When verifying a new AHB Master or Slave, you will almost certainly encounter these classic bugs.

## 1. Wait State Data Loss (The "Early Advance" Bug)

**The Bug:** A master fails to hold `HWDATA` stable when the slave drives `HREADY = 0`.
**Why it happens:** The RTL designer wrote their state machine to advance data on every clock edge where `HTRANS != IDLE`, forgetting to AND that condition with `HREADY`.
**The Result:** Data is permanently lost. The slave samples the wrong data when it finally raises `HREADY`.

## 2. Decoder Glitches

**The Bug:** The central address decoder is purely combinatorial. If `HADDR` transitions from `0x1F` to `0x20`, the combinatorial logic might briefly glitch, causing `HSEL_SLAVE_3` to spike high for a fraction of a nanosecond before settling on `HSEL_SLAVE_4`.
**Why it happens:** Unequal delay paths in the synthesis of the decoder logic.
**The Result:** If Slave 3 uses an asynchronous latch or a poor clock-gating strategy based directly on `HSEL`, it might accidentally trigger a transaction.

## 3. Combinatorial HREADY Loops

**The Bug:** A slave calculates its `HREADYOUT` combinatorially based on its `HREADYIN` input.
**Why it happens:** The designer tried to save a clock cycle of latency by linking the inputs and outputs without a flip-flop in between.
**The Result:** Because `HREADYOUT` feeds into the system multiplexer which drives `HREADYIN`, this creates a combinatorial loop across the entire SoC interconnect. The synthesis tool will throw errors, or worse, the silicon will oscillate and burn up.

## 4. Unhandled Two-Cycle Errors

**The Bug:** A master receives a two-cycle `ERROR` response in the middle of an `INCR4` burst, but just ignores it and keeps driving `SEQ` for the rest of the burst.
**Why it happens:** The master RTL designer only tested their design against a perfectly well-behaved memory that never threw errors.
**The Result:** The slave is bombarded with invalid `SEQ` transfers after having just rejected the sequence, leading to unpredictable system state.

## 5. Arbiter Starvation

**The Bug:** Master 2 (DMA) never gets to use the bus when Master 1 (CPU) is busy.
**Why it happens:** The Arbiter was designed with strict fixed priority, and the CPU is heavily utilizing undefined-length `INCR` bursts.
**The Result:** The DMA buffers overflow because it can never get access to memory to flush its data.

---

## AHB Spec Rule Explorer

For a quick reference of the formal specification rules violated by the bugs above, you can explore the searchable index below. This tool extracts the "shall/must" rules and maps them directly back to these common failure patterns.

![Spec Rules](visual:spec-rule-explorer-ahb)
