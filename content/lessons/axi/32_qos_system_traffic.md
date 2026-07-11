---
id: "32_qos_system_traffic"
title: "QoS and System-Level Traffic"
summary: "Using AWQOS and ARQOS to prioritize traffic in interconnects."
protocol: "axi"
tier: "1"
level: "expert"
order: 32
tags: ["axi", "architecture", "qos"]
relatedLessons: []
prerequisites: ["30_axi_interconnects_crossbars"]
visualIds: []
exerciseIds: []
glossaryTerms: ["QoS (Quality of Service)"]
checklistIds: []
---

When multiple masters attempt to access the same slave simultaneously, the interconnect must choose who goes first. In a basic interconnect, this is handled via a simple Round-Robin or fixed-priority arbiter.

However, in complex SoCs (like a mobile phone processor), different masters have vastly different latency requirements.

## The Need for QoS

Imagine a CPU and a Display Controller sharing access to main memory.
*   If the CPU is delayed by a few microseconds, a background app loads slightly slower. It's not a big deal.
*   If the Display Controller is delayed by a few microseconds, the screen glitches or drops a frame, creating a terrible user experience.

The Display Controller has a strict, real-time deadline. It *must* have priority.

## AWQOS and ARQOS

AXI4 introduces two 4-bit signals: `AWQOS` (Quality of Service for writes) and `ARQOS` (Quality of Service for reads).

These signals are driven by the master alongside the address. They act as a priority tag, where a higher value indicates a higher priority.

When the interconnect receives simultaneous requests, it looks at the `QOS` values. If the Display Controller drives `ARQOS = 0xF` (maximum priority) and the CPU drives `ARQOS = 0x0`, the interconnect will instantly grant access to the Display Controller.

## Dynamic QoS

In truly advanced systems, QoS is dynamic. 
The Display Controller might have an internal FIFO. 
*   When the FIFO is full, it drives `ARQOS = 0x2` (low priority), allowing the CPU to use the memory.
*   As the FIFO drains and gets dangerously close to empty, the Display Controller panics and cranks its priority up to `ARQOS = 0xF`, forcing the interconnect to drop everything and serve the display.

Verifying dynamic QoS arbitration is one of the most challenging and critical tasks in System-on-Chip verification.
