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

## The Perfect Pipelined Read
Notice how the Address channel (`AR`) runs continuously ahead of the Data channel (`R`). The master queues up multiple requests, and the slave streams the data back. This is AXI at peak throughput.

![High-throughput AXI traffic](visual:wf-axi-throughput)

## The WLAST Violation
This is a fatal protocol error. The master asserts `WLAST` early, breaking the interconnect's tracking logic.

![Early WLAST violation](visual:wf-axi-debug-wlast)

## The Circular Deadlock
If you see the channels frozen with `VALID` high and `READY` low on both sides of a Master-Slave connection, look for combinatorial loops. 

![Circular backpressure deadlock](visual:wf-axi-deadlock)
