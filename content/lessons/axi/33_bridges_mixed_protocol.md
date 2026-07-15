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
visualIds: ["tp-axi-apb-bridge"]
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

When bridging AXI to AHB, the challenge is pipelining. 
AHB expects the address phase of Transaction B to overlap with the data phase of Transaction A. AXI has no such strict timing requirement between channels. 
An AXI-to-AHB bridge must buffer AXI requests and carefully inject them into the AHB domain so that the strict AHB pipeline timing (the relationship between `HTRANS` and `HREADY`) is maintained without violating the AXI handshake rules on the input side.
