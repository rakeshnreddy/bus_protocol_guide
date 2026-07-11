---
id: "03_timing_diagrams"
title: "Timing Diagrams"
summary: "Understand how to read waveforms, combinational vs sampled behavior, and single-cycle vs pipelined timing."
protocol: "foundations"
tier: "0"
level: "beginner"
order: 3
tags: ["timing", "waveforms", "pipelining"]
visualIds: ["wf-pipeline-timing"]
exerciseIds: ["ex-timing-diagrams"]
glossaryTerms: []
---

When verifying a protocol, you will spend 90% of your time staring at timing diagrams (waveforms). A waveform is simply a graph of signal voltages over time.

## Reading Waveforms

When looking at a waveform:
1. **Find the clock:** Everything happens relative to the rising edge of the clock.
2. **Look for the handshake:** Identify when the master makes a request and the slave grants it, or when `VALID` and `READY` overlap.
3. **Trace the data:** Follow the data associated with that specific handshake.

## Combinational vs Sampled Behavior

Sometimes a signal changes *immediately* in response to another signal changing, without waiting for a clock edge. This is **combinational logic**. 
For example, if a master drops its request, a purely combinational arbiter might drop the grant in the very same cycle.

However, most protocol state machines use **sampled behavior**. If the master asserts a signal, the slave doesn't actually "see" it until the next rising clock edge. The slave then computes its response and outputs it, which the master won't see until the *following* clock edge.

## Pipelining

In a simple, single-cycle protocol, a master sends an address, waits for the data to come back, and only then sends the next address. This is slow!

To improve throughput, modern protocols use **Pipelining**. 
Pipelining means overlapping the phases of different transactions. 

![wf-pipeline-timing](visual:wf-pipeline-timing)

In the waveform above, notice how the Command phase for `READ B` happens at the exact same time as the Data phase for `READ A`. The master doesn't wait! This means the hardware must be capable of tracking multiple in-flight transactions at once. This is the heart of high-performance protocols like AXI.
