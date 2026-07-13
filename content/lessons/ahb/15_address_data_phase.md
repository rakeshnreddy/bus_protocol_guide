---
id: "15_address_data_phase"
title: "Address Phase and Data Phase"
summary: "Understanding the two fundamental stages of an AHB transfer and how they overlap to create a pipeline."
protocol: "ahb"
tier: "1"
level: "intermediate"
order: 15
tags: ["ahb", "timing", "pipelining"]
relatedLessons: []
prerequisites: ["05_address_and_control", "08_data_and_response"]
visualIds: ["wf-ahb-pipelined-sequence"]
exerciseIds: []
glossaryTerms: ["Pipelining"]
checklistIds: []
---

Every single transfer in AHB is divided into two distinct, sequential phases: the **Address Phase** and the **Data Phase**. 

## The Address Phase
The Address Phase lasts for exactly one un-stalled clock cycle. During this cycle, the master is entirely in control.
- **Signals:** The master drives `HADDR`, `HTRANS`, `HWRITE`, `HSIZE`, and `HBURST`.
- **Timing:** These signals must be valid before the rising edge of the clock that ends the Address Phase.

## The Data Phase
The Data Phase begins immediately after the Address Phase. It lasts for one clock cycle, *plus* however many wait states the slave decides to insert.
- **Signals:** 
  - If a Write (`HWRITE=1`): The master drives `HWDATA`.
  - If a Read (`HWRITE=0`): The slave drives `HRDATA`.
  - The slave drives `HREADY` to insert wait states, and `HRESP` to indicate success or error.
- **Timing:** The data and response signals are sampled on the rising edge of the clock where `HREADY` is `1`.

## Overlapping Phases (Pipelining)

The genius of the AHB protocol is that it is **[glossary:Pipelining|pipelined]**. While the slave is busy handling the Data Phase of Transfer N, the bus is free! The master can use that time to issue the Address Phase for Transfer N+1.

Use the explicit phase-owner rows to trace the pipeline. In each overlapping cycle, ask which earlier address owns the visible write data.

![AHB pipeline showing each address phase overlapping the previous transfer data phase](visual:wf-ahb-pipelined-sequence)

In a zero-wait-state burst, this means that *every single clock cycle* the bus is moving a piece of data *and* broadcasting a new address simultaneously. This overlap is what allows AHB to achieve high throughput without requiring complex out-of-order execution logic.
