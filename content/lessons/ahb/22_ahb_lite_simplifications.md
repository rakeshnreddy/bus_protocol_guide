---
id: "22_ahb_lite_simplifications"
title: "AHB-Lite Simplifications"
summary: "Why arbitration was removed from the standard, and how multi-master systems are built today."
protocol: "ahb"
tier: "1"
level: "intermediate"
order: 22
tags: ["ahb", "architecture", "ahb-lite"]
relatedLessons: []
prerequisites: ["21_multi_master_systems"]
visualIds: ["sig-ahb-variants", "tp-bus-architectures"]
exerciseIds: []
glossaryTerms: ["AHB-Lite"]
checklistIds: []
---

In the original AMBA 2.0 specification, the AHB bus was a shared medium. All masters and slaves connected to the same physical wires, requiring a complex centralized Arbiter and Decoder.

As chip designs scaled, this shared-bus model became a severe bottleneck. The capacitance of the long, shared wires ruined clock speeds, and the centralized arbiter was difficult to route.

## Enter AHB-Lite

ARM recognized this problem and released **[glossary:AHB-Lite]**. AHB-Lite makes a radical simplification: **It assumes there is only exactly one master.**

Because there is only one master:
- **No Arbitration:** The `HBUSREQ` and `HGRANT` signals are completely removed from the specification. The master always has the bus!
- **No `SPLIT`/`RETRY`:** These original-AHB responses were removed. `SPLIT` makes the arbiter remove the requesting master from eligibility until the slave later asserts the corresponding `HSPLITx` bit. `RETRY` instead asks the master to reattempt the transfer and does not use `HSPLITx` or itself remove that master from arbitration.
- **Locked indication retained:** `HMASTLOCK` remains a defined address/control signal even though per-manager `HLOCKx` arbitration requests are absent.
- **Single-manager contract:** The manager still obeys reset, `HREADY`, valid/pending stability, burst length/progression, alignment, and response rules. It can present work only in a protocol-legal address phase.

Use the comparison to distinguish the signals removed by AHB-Lite from the optional capabilities later added by AHB5.

![Interactive comparison of original AHB, AHB-Lite, and AHB5 interface capabilities](visual:sig-ahb-variants)

## How do we build Multi-Master systems today?

If AHB-Lite only supports one master, how do we build systems with a CPU, a DMA, and a GPU?

We commonly use an **Interconnect Matrix** (or Bus Matrix).

Instead of connecting all managers to one shared bus, every manager gets its *own* dedicated, single-manager AHB-Lite interface. These interfaces can plug into a routing matrix. The matrix arbitrates wherever requested routes share a constrained resource.
- If Master 1 wants to talk to Slave 1, and Master 2 wants to talk to Slave 2, the matrix allows them to happen simultaneously! There is no contention.
- Requests can contend for the same target, a bridge, a limited output port, a shared buffer, or another internal fabric resource even when their final address regions differ.

By removing arbitration from the *protocol* and pushing it into the *interconnect implementation*, AHB-Lite dramatically simplified RTL design and improved system performance.

Compare the shared-bus and switched-interconnect structures. The matrix can allow independent targets to progress concurrently; it does not make every pair of accesses contention-free.

![Architecture comparison showing point-to-point, shared-bus, and switched-crossbar connectivity](visual:tp-bus-architectures)
