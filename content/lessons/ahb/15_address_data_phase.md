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
exerciseIds: ["lab-ahb-pipeline-owner"]
glossaryTerms: ["Pipelining"]
checklistIds: []
---

Every single transfer in AHB is divided into two distinct, sequential phases: the **Address Phase** and the **Data Phase**. 

## The Address Phase
The address/control lane presents a manager-owned phase. A valid phase becomes accepted only on a rising edge where global `HREADY` is HIGH.
- **Signals:** The master drives `HADDR`, `HTRANS`, `HWRITE`, `HSIZE`, and `HBURST`.
- **Timing:** These signals must be valid before the rising edge of the clock that ends the Address Phase.

## The Data Phase
The Data Phase begins immediately after the Address Phase. It lasts for one clock cycle, *plus* however many wait states the slave decides to insert.
- **Signals:** 
  - If a Write (`HWRITE=1`): The master drives `HWDATA`.
  - If a Read (`HWRITE=0`): The slave drives `HRDATA`.
  - The owning subordinate drives `HREADYOUT`, `HRESP`, and read data; the interconnect routes these to global `HREADY` and the manager-facing return signals.
- **Timing:** The data and response signals are sampled on the rising edge of the clock where `HREADY` is `1`.

## Overlapping Phases (Pipelining)

AHB is **[glossary:Pipelining|pipelined]**: while transfer N owns the data/response lane, transfer N+1 can use the address/control lane. The bus is not “free”; two different pipeline resources are serving two different transfer owners.

Use the explicit phase-owner rows to trace the pipeline. In each overlapping cycle, ask which earlier address owns the visible write data.

![AHB pipeline showing each address phase overlapping the previous transfer data phase](visual:wf-ahb-pipelined-sequence)

In a zero-wait-state burst, this means that *every single clock cycle* the bus is moving a piece of data *and* broadcasting a new address simultaneously. This overlap is what allows AHB to achieve high throughput without requiring complex out-of-order execution logic.

Use three distinct address states in a monitor:

- **Visible:** address/control currently driven on the interface.
- **Pending:** a visible valid `NONSEQ`/`SEQ` phase held because `HREADY` is LOW.
- **Accepted:** a valid visible phase sampled on an edge with `HREADY` HIGH; its saved context becomes the following data/response owner.

On the same accepting edge, `HREADY` completes the current data phase and permits the address pipeline to advance. Those simultaneous events involve different transfer records.
