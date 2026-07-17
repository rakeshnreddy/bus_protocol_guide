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
2. **Round Robin:** The Arbiter rotates priority among eligible requesters. A finite starvation bound can be claimed only with assumptions about continuously sampled requests, finite current transfers and locks, the set of eligible requesters, handover opportunities, and a documented service quantum. The exact policy remains implementation-defined.

Compare how the same sustained requests behave under two possible policies. The policy is a system choice, not an AHB protocol encoding.

![Timeline comparing CPU and DMA waiting time under fixed-priority and round-robin arbitration](visual:tl-ahb-multi-master-contention)

Strict fixed priority can starve a lower-priority requester indefinitely. That is not by itself a base-AHB safety violation; it is a product/QoS failure only when the implementation advertises a fairness or bounded-service contract whose assumptions hold.

## Burst Arbitration

An implementation can prefer handover at a *burst boundary*:
- A policy can allow an `INCR4` to finish before handing the bus to another manager.
- This prevents constant ownership thrashing and preserves throughput.
- Original AHB also permits **early burst termination** under its arbitration rules. If a manager loses ownership mid-burst, it must re-arbitrate and use legal `HBURST`/`HTRANS` encodings for remaining work. Burst-boundary preference, early-termination policy, fairness, and priority are distinct system choices.
