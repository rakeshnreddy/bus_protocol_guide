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
visualIds: ["wf-axi-ready-valid-scenarios", "wf-axi-deadlock"]
exerciseIds: ["ex-axi-deadlock"]
glossaryTerms: []
checklistIds: []
---

On a shared AHB path, a selected slave's wait response is reflected through `HREADY` and extends both the active data phase and the overlapping address phase. Other independent layers in a multi-layer matrix can still progress, but this shared pipeline cannot accept its next address while the wait persists.

AXI does not have a global `HREADY`. Instead, flow control is distributed via the `READY` signal on each of the five independent channels. This is called **backpressure**.

## Independent Stalls

Because the channels are independent, backpressure on one channel does not inherently stall the others.

If a slave's write data FIFO is full, it will pull `WREADY` LOW. The master cannot send any more write data. 
However, the master is completely free to continue sending write *addresses* on the AW channel (as long as `AWREADY` is HIGH), and it is completely free to continue reading data on the AR and R channels!

This localized backpressure prevents a bottleneck in one part of the system from dragging down the entire SoC.

Inspect the legal stalled transfer below. The source holds `VALID` and its payload stable until the destination finally raises `READY`; a stall changes latency, not ownership of the offered payload.

![AXI VALID and payload held stable through destination backpressure until an accepting edge](visual:wf-axi-ready-valid-scenarios)

## The Danger of Circular Backpressure (Deadlock)

While independent channels are powerful, they introduce a massive risk if designed poorly: Circular Deadlock.

Consider a poorly designed master and slave interacting:
*   The master has write data ready (`WVALID=1`), but its internal design dictates that it refuses to accept write responses (`BREADY=0`) until its write data FIFO is empty.
*   The slave has finished a previous write and is trying to send the response (`BVALID=1`), but its internal design dictates that it refuses to accept any new write data (`WREADY=0`) until it has successfully delivered the previous response.

Look at the waveform below. Both sides are waiting for the other side to do something first.

![AXI W and B sources holding VALID while circular READY policies prevent every transfer](visual:wf-axi-deadlock)

This dependency loop creates a permanent system-level liveness failure. In the shown waveform, both sources assert and hold `VALID` correctly; the deadlock comes from individually permitted but mutually incompatible cross-channel `READY` policies. It is therefore not automatically a single-interface safety violation. If those policies are implemented as direct combinational input-to-output paths, that separately violates AXI's no-combinational-path rule; the steady waveform alone does not prove how they were implemented. Verification needs an integration-level progress contract or bounded timeout in addition to the AXI stability assertions discussed in Lesson 11.
