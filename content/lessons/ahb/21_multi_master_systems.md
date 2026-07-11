---
id: "21_multi_master_systems"
title: "Multi-Master Systems"
summary: "Understanding contention, priority, and fairness when multiple masters share a single bus."
protocol: "ahb"
tier: "1"
level: "intermediate"
order: 21
tags: ["ahb", "architecture", "multi-master"]
relatedLessons: []
prerequisites: ["19_arbiter_behavior"]
visualIds: ["topo-ahb-multi-master"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

When a system has multiple masters (e.g., a CPU and a DMA engine), they will inevitably try to access the bus at the same time. This is called **Contention**. 

## Dealing with Contention

The Arbiter resolves contention based on an arbitration algorithm. The protocol specification doesn't dictate *which* algorithm to use—that's up to the SoC architect—but the two most common are:

1. **Fixed Priority:** One master (e.g., the CPU) always wins over the other. This ensures the CPU is never starved, but a heavy CPU workload might starve the DMA entirely.
2. **Round Robin:** The Arbiter rotates priority. If Master 1 wins this time, Master 2 is guaranteed to win next time. This ensures fairness but might increase latency for critical CPU tasks.

## Burst Arbitration

A key feature of AHB is that Arbitration is typically evaluated on a *burst boundary*. 
- If Master 1 is granted the bus and starts an `INCR4` burst, the Arbiter will usually allow Master 1 to finish all 4 beats before handing the bus over to Master 2, even if Master 2 is higher priority.
- This prevents the bus from constantly thrashing back and forth between masters, which ruins throughput.
- **Exception:** If a master uses an undefined length `INCR` burst, the arbiter is allowed to prematurely terminate it by dropping `HGRANT` mid-burst if a higher-priority master needs the bus. The master must then re-arbitrate for the bus to finish its remaining data.
