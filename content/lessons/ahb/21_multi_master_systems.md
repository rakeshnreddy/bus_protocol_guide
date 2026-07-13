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
visualIds: ["topo-ahb-multi-master", "tl-ahb-multi-master-contention"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

When a system has multiple masters (e.g., a CPU and a DMA engine), they will inevitably try to access the bus at the same time. This is called **Contention**. 

First trace the ownership and routing path. The arbiter selects a master; the decoder independently selects a target.

![AHB multi-master topology separating arbitration, owner selection, target decoding, and response routing](visual:topo-ahb-multi-master)

## Dealing with Contention

The Arbiter resolves contention based on an arbitration algorithm. The protocol specification doesn't dictate *which* algorithm to use—that's up to the SoC architect—but the two most common are:

1. **Fixed Priority:** One master (e.g., the CPU) ranks above the other. This protects CPU latency, but a continuously requesting CPU can starve the DMA unless the implementation adds a starvation limit.
2. **Round Robin:** The Arbiter rotates priority among eligible requesters. This can bound starvation, but the exact eligibility, service quantum, and latency are implementation-defined.

Compare how the same sustained requests behave under two possible policies. The policy is a system choice, not an AHB protocol encoding.

![Timeline comparing CPU and DMA waiting time under fixed-priority and round-robin arbitration](visual:tl-ahb-multi-master-contention)

## Burst Arbitration

Normally the Arbiter hands over at a *burst boundary*.
- If Master 1 is granted the bus and starts an `INCR4` burst, the Arbiter normally allows all 4 beats to finish before handing the bus to Master 2.
- This prevents constant ownership thrashing and preserves throughput.
- The original AHB specification also permits **early burst termination** when excessive access time must be avoided. If a master loses ownership mid-burst, it must re-arbitrate and use legal `HBURST`/`HTRANS` encodings for the work that remains; this rule is not limited to undefined-length `INCR` bursts.
