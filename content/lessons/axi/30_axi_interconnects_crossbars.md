---
id: "30_axi_interconnects_crossbars"
title: "AXI Interconnects and Crossbars"
summary: "How multiple masters and slaves connect through switching fabric."
protocol: "axi"
tier: "1"
level: "expert"
order: 30
tags: ["axi", "architecture", "interconnect"]
relatedLessons: ["31_multi_master_reasoning"]
prerequisites: ["04_five_channel_model"]
visualIds: ["tp-axi-crossbar"]
exerciseIds: ["lab-axi-response-route-owner"]
glossaryTerms: ["Crossbar"]
checklistIds: []
---

In our AHB module, we learned that a shared AHB bus has one current transfer owner. AXI instead defines independent channels that an interconnect implementation can route through a richer fabric.

AXI abandons the shared bus model. Instead, AXI systems use an **Interconnect** (often implemented as a **Crossbar** switch).

## The Crossbar Advantage

A crossbar is a network of switches that can provide concurrent routes. Requests contending for the same target channel require arbitration, while different targets—or independent read and write channel resources—can often progress together.

![Two AXI initiators using concurrent crossbar routes with explicit decode, arbitration, and response ownership](visual:tp-axi-crossbar)

In the topology above, the illustrated implementation lets Master 0 use Slave 0 while Master 1 uses Slave 1. This concurrency is a crossbar capability, not a requirement that every AXI interconnect expose the same topology or bandwidth.

Because AXI channels are independently flow-controlled, the crossbar is even more powerful. Master 0 could be sending a Write Address to Slave 0 while Slave 0 sends Read Data back to Master 1. The AW, W, B, AR, and R networks can make concurrent progress, but the fabric must still enforce AW/write-data association, accepted AW plus final accepted W before B, accepted AR before R, response ordering, and its configured resource limits.

## Interconnect Roles

The interconnect sits between the masters and the slaves and acts as both a proxy and a manager. Its primary jobs are:
1.  **Address Decoding:** When a master sends an address, the interconnect looks at it, determines which slave it targets, and routes the `AWVALID`/`ARVALID` signal to only that slave.
2.  **Arbitration:** If Master 0 and Master 1 contend for the same target channel, the interconnect selects according to its configured policy and backpressures requests that cannot yet progress.
3.  **ID ownership:** As discussed in the IDs lesson, it retains source-port identity—commonly by extending IDs—so responses return to the correct master.
4.  **Protocol Conversion:** A complex interconnect might connect an AXI4 master to an AXI3 slave, automatically handling the protocol translation (like breaking a 256-beat burst down into 16-beat chunks).
