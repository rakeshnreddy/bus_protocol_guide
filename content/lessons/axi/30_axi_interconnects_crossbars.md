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
exerciseIds: []
glossaryTerms: ["Crossbar"]
checklistIds: []
---

In our AHB module, we learned that AHB is typically a "shared bus." If Master A is talking to Slave B, the entire bus is locked. Master C cannot talk to Slave D at the same time.

AXI abandons the shared bus model. Instead, AXI systems use an **Interconnect** (often implemented as a **Crossbar** switch).

## The Crossbar Advantage

A crossbar is a network of switches that can route traffic between any master and any slave simultaneously, provided they aren't trying to access the *same* slave at the same time.

![tp-axi-crossbar](visual:tp-axi-crossbar)

In the topology above, Master 0 can read from Slave 0 while Master 1 is simultaneously writing to Slave 1. The crossbar physically contains separate routing paths for them. 

Because AXI channels are independent, the crossbar is even more powerful. Master 0 could be sending a Write Address to Slave 0, while Slave 0 is sending Read Data back to Master 1. The AW, W, B, AR, and R networks inside the crossbar operate completely independently of one another.

## Interconnect Roles

The interconnect sits between the masters and the slaves and acts as both a proxy and a manager. Its primary jobs are:
1.  **Address Decoding:** When a master sends an address, the interconnect looks at it, determines which slave it targets, and routes the `AWVALID`/`ARVALID` signal to only that slave.
2.  **Arbitration:** If Master 0 and Master 1 both try to access Slave 0 at the exact same time, the interconnect acts as the arbiter. It grants access to one (e.g., Master 0) and holds the `READY` signal LOW for the other (Master 1) until the slave is free.
3.  **ID Extension:** As discussed in the IDs lesson, it modifies transaction IDs to ensure uniqueness across the system.
4.  **Protocol Conversion:** A complex interconnect might connect an AXI4 master to an AXI3 slave, automatically handling the protocol translation (like breaking a 256-beat burst down into 16-beat chunks).
