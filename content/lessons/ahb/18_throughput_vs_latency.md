---
id: "18_throughput_vs_latency"
title: "Throughput vs Latency Intuition"
summary: "How wait states, pipelining, and bursts impact system performance."
protocol: "ahb"
tier: "1"
level: "advanced"
order: 18
tags: ["ahb", "timing", "performance"]
relatedLessons: []
prerequisites: ["15_address_data_phase"]
visualIds: ["wf-ahb-pipelined-sequence", "wf-ahb-wait-state-heavy", "tl-ahb-performance-comparison"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

When designing or verifying an AHB system, it's not enough that the protocol works functionally; it must meet performance requirements. Two critical metrics govern performance: **Latency** and **Throughput**.

## Latency

Define endpoints before quoting **latency**:

- **Address-to-completion latency:** rising-edge intervals from acceptance of a valid address phase to the edge that completes its data phase. A zero-wait transfer completes at the next rising edge: one elapsed cycle, while occupying an address slot and a following data slot.
- **First-beat latency:** request or first-address acceptance to the first completed data beat.
- **Burst completion latency:** first-address acceptance to completion of the final accepted beat.

Each wait cycle with global `HREADY=0` extends the current data phase and adds one interval to the affected completion measurement. Any quoted memory latency is an implementation measurement, not an AHB constant.

The stalled burst below shows why a wait state affects more than one beat: delaying the current data phase also freezes the address phase queued behind it.

![Wait-state-heavy AHB burst illustrating added latency and reduced completion rate](visual:wf-ahb-wait-state-heavy)

## Throughput

**Throughput** is completed payload bytes divided by measured cycles or time. **Completion rate** is completed valid beats per cycle. **Data-bus utilization** is the fraction of measured cycles that complete a valid data beat.
- Because AHB is pipelined, while the *latency* of a single transfer is 2 cycles, the *throughput* of a continuous burst with zero wait states is **1 transfer per cycle**. 
- In our `wf-ahb-pipelined-sequence` example, we achieve 100% throughput utilization of the data bus during the burst.

![Zero-wait AHB pipeline completing one data beat per cycle after initial fill](visual:wf-ahb-pipelined-sequence)

## The Impact of Bursts on Slow Slaves

Why do we use bursts instead of just issuing lots of single transfers?

Consider a hypothetical DDR controller model in which a row miss takes 20 cycles and each later same-row beat takes one cycle. Those numbers are teaching assumptions, not protocol guarantees.

If four `SINGLE` transfers all miss in this hypothetical model, the example total is 80 cycles. A real controller can recognize contiguous SINGLE transfers and optimize them too; `HBURST` is useful intent, not the only possible implementation hint.

If a master issues an `INCR4` burst:
1. The DDR controller sees the burst start, opens the row, and takes 20 cycles to return the first beat.
2. The controller sees legal `SEQ` progression and, under this model's same-row assumption, returns later beats one cycle apart.
3. Total time = 20 + 1 + 1 + 1 = 23 cycles!

`HBURST` helps communicate progression and declared length, but it does not guarantee that later beats complete one cycle apart. Wait behavior remains subordinate- and implementation-dependent.

Compare the three completion lanes below. Focus a beat to distinguish first-completion latency from the spacing between later completions.

![Interactive timing comparison of zero-wait bursts, stalled bursts, and independent slow SINGLE transfers](visual:tl-ahb-performance-comparison)
