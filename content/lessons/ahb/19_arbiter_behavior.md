---
id: "19_arbiter_behavior"
title: "Arbiter Behavior"
summary: "How the AHB Arbiter decides who gets to use the bus."
protocol: "ahb"
tier: "1"
level: "intermediate"
order: 19
tags: ["ahb", "architecture", "arbitration"]
relatedLessons: []
prerequisites: ["15_address_data_phase"]
visualIds: ["wf-ahb-arbitration-handover", "topo-ahb-multi-master"]
exerciseIds: ["lab-ahb-arbitration-handover", "ex-ahb-arbitration"]
glossaryTerms: ["Arbitration"]
checklistIds: []
---

In a multi-master AHB system (like original AMBA 2.0 AHB), multiple masters might want to talk to a slave at the same time. Since the Address and Data buses are shared resources, an **[glossary:Arbitration|Arbiter]** must decide who gets control.

## The Request and Grant Handshake

Original-AHB arbitration can run in parallel with a data phase. It adds no handover bubble only when the arbiter computes a grant early enough and the current transfer reaches a legal ownership boundary; waits, locks, policy, or late requests can add latency.
1. **Request (`HBUSREQx`):** Each Master `x` has a dedicated `HBUSREQx` signal to the Arbiter. When a master wants the bus, it asserts its request.
2. **Arbitration Logic:** The Arbiter looks at all active requests and decides who wins based on a priority scheme (e.g., Round Robin, Fixed Priority).
3. **Grant (`HGRANTx`):** The Arbiter asserts `HGRANTx` to the winning Master. 

## When Does the Master Actually Take Over?

Just because a master receives `HGRANTx` does not mean it can immediately drive `HADDR`. It must wait for the *current* transfer to finish!
- The winning master monitors the global `HREADY` signal. 
- It only takes ownership of the Address Bus on the clock edge where both `HGRANTx` is 1 **and** `HREADY` is 1.

Keep five states separate in a checker: the **next grant** selected by policy, the **accepted owner handover** at a legal edge, the active original-AHB `HMASTER`, the manager driving the visible address/control phase, and the earlier accepted manager that owns the current data/response phase. A newly granted manager does not retroactively own the response completing on the handover edge.

Inspect the stalled handover and identify the cycle where the grant finally becomes ownership.

![AHB waveform showing a DMA grant waiting for HREADY before ownership changes](visual:wf-ahb-arbitration-handover)

The same ownership decision controls which master's transfer reaches the decoder and selected slave.

![Multi-master AHB topology tracing requests, grants, ownership selection, decoding, and response routing](visual:topo-ahb-multi-master)

## The Master Number (HMASTER)

In original AMBA 2 AHB, the arbiter drives base **`HMASTER[3:0]`** to identify the shared-bus manager and support functions including SPLIT handling. In AHB5, `HMASTER` is address-phase identity for the optional Exclusive Transfers model: a manager can supply thread identity and an interconnect combines it with route identity so the monitor sees a unique configured value. These are related names in different interface/revision contexts, not one universal ownership source.
