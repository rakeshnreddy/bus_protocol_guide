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
visualIds: ["tl-axi-qos-arbitration"]
exerciseIds: []
glossaryTerms: ["QoS (Quality of Service)"]
checklistIds: []
---

When multiple masters attempt to access the same target resource simultaneously, the interconnect must choose what progresses. Round-robin and fixed priority are possible implementation policies, not AXI-mandated arbitration algorithms.

However, in complex SoCs (like a mobile phone processor), different masters have vastly different latency requirements.

## The Need for QoS

Imagine a CPU and a Display Controller sharing access to main memory.
*   If the CPU is delayed by a few microseconds, a background app loads slightly slower. It's not a big deal.
*   If the Display Controller is delayed by a few microseconds, the screen glitches or drops a frame, creating a terrible user experience.

The Display Controller has a strict, real-time deadline, so the system designer can choose a policy that gives its urgent traffic preferential service while still meeting ordering and fairness requirements.

## AWQOS and ARQOS

AXI4 introduces two 4-bit signals: `AWQOS` (Quality of Service for writes) and `ARQOS` (Quality of Service for reads).

These signals are driven with the address. Arm recommends using them as priority identifiers where a higher value indicates higher priority, but the protocol does not specify their exact use. `0x0` is the default for an interface that does not participate in a QoS scheme.

In the default higher-first system interpretation, an interconnect chooses the higher eligible QoS value when no AXI ordering rule requires another order. A tag does not guarantee an instantaneous grant, and an implementation can use a more sophisticated compatible QoS method.

The timeline answers: **when can a high QoS value influence arbitration, and when must ordering win instead?**

![Illustrative AXI4 QoS arbitration timeline showing higher-value selection, lower-value waiting, and same-ID ordering precedence](visual:tl-axi-qos-arbitration)

## Dynamic QoS

In truly advanced systems, QoS is dynamic. 
The Display Controller might have an internal FIFO. 
*   When the FIFO is full, it can drive `ARQOS = 0x2` (lower priority), allowing the configured policy to favor other eligible work.
*   As the FIFO approaches empty, it can raise `ARQOS` so the configured interconnect policy treats new display requests as more urgent. The fabric can also remap master-provided values, and it still obeys AXI ordering constraints.

Verifying dynamic QoS arbitration requires more than checking the four-bit tag: the testbench needs the configured mapping, arbitration, fairness or starvation contract, ordering constraints, and measurable latency or bandwidth goals.
