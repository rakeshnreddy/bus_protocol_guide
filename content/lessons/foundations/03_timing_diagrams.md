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

Protocol state is updated from values sampled at the relevant rising edge, but the latency from a request to a response is not universally one registered cycle. An AHB subordinate can drive response information during the transfer's data phase for sampling on its completion edge. An AXI component can insert zero or many internal register stages while still obeying each channel's handshake rules. Waveforms must therefore mark the actual accepting and completion edges instead of assuming one implementation pipeline.

## Pipelining

In a simple, single-cycle protocol, a master sends an address, waits for the data to come back, and only then sends the next address. This is slow!

To improve throughput, protocols can overlap work. **Pipelining** means different phase resources carry work for different transfers at the same time.

![wf-pipeline-timing](visual:wf-pipeline-timing)

In an AHB zero-wait pipeline, the address/control phase for transfer B overlaps the data/response phase for transfer A. That overlap requires the subordinate and monitor to retain the accepted context for A while B is visible, but it does **not** create an AXI-style arbitrary outstanding queue or transaction ID.

AXI uses a different mechanism: each channel transfers payload through its own VALID/READY handshake, accepted address requests can remain outstanding, IDs define ordering/correlation streams, and different-ID responses can complete in different orders where the connected components support it.

Keep four measures separate:

- **Latency:** the number of cycles between defined start and completion points for one transfer.
- **Throughput:** the sustained rate of accepted or completed work.
- **Pipeline overlap/depth:** which phase resources are occupied concurrently.
- **Outstanding count:** accepted requests that have not yet reached their protocol retirement event.

Ordering constrains which responses may be observed first; out-of-order response completion does not describe the target's internal execution architecture.

## Monitor and Scoreboard View

An AHB monitor creates a phase record only when a valid address phase is accepted (`HREADY` HIGH with valid `HTRANS`) and associates the later data/response phase with that stored record. An AXI monitor reconstructs AW, W, B, AR, and R channel transfers independently, then correlates them using transaction state and IDs. This behavioral requirement does not mandate a particular internal register implementation in the DUT.
