---
id: "33_bridges_mixed_protocol"
title: "Bridges and Mixed-Protocol Contexts"
summary: "Connecting the high-speed AXI domain to slower APB and AHB domains."
protocol: "axi"
tier: "1"
level: "expert"
order: 33
tags: ["axi", "architecture", "bridge"]
relatedLessons: []
prerequisites: ["30_axi_interconnects_crossbars"]
visualIds: ["tp-axi-apb-bridge", "topo-axi-ahb-bridge"]
exerciseIds: []
glossaryTerms: []
checklistIds: []
---

A modern SoC is almost never "pure AXI." It is a heterogeneous mix of protocols. The high-performance core uses AXI, but the peripherals (UARTs, Timers, GPIOs, SPI controllers) almost exclusively use APB or AHB.

To connect them, you use a Bridge.

## The AXI-to-APB Bridge

![AXI4-to-APB3 or APB4 bridge separating AXI channel acceptance, buffered conversion, APB selection, and error return](visual:tp-axi-apb-bridge)

The most common bridge in the industry is the AXI-to-APB bridge. 

The bridge acts as an AXI Slave on one side, and an APB Master on the other. 
Because APB is intentionally simple (no bursts and no pipelined overlap), the bridge has to translate between very different transaction models. An APB transfer has a one-cycle SETUP phase followed by one or more ACCESS cycles; two cycles is the minimum, while `PREADY` can add wait states.

1.  **Burst Breakdown:** If the AXI master sends an INCR burst of 4 beats, a converting bridge issues separate sequential APB transfers with derived addresses. How much AXI address and write data it accepts ahead of APB completion depends on its documented buffering and outstanding-depth design.
2.  **Backpressure:** When those buffers or read-request resources are unavailable, the bridge backpressures the relevant AXI channels. It is not required to stall every channel for the full APB latency if it has capacity to accept more work.
3.  **Response Mapping:** APB3 and later define optional `PSLVERR`; an APB error maps back to AXI `RRESP` for reads or `BRESP` for writes. If the downstream interface has no error signal, the bridge follows its specified system policy—commonly returning `OKAY` when the APB transfer completes normally—rather than detecting an error that APB never reported.

## AXI-to-AHB Bridges

![AXI4-to-AHB5 bridge showing accepted-address queues, early-W association, 4 KB-to-1 KB splitting, serialized AHB phases, response mapping, and ID restoration](visual:topo-axi-ahb-bridge)

The learner question is: **how does an AXI4 memory-mapped transaction survive conversion to an AMBA 5 AHB interface without losing its boundaries, ordering context, or response ownership?** The bridge is an AXI subordinate on its upstream side and an AHB manager on its downstream side. It must preserve both protocols independently; its buffering depth and scheduling policy are implementation choices.

1. **Boundary-aware burst conversion:** An AXI burst must remain inside one 4 KB region, but that legal AXI burst can cross an AHB 1 KB boundary. The bridge derives every beat address and splits the downstream work at each 1 KB boundary so every emitted AHB burst is legal. It still presents the original AXI beat count and transaction boundary upstream.
2. **ID context and serialization:** AXI IDs identify correlation and ordering domains, while the AHB path has no equivalent per-transaction ID channel. The bridge can retain several AXI requests only when it has enough queue and response context; it serializes their downstream address/data phases as required by the AHB port and later restores the correct `BID` or `RID`. This is not a claim that AXI permits only one outstanding transaction.
3. **AXI4 write-data association:** AXI4 removed `WID`, so write data follows accepted write-address order. If the bridge accepts W before AW, it buffers those transfers until an accepted AW supplies the association context. It must never infer association from arrival timing alone or interleave AXI4 write data from different accepted AW transactions.
4. **Response aggregation and mapping:** AHB supplies `HRESP` for each completed transfer. AXI supplies `RRESP` on each read beat and one `BRESP` after the write transaction. The bridge preserves the read beat count and `RLAST`, combines downstream write outcomes into the single write response, and applies a documented mapping. A downstream AHB `ERROR` normally becomes AXI `SLVERR`; an address rejected by upstream decode can become `DECERR`.
5. **Attributes and atomic mechanisms:** Protection and security fields need an explicit supported conversion, for example appropriate `AxPROT` information into `HPROT` and `HNONSEC`. `AxCACHE`, `AxQOS`, and `AxREGION` have no universal one-to-one AHB representation. AXI exclusives, original-AHB `HLOCKx`, AHB5 `HMASTLOCK`, AHB5 exclusive signaling, and security attribution are distinct mechanisms; a bridge must not silently equate them. Unsupported operations are rejected or degraded only according to the bridge's documented system contract.

AHB phase pipelining is the final timing obligation: the address phase of a later transfer can overlap the data/response phase of an earlier transfer, and `HREADY` controls which phase advances. The bridge therefore tracks the current address owner separately from the current data/response owner while continuing to obey every independent AXI channel handshake upstream.
