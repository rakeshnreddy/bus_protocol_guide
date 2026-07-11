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

![tp-axi-apb-bridge](visual:tp-axi-apb-bridge)

The most common bridge in the industry is the AXI-to-APB bridge. 

The bridge acts as an AXI Slave on one side, and an APB Master on the other. 
Because APB is incredibly simple (no bursts, no pipelines, strict 2-cycle transfers), the bridge has to do a lot of translation work:

1.  **Burst Breakdown:** If the AXI master sends an INCR burst of 4 beats, the bridge must accept the address, and then execute four completely separate, sequential APB transfers. It cannot accept the next beat of AXI data until the previous APB transfer completes.
2.  **Backpressure:** Because APB is slow, the bridge will heavily backpressure the AXI master, holding `WREADY` or `ARREADY` low while it waits for the APB peripheral to respond.
3.  **Response Synthesis:** APB does not have a concept of OKAY vs EXOKAY vs SLVERR (prior to APB4). The bridge must synthesize an `OKAY` response on the AXI `BRESP`/`RRESP` channels to satisfy the AXI master.

## AXI-to-AHB Bridges

When bridging AXI to AHB, the challenge is pipelining. 
AHB expects the address phase of Transaction B to overlap with the data phase of Transaction A. AXI has no such strict timing requirement between channels. 
An AXI-to-AHB bridge must buffer AXI requests and carefully inject them into the AHB domain so that the strict AHB pipeline timing (the relationship between `HTRANS` and `HREADY`) is maintained without violating the AXI handshake rules on the input side.
