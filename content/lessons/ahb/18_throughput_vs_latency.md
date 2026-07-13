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

**Latency** is the time it takes for a *single piece of data* to be transferred.
- In AHB, the absolute minimum latency for a transfer is 2 clock cycles: 1 cycle for the Address Phase, and 1 cycle for the Data Phase.
- Latency increases linearly with every wait state (`HREADY=0`) inserted by the slave.
- A slow slave (e.g., an off-chip Flash memory controller) might have a latency of 10-20 clock cycles for a single read.

The stalled burst below shows why a wait state affects more than one beat: delaying the current data phase also freezes the address phase queued behind it.

![Wait-state-heavy AHB burst illustrating added latency and reduced completion rate](visual:wf-ahb-wait-state-heavy)

## Throughput

**Throughput** is the total volume of data moved over a period of time.
- Because AHB is pipelined, while the *latency* of a single transfer is 2 cycles, the *throughput* of a continuous burst with zero wait states is **1 transfer per cycle**. 
- In our `wf-ahb-pipelined-sequence` example, we achieve 100% throughput utilization of the data bus during the burst.

![Zero-wait AHB pipeline completing one data beat per cycle after initial fill](visual:wf-ahb-pipelined-sequence)

## The Impact of Bursts on Slow Slaves

Why do we use bursts instead of just issuing lots of single transfers?

Consider a DDR memory controller. Accessing a random address in DDR is slow (high latency, maybe 20 cycles) because the memory must open a new row. However, once the row is open, accessing the *next* sequential address is very fast (1 cycle).

If a master issues four `SINGLE` transfers to random addresses, the DDR controller takes 20 cycles for each one: total time = 80 cycles.

If a master issues an `INCR4` burst:
1. The DDR controller sees the burst start, opens the row, and takes 20 cycles to return the first beat.
2. The controller sees that the next three beats are `SEQ`, meaning they are contiguous in memory! It can return them immediately, 1 cycle each.
3. Total time = 20 + 1 + 1 + 1 = 23 cycles!

By declaring its intent upfront via `HBURST`, the master gave the slave the information it needed to optimize its internal fetches, massively increasing throughput despite the high initial latency.

Compare the three completion lanes below. Focus a beat to distinguish first-completion latency from the spacing between later completions.

![Interactive timing comparison of zero-wait bursts, stalled bursts, and independent slow SINGLE transfers](visual:tl-ahb-performance-comparison)
