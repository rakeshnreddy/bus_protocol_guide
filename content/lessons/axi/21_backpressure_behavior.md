---
id: "21_backpressure_behavior"
title: "Backpressure Behavior"
summary: "How AXI stalls gracefully without a global HREADY signal."
protocol: "axi"
tier: "1"
level: "expert"
order: 21
tags: ["axi", "flow-control", "architecture"]
relatedLessons: ["22_throughput_reasoning_bottlenecks"]
prerequisites: ["11_ready_valid_in_depth"]
visualIds: ["wf-axi-deadlock"]
exerciseIds: ["ex-axi-deadlock"]
glossaryTerms: []
checklistIds: []
---

In AHB, if a slave is busy, it pulls the global `HREADY` signal LOW. This freezes the entire bus. No master can issue new addresses, and no data can move. It is a brute-force approach to flow control.

AXI does not have a global `HREADY`. Instead, flow control is distributed via the `READY` signal on each of the five independent channels. This is called **backpressure**.

## Independent Stalls

Because the channels are independent, backpressure on one channel does not inherently stall the others.

If a slave's write data FIFO is full, it will pull `WREADY` LOW. The master cannot send any more write data. 
However, the master is completely free to continue sending write *addresses* on the AW channel (as long as `AWREADY` is HIGH), and it is completely free to continue reading data on the AR and R channels!

This localized backpressure prevents a bottleneck in one part of the system from dragging down the entire SoC.

## The Danger of Circular Backpressure (Deadlock)

While independent channels are powerful, they introduce a massive risk if designed poorly: Circular Deadlock.

Consider a poorly designed master and slave interacting:
*   The master has write data ready (`WVALID=1`), but its internal design dictates that it refuses to accept write responses (`BREADY=0`) until its write data FIFO is empty.
*   The slave has finished a previous write and is trying to send the response (`BVALID=1`), but its internal design dictates that it refuses to accept any new write data (`WREADY=0`) until it has successfully delivered the previous response.

Look at the waveform below. Both sides are waiting for the other side to do something first.

![wf-axi-deadlock](visual:wf-axi-deadlock)

This is a permanent, fatal deadlock. The AXI specification is explicitly designed to prevent this by enforcing strict dependency rules (as discussed in Lesson 11: `VALID` cannot depend on `READY`). The scenario above is a violation of the spec, but it is one of the most common bugs you will hunt for as a DV engineer.
