---
id: "43_axi_waveform_review_pack"
tier: "3"
level: "advanced"
protocol: "axi"
title: "AXI Waveform Review Pack"
section: "H"
order: 43
exerciseIds: ["ex-axi-waveform-debug"]
summary: "A review pack of complex AXI waveforms for diagnostic analysis."
tags:
  - axi
  - waveforms
  - review
prerequisites: []
relatedLessons: []
visualIds: ["wf-axi-throughput", "wf-axi-debug-wlast", "wf-axi-deadlock"]
glossaryTerms: []
checklistIds: []
---

# AXI Waveform Review Pack

Being able to read an AXI waveform instantly is the mark of a senior DV engineer. Review these common shapes.

## Channel-Local Progress Under a Data Stall
This comparison shows an AXI write-address channel continuing to accept requests while the W channel is stalled. It demonstrates channel independence, not a universal latency advantage or a “perfect read” trace.

![High-throughput AXI traffic](visual:wf-axi-throughput)

## The WLAST Violation
The manager asserts `WLAST` early and then omits it on the declared final beat. The first mismatch is a protocol error; the downstream symptom and recovery are implementation-dependent.

![Early WLAST violation](visual:wf-axi-debug-wlast)

## The Circular Deadlock
If you see channels frozen with `VALID` HIGH and `READY` LOW, first confirm payload stability, then trace resource and cross-channel dependencies. A long stall can be legal; this example is a liveness failure because WREADY waits for BREADY while BREADY waits for WREADY. Also check separately for prohibited combinational input-to-output paths.

![Circular backpressure deadlock](visual:wf-axi-deadlock)
