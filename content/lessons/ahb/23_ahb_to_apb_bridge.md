---
id: "23_ahb_to_apb_bridge"
title: "AHB to APB Bridge Behavior"
summary: "How a high-speed pipelined bus translates transactions for low-power, slow peripherals."
protocol: "ahb"
tier: "1"
level: "intermediate"
order: 23
tags: ["ahb", "architecture", "bridge", "apb"]
relatedLessons: []
prerequisites: ["20_decoder_and_slave_selection"]
visualIds: ["topo-ahb-apb-bridge"]
exerciseIds: []
glossaryTerms: ["APB"]
checklistIds: []
---

We know AHB is designed for high-speed, pipelined data movement. But what if we just need to flip a single bit in a UART control register? Connecting a complex AHB interface to every tiny peripheral on a chip wastes power, routing resources, and logic gates.

The solution is the **[glossary:APB]** (Advanced Peripheral Bus) and a Bridge.

## The AHB-to-APB Bridge

To the AHB system, the bridge is just a standard AHB Slave. It has `HSEL`, `HREADY`, `HADDR`, and `HWDATA` inputs.
To the APB system, the bridge is the *only* Master.

![AHB bridge topology showing its upstream slave role, downstream master role, and response return path](visual:topo-ahb-apb-bridge)

## Bridging the Timing Domain

APB is an unpipelined, 2-cycle protocol. It does not support bursts. 

For a typical simple, unbuffered bridge, when an AHB master initiates a transfer targeting an APB peripheral:
1. **AHB Address Phase:** The master drives `HTRANS=NONSEQ` targeting the APB UART address. The AHB decoder selects the Bridge.
2. **AHB Data Phase / APB Setup:** The Bridge samples the address. Because APB takes two cycles, the Bridge immediately drives `HREADY=0` to the AHB master, stalling the AHB pipeline. Simultaneously, the Bridge initiates the APB "Setup Phase" targeting the UART.
3. **APB Access:** In the next cycle, the Bridge moves the APB bus to the "Access Phase".
4. **AHB Completion:** Once the APB transfer finishes, the Bridge finally drives `HREADY=1` on the AHB side, completing the AHB Data Phase.

## Why this matters for Verification

When verifying a system with bridges, you must understand that pipelining is lost at the bridge.
If an AHB master issues an `INCR4` burst to a simple APB Bridge:
- The master issues Beat 1. The Bridge stalls it (`HREADY=0`) while it translates it to a 2-cycle APB transfer.
- The master issues Beat 2. The Bridge stalls it again.
- Each accepted AHB beat must ultimately become an individual downstream peripheral transfer. A more capable bridge can buffer requests, but it must preserve address/data ownership and return responses to the correct AHB beat.

Verification engineers must write tests to ensure the bridge correctly handles back-to-back AHB bursts without dropping data or locking up the bus.
