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

To the AHB system, the bridge is an AHB subordinate. Its upstream inputs include `HSEL`, `HADDR`, `HTRANS`, `HWRITE`, `HSIZE`, `HBURST`, protection and enabled attributes, `HWDATA`, and global `HREADY`. Its upstream outputs are `HREADYOUT`, `HRESP`, and `HRDATA`.
To the APB system, the bridge is the *only* Master.

![AHB bridge topology showing its upstream slave role, downstream master role, and response return path](visual:topo-ahb-apb-bridge)

## Bridging the Timing Domain

The existing downstream peripheral transfer has a minimum Setup phase followed by an Access phase. The Access phase can be extended while `PREADY=0`; it is therefore not universally “a two-cycle protocol.” The bridge translates each accepted AHB beat into the required downstream operation.

For a typical simple, unbuffered bridge, when an AHB master initiates a transfer targeting an APB peripheral:
1. **AHB Address Phase:** The master drives `HTRANS=NONSEQ` targeting the APB UART address. The AHB decoder selects the Bridge.
2. **AHB Data Phase / downstream Setup:** For an unbuffered bridge, the Bridge drives `HREADYOUT=0`, which produces global `HREADY=0` and stalls the AHB pipeline while the Setup phase is driven.
3. **APB Access:** In the next cycle, the Bridge moves the APB bus to the "Access Phase".
4. **AHB Completion:** Once the downstream Access completes, the Bridge drives `HREADYOUT=1` with `HRESP`; the interconnect presents global `HREADY=1` to complete the AHB data phase.

For an AHB write, the bridge retains the accepted address/control and its following `HWDATA`, then drives a downstream write. For an AHB read, it retains the address/control, performs a downstream read, and returns the read payload on `HRDATA`. The two translations have different AHB data ownership and must not be collapsed into one directionless sequence.

## Why this matters for Verification

When verifying a system with bridges, you must understand that pipelining is lost at the bridge.
If an AHB master issues an `INCR4` burst to a simple APB Bridge:
- The master issues Beat 1. The Bridge stalls it (`HREADY=0`) while it translates it to a 2-cycle APB transfer.
- The master issues Beat 2. The Bridge stalls it again.
- Each accepted AHB beat must ultimately become an individual downstream peripheral transfer. A more capable bridge can buffer requests, but it must preserve address/data ownership and return responses to the correct AHB beat.

An unbuffered bridge cannot accept another AHB beat while its `HREADYOUT=0` is holding global `HREADY` LOW. Any bridge that accepts additional beats needs explicit buffering and conservation checks for every accepted request, payload, and completion.

Verification engineers must write tests to ensure the bridge correctly handles back-to-back AHB bursts without dropping data or locking up the bus.
